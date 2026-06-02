import { NextResponse } from "next/server";
import { requireCmsAccess } from "@/lib/auth/guard";

/** HEAD/GET — 204 when session has CMS role, 401/403 otherwise. Used by middleware. */
export async function GET() {
  const guard = await requireCmsAccess();
  if (!guard.ok) return guard.response;
  return new NextResponse(null, { status: 204 });
}

export const HEAD = GET;
