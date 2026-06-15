/** Target width for NASA Science dynamicimage CDN (RSS often ships w=768). */
const NASA_DYNAMIC_TARGET = 1920;
/** Upscale small NASA dynamic crops; downscale absurd w=4537+ before optimizer. */
const NASA_DYNAMIC_MIN = 1280;
const NASA_DYNAMIC_MAX = 2560;

function normalizeNasaScienceDynamicUrl(parsed: URL): void {
  if (
    parsed.hostname !== "assets.science.nasa.gov" ||
    !parsed.pathname.includes("/dynamicimage/")
  ) {
    return;
  }

  const w = Number.parseInt(parsed.searchParams.get("w") ?? "", 10);
  const h = Number.parseInt(parsed.searchParams.get("h") ?? "", 10);
  if (
    !Number.isFinite(w) ||
    !Number.isFinite(h) ||
    w <= 0 ||
    h <= 0
  ) {
    parsed.searchParams.set("w", String(NASA_DYNAMIC_TARGET));
    parsed.searchParams.set("h", String(Math.round((NASA_DYNAMIC_TARGET * 9) / 16)));
    return;
  }

  const maxDim = Math.max(w, h);
  if (maxDim < NASA_DYNAMIC_MIN || maxDim > NASA_DYNAMIC_MAX) {
    const scale = NASA_DYNAMIC_TARGET / maxDim;
    parsed.searchParams.set("w", String(Math.round(w * scale)));
    parsed.searchParams.set("h", String(Math.round(h * scale)));
  }
}

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
    normalizeNasaScienceDynamicUrl(parsed);
    return parsed.toString();
  } catch {
    return null;
  }
}

/** CMS uploads — already WebP ≤1920px from sharp; skip Vercel transform quota. */
export function isSupabaseStoragePublicUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      /\.supabase\.co$/i.test(parsed.hostname) &&
      parsed.pathname.includes("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

/** Patterns that must not go through `/_next/image` (quota, broken hosts, inline). */
const OPTIMIZER_BYPASS = [
  /^data:/i,
  /^blob:/i,
  // Pre-compressed CMS covers — each hero/card was burning a Vercel transform.
  (url: string) => isSupabaseStoragePublicUrl(url),
] as const;

/**
 * Route remote covers through Next.js image optimizer when it helps (RSS hotlinks).
 * Supabase article-covers and data/blob URLs are served directly.
 */
export function shouldBypassImageOptimizer(url: string): boolean {
  const normalized = normalizeCoverImageUrl(url);
  if (!normalized) return true;
  return OPTIMIZER_BYPASS.some((pattern) =>
    typeof pattern === "function" ? pattern(normalized) : pattern.test(normalized)
  );
}
