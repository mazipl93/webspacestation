export type NotificationIcon =
  | "rocket"
  | "sparkles"
  | "message"
  | "calendar";

export type NotificationItem = {
  id: string;
  icon: NotificationIcon;
  accent: string;
  title: string;
  body: string;
  time: string;
  href: string;
};

export const NOTIFICATIONS_CHANGE_EVENT = "wss:notifications-changed";

function storageKey(email: string): string {
  return `wss:notifications-read:${email}`;
}

export function getReadIds(email: string | null): Set<string> {
  if (!email || typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey(email));
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []
    );
  } catch {
    return new Set();
  }
}

function writeReadIds(email: string, ids: Set<string>) {
  try {
    window.localStorage.setItem(storageKey(email), JSON.stringify([...ids]));
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

export function isNotificationUnread(
  item: NotificationItem,
  readIds: Set<string>
): boolean {
  return !readIds.has(item.id);
}

export function hasUnreadNotifications(
  items: NotificationItem[],
  readIds: Set<string>
): boolean {
  return items.some((n) => isNotificationUnread(n, readIds));
}

export function markNotificationRead(email: string, id: string) {
  const ids = getReadIds(email);
  ids.add(id);
  writeReadIds(email, ids);
}

export function markAllNotificationsRead(email: string, ids: string[]) {
  const read = getReadIds(email);
  ids.forEach((id) => read.add(id));
  writeReadIds(email, read);
}
