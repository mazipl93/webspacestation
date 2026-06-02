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
  /** Initial unread flag — overridden once the user reads the item. */
  unread?: boolean;
};

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    icon: "rocket",
    accent: "#38bdf8",
    title: "Start Falcon 9 już za 2 godziny",
    body: "Misja Starlink Group 12-4 startuje z SLC-40 na Cape Canaveral.",
    time: "12 min temu",
    href: "/starty",
    unread: true,
  },
  {
    id: "n2",
    icon: "sparkles",
    accent: "#a855f7",
    title: "Nowy artykuł w kategorii Astronomia",
    body: "JWST uchwycił nowe szczegóły mgławicy w gwiazdozbiorze Oriona.",
    time: "1 godz. temu",
    href: "/aktualnosci/jwst-kosmiczna-meduza",
    unread: true,
  },
  {
    id: "n3",
    icon: "message",
    accent: "#2f6dff",
    title: "Odpowiedź na Twój komentarz",
    body: "Ktoś odpowiedział w dyskusji pod artykułem o misji Artemis II.",
    time: "5 godz. temu",
    href: "/aktualnosci/starship-flight-14-pelny-sukces",
    unread: true,
  },
  {
    id: "n4",
    icon: "calendar",
    accent: "#ffb830",
    title: "Przypomnienie o wydarzeniu",
    body: "Starship Flight 14 — okno startowe otwiera się jutro o 14:00.",
    time: "wczoraj",
    href: "/starty",
  },
];

export const NOTIFICATIONS_CHANGE_EVENT = "wss:notifications-changed";

function storageKey(email: string): string {
  return `wss:notifications-read:${email}`;
}

export function getReadIds(email: string | null): Set<string> {
  if (!email || typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey(email));
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []);
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
  if (readIds.has(item.id)) return false;
  return item.unread !== false;
}

export function hasUnreadNotifications(
  email: string | null,
  readIds: Set<string>
): boolean {
  if (!email) return false;
  return NOTIFICATIONS.some((n) => isNotificationUnread(n, readIds));
}

export function markNotificationRead(email: string, id: string) {
  const ids = getReadIds(email);
  ids.add(id);
  writeReadIds(email, ids);
}

export function markAllNotificationsRead(email: string) {
  const ids = new Set(NOTIFICATIONS.map((n) => n.id));
  writeReadIds(email, ids);
}
