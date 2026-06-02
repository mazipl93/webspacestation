// Client-safe RBAC — role is the single source of truth for access decisions.

export type UserRole =
  | "USER"
  | "AUTHOR"
  | "EDITOR"
  | "MODERATOR"
  | "ADMIN";

export interface PermissionUser {
  role: UserRole;
}

function hasRole(
  role: UserRole | null | undefined,
  allowed: UserRole[]
): boolean {
  return Boolean(role && allowed.includes(role));
}

/** Portal-only account (read, comments) — no CMS. */
export function isUserRole(role: UserRole | null | undefined): boolean {
  return role === "USER";
}

/** Any CMS panel access (not USER). */
export function canAccessCms(role: UserRole | null | undefined): boolean {
  return hasRole(role, ["AUTHOR", "EDITOR", "MODERATOR", "ADMIN"]);
}

export function canCreateArticle(role: UserRole | null | undefined): boolean {
  return hasRole(role, ["AUTHOR", "EDITOR", "ADMIN"]);
}

export function canEditArticle(role: UserRole | null | undefined): boolean {
  return hasRole(role, ["EDITOR", "MODERATOR", "ADMIN"]);
}

export function canPublishArticle(role: UserRole | null | undefined): boolean {
  return hasRole(role, ["EDITOR", "ADMIN"]);
}

export function canDeleteArticle(role: UserRole | null | undefined): boolean {
  return hasRole(role, ["ADMIN"]);
}

export function canModerateComments(role: UserRole | null | undefined): boolean {
  return hasRole(role, ["MODERATOR", "ADMIN"]);
}

export function canManageUsers(role: UserRole | null | undefined): boolean {
  return hasRole(role, ["ADMIN"]);
}

export function canManageCategories(role: UserRole | null | undefined): boolean {
  return hasRole(role, ["ADMIN"]);
}
