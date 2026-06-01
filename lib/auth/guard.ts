import "server-only";

import type { NextResponse } from "next/server";
import { getAuthContext, type AppUser } from "@/lib/auth/user";
import { forbidden, unauthorized } from "@/lib/server/http";

export type GuardResult =
  | { ok: true; user: AppUser }
  | { ok: false; response: NextResponse };

/**
 * Resolve the request's user and enforce a permission predicate.
 *   - no session            → 401 UNAUTHORIZED
 *   - session but no role    → 403 FORBIDDEN
 *   - predicate returns false → 403 FORBIDDEN
 */
export async function requirePermission(
  check: (user: AppUser) => boolean
): Promise<GuardResult> {
  const ctx = await getAuthContext();
  if (!ctx.authenticated) return { ok: false, response: unauthorized() };
  if (!ctx.user) return { ok: false, response: forbidden() };
  if (!check(ctx.user)) return { ok: false, response: forbidden() };
  return { ok: true, user: ctx.user };
}
