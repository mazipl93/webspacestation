import type { UserRole } from "@/lib/auth/permissions";

const LABELS: Record<UserRole, string> = {
  USER: "Użytkownik portalu",
  AUTHOR: "Autor",
  EDITOR: "Redaktor",
  MODERATOR: "Moderator",
  ADMIN: "Administrator",
};

export function cmsRoleLabel(role: UserRole | string): string {
  return LABELS[role as UserRole] ?? role;
}
