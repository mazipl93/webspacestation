import { NextResponse } from "next/server";
import { computeIssPolandPasses } from "@/lib/ops/iss-poland-passes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(16, Math.max(1, Number(searchParams.get("limit") ?? 4) || 4));
  const passes = await computeIssPolandPasses(limit, 72);
  return NextResponse.json(
    { passes, computedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    },
  );
}
