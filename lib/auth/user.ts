import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser as getSupabaseUser } from "@/lib/auth/session";
import type { UserRole } from "@/lib/auth/permissions";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Maps the current Supabase session → the Prisma User record (matched by
 * email) and returns it with its role. Returns null when there is no session
 * or no matching application user.
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const supaUser = await getSupabaseUser();
  const rawEmail = supaUser?.email;
  if (!rawEmail) return null;
  const email = normalizeEmail(rawEmail);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}

export interface AuthContext {
  /** True when there is a valid Supabase session. */
  authenticated: boolean;
  /** The Supabase account email, if any (even when no Prisma user exists). */
  email: string | null;
  /** The mapped application user with role, or null if unprovisioned. */
  user: AppUser | null;
}

/**
 * Richer context that distinguishes "not signed in" (→ 401) from
 * "signed in but no app account/role" (→ 403).
 */
export async function getAuthContext(): Promise<AuthContext> {
  const supaUser = await getSupabaseUser();
  const rawEmail = supaUser?.email ?? null;
  if (!rawEmail) {
    return { authenticated: false, email: null, user: null };
  }
  const email = normalizeEmail(rawEmail);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });
  return { authenticated: true, email, user };
}
