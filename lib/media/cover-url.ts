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

/** Hosts where Next.js optimizer is reliable for article covers. */
const OPTIMIZER_TRUSTED = [
  /supabase\.co\/storage\/v1\/object\/public\/article-covers\//i,
  /images-assets\.nasa\.gov/i,
  /images-api\.nasa\.gov/i,
  /assets\.science\.nasa\.gov/i,
  /(?:www\.)?esa\.int/i,
  /images\.unsplash\.com/i,
];

/**
 * External / pasted URLs often fail via `/_next/image` (hotlink, PNG, auth).
 * Load directly in the browser unless the URL is from our bucket or NASA CDN.
 */
export function shouldBypassImageOptimizer(url: string): boolean {
  const normalized = normalizeCoverImageUrl(url);
  if (!normalized) return true;
  return !OPTIMIZER_TRUSTED.some((pattern) => pattern.test(normalized));
}
