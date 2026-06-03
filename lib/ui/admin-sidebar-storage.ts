export const ADMIN_SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

export function parseSidebarCollapsed(stored: string | null): boolean {
  return stored === "true";
}

export function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return parseSidebarCollapsed(
      window.localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY)
    );
  } catch {
    return false;
  }
}

export function writeSidebarCollapsed(collapsed: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ADMIN_SIDEBAR_COLLAPSED_KEY,
      collapsed ? "true" : "false"
    );
  } catch {
    // ignore quota / private mode
  }
}
