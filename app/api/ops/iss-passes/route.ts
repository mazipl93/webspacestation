import { NextResponse } from "next/server";
import { getIssTleCachedAt } from "@/lib/ops/iss-orbit";
import { computeIssPolandPasses } from "@/lib/ops/iss-poland-passes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(16, Math.max(1, Number(searchParams.get("limit") ?? 4) || 4));
  const passes = await computeIssPolandPasses(limit, 72);
  const computedAt = new Date().toISOString();
  return NextResponse.json(
    { passes, computedAt, tleAt: getIssTleCachedAt() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
