// Device-local record of which articles this browser has already liked.
// The authoritative like *count* lives in the Supabase `article_likes` table
// (see hooks/useArticleLikes); this layer only prevents the same device from
// inflating the count and lets us render a "już polubiono" state.

const STORAGE_KEY = "wss:liked";

// Same-tab sync channel (the native "storage" event only fires across tabs).
export const LIKES_CHANGE_EVENT = "wss:liked-changed";

export function getLikedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function hasLikedLocal(slug: string): boolean {
  return getLikedSlugs().includes(slug);
}

export function addLikedLocal(slug: string): void {
  if (typeof window === "undefined") return;
  const current = getLikedSlugs();
  if (current.includes(slug)) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, slug]));
    window.dispatchEvent(new Event(LIKES_CHANGE_EVENT));
  } catch {
    /* storage unavailable — no-op */
  }
}
