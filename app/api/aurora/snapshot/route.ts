import { NextResponse } from "next/server";
import { getHomepageAuroraSnapshot } from "@/lib/aurora/homepage-snapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const snapshot = await getHomepageAuroraSnapshot();
  if (!snapshot) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "private, no-store, must-revalidate",
    },
  });
}
