import { NextResponse } from "next/server";
import { getHomepageAuroraSnapshot } from "@/lib/aurora/homepage-snapshot";

export const revalidate = 60;

export async function GET() {
  const snapshot = await getHomepageAuroraSnapshot();
  if (!snapshot) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
