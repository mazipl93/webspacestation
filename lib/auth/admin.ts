import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessCms, type UserRole } from "@/lib/auth/permissions";

/** Supabase email → Prisma CMS user role. */
export async function getUserRoleByEmail(
  email: string
): Promise<Role | null> {
  const row = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { role: true },
  });
  return row?.role ?? null;
}

export function isAdminRole(role: Role | UserRole | null | undefined): boolean {
  return role === "ADMIN";
}

export function isCmsStaffRole(role: Role | UserRole | null | undefined): boolean {
  return canAccessCms(role as UserRole | null | undefined);
}

export async function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  return isAdminRole(await getUserRoleByEmail(email));
}

export async function isCmsStaffEmail(
  email: string | null | undefined
): Promise<boolean> {
  if (!email) return false;
  return isCmsStaffRole(await getUserRoleByEmail(email));
}
