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

function readStorageKey(email: string): string {
  return `wss:notifications-read:${email}`;
}

function dismissedStorageKey(email: string): string {
  return `wss:notifications-dismissed:${email}`;
}

function dispatchNotificationsChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGE_EVENT));
  }
}

function parseIdSet(raw: string | null): Set<string> {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []
    );
  } catch {
    return new Set();
  }
}

export function getReadIds(email: string | null): Set<string> {
  if (!email || typeof window === "undefined") return new Set();
  return parseIdSet(window.localStorage.getItem(readStorageKey(email)));
}

export function getDismissedIds(email: string | null): Set<string> {
  if (!email || typeof window === "undefined") return new Set();
  return parseIdSet(window.localStorage.getItem(dismissedStorageKey(email)));
}

function writeReadIds(email: string, ids: Set<string>) {
  try {
    window.localStorage.setItem(readStorageKey(email), JSON.stringify([...ids]));
    dispatchNotificationsChange();
  } catch {
    /* ignore */
  }
}

function writeDismissedIds(email: string, ids: Set<string>) {
  try {
    window.localStorage.setItem(
      dismissedStorageKey(email),
      JSON.stringify([...ids])
    );
    dispatchNotificationsChange();
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

/** Ukrywa alerty z listy (localStorage). Nowe starty/artykuły nadal się pojawią. */
export function clearNotifications(email: string, ids: string[]) {
  const dismissed = getDismissedIds(email);
  ids.forEach((id) => dismissed.add(id));
  writeDismissedIds(email, dismissed);
  markAllNotificationsRead(email, ids);
}
