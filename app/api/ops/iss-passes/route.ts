import { NextResponse } from "next/server";
import { getIssTleCachedAt } from "@/lib/ops/iss-orbit";
import { computeIssPolandPasses } from "@/lib/ops/iss-poland-passes";
import { fetchN2yoVisualPasses } from "@/lib/ops/iss-passes-n2yo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(16, Math.max(1, Number(searchParams.get("limit") ?? 8) || 8));

  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const observer =
    latParam && lonParam
      ? { lat: parseFloat(latParam), lon: parseFloat(lonParam) }
      : undefined;

  // Primary: N2YO API (weryfikowane dane widocznych przelotów)
  const n2yoPasses = await fetchN2yoVisualPasses(limit, 10, 10, observer);

  if (n2yoPasses !== null) {
    return NextResponse.json(
      {
        passes: n2yoPasses,
        computedAt: new Date().toISOString(),
        source: "n2yo",
      },
      {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
      },
    );
  }

  // Fallback: lokalne SGP4 gdy brak klucza N2YO lub błąd API
  const passes = await computeIssPolandPasses(limit, 240, true, observer);
  return NextResponse.json(
    {
      passes,
      computedAt: new Date().toISOString(),
      tleAt: getIssTleCachedAt(),
      source: "sgp4",
    },
    {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    },
  );
}
