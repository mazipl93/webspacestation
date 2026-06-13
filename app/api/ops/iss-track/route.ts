import { NextResponse } from "next/server";
import { computeIssLiveTrack } from "@/lib/ops/iss-orbit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const track = await computeIssLiveTrack();
  if (!track) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  return NextResponse.json(track, {
    headers: {
      "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
    },
  });
}
