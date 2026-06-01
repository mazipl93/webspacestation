// Client-safe RBAC rules. No server-only / Prisma imports here so these
// helpers can run in both API routes and client components.

export type UserRole = "ADMIN" | "EDITOR" | "AUTHOR";

export interface PermissionUser {
  role: UserRole;
}

function hasRole(
  user: PermissionUser | null | undefined,
  roles: UserRole[]
): boolean {
  return Boolean(user && roles.includes(user.role));
}

// ─── Article permissions ─────────────────────────────────────────────────────
// ADMIN  → full access
// EDITOR → create + edit + publish (no delete)
// AUTHOR → create drafts only

export function canCreateArticle(user: PermissionUser | null | undefined): boolean {
  return hasRole(user, ["ADMIN", "EDITOR", "AUTHOR"]);
}

export function canEditArticle(user: PermissionUser | null | undefined): boolean {
  return hasRole(user, ["ADMIN", "EDITOR"]);
}

export function canPublishArticle(user: PermissionUser | null | undefined): boolean {
  return hasRole(user, ["ADMIN", "EDITOR"]);
}

export function canDeleteArticle(user: PermissionUser | null | undefined): boolean {
  return hasRole(user, ["ADMIN"]);
}

// ─── Category permissions ────────────────────────────────────────────────────
// ADMIN only.

export function canManageCategories(
  user: PermissionUser | null | undefined
): boolean {
  return hasRole(user, ["ADMIN"]);
}
