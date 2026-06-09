/** Slugs liked by the logged-in account on this browser (survives logout). */
const ACCOUNT_LIKED_KEY = "wss_account_liked_slugs";

function readRaw(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNT_LIKED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string" && s.length > 0);
  } catch {
    return [];
  }
}

function writeRaw(slugs: string[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ACCOUNT_LIKED_KEY, JSON.stringify(slugs));
}

export function readAccountLikedSlugs(): Set<string> {
  return new Set(readRaw());
}

export function isAccountLikedLocally(slug: string): boolean {
  return readAccountLikedSlugs().has(slug);
}

export function setAccountLikedSlug(slug: string, liked: boolean): void {
  const set = readAccountLikedSlugs();
  if (liked) set.add(slug);
  else set.delete(slug);
  writeRaw([...set]);
}

export function replaceAccountLikedSlugs(slugs: string[]): void {
  writeRaw([...new Set(slugs)]);
}
