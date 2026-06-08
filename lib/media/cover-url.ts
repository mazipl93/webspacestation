/**
 * Normalize cover URLs pasted in CMS (protocol, whitespace).
 * Returns null when the value cannot be treated as a remote image URL.
 */
export function normalizeCoverImageUrl(
  raw: string | null | undefined
): string | null {
  let u = raw?.trim() ?? "";
  if (!u) return null;

  if (u.startsWith("//")) {
    u = `https:${u}`;
  } else if (!/^https?:\/\//i.test(u)) {
    if (/^(www\.|[\w-]+\.[\w.-]+)/i.test(u)) {
      u = `https://${u}`;
    } else {
      return null;
    }
  }

  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Only these patterns are known to break via `/_next/image` on Vercel. */
const OPTIMIZER_BYPASS = [
  /^data:/i,
  /^blob:/i,
] as const;

/**
 * Route remote covers through Next.js image optimizer by default (WebP/AVIF, resize).
 * RSS hotlinks (nasa.gov, theverge.com, wp.com, …) were loading multi‑MB originals in browser.
 */
export function shouldBypassImageOptimizer(url: string): boolean {
  const normalized = normalizeCoverImageUrl(url);
  if (!normalized) return true;
  return OPTIMIZER_BYPASS.some((pattern) => pattern.test(normalized));
}
