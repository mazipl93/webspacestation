/** Cookie holding a stable UUID per browser for anonymous likes. */
export const ANON_LIKE_COOKIE = "wss_anon_like_id";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidAnonLikeId(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  const raw = match?.[1];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

/** Read existing anon id without creating one (e.g. before merge on login). */
export function getAnonLikeIdIfPresent(): string | null {
  const existing = readCookie(ANON_LIKE_COOKIE);
  return isValidAnonLikeId(existing) ? existing : null;
}

/** Stable per-browser id for anonymous like RPCs. */
export function getOrCreateAnonLikeId(): string {
  const existing = getAnonLikeIdIfPresent();
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

  writeCookie(ANON_LIKE_COOKIE, id);
  return id;
}
