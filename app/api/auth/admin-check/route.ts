import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";

/** HEAD/GET — 204 when session has ADMIN role, 401/403 otherwise. Used by middleware. */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  return new NextResponse(null, { status: 204 });
}

export const HEAD = GET;
