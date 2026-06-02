import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { toSessionUser } from "@/lib/auth/session-user";

/** Server-side session probe — reads httpOnly cookies without dynamic root layout. */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = await getCurrentUser();
    return NextResponse.json({ user: toSessionUser(raw) });
  } catch {
    return NextResponse.json({ user: null });
  }
}
