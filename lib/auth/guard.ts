import "server-only";

import type { NextResponse } from "next/server";
import { getAuthContext, type AppUser } from "@/lib/auth/user";
import {
  canAccessCms,
  canManageUsers,
  type UserRole,
} from "@/lib/auth/permissions";
import { forbidden, unauthorized } from "@/lib/server/http";

export type GuardResult =
  | { ok: true; user: AppUser }
  | { ok: false; response: NextResponse };

/**
 * Resolve the request's user and enforce a permission predicate on their role.
 */
export async function requirePermission(
  check: (role: UserRole) => boolean
): Promise<GuardResult> {
  const ctx = await getAuthContext();
  if (!ctx.authenticated) return { ok: false, response: unauthorized() };
  if (!ctx.user) return { ok: false, response: forbidden() };
  if (!check(ctx.user.role)) return { ok: false, response: forbidden() };
  return { ok: true, user: ctx.user };
}

/** CMS panel access (AUTHOR, EDITOR, MODERATOR, ADMIN). */
export async function requireCmsAccess(): Promise<GuardResult> {
  return requirePermission(canAccessCms);
}

/** User management (ADMIN only). */
export async function requireAdmin(): Promise<GuardResult> {
  return requirePermission(canManageUsers);
}
