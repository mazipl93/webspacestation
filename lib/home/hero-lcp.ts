import { normalizeCoverImageUrl } from "@/lib/media/cover-url";

/** Hero covers load direct (CoverImage `unoptimized`) — preconnect the active cover host. */
export const HERO_IMAGE_PRECONNECT_ORIGINS = [] as const;

/**
 * Hero `<img sizes>` — mobile 100vw, desktop up to ~1320px (sharp on large screens).
 * Preload uses a separate, smaller hint so mobile LCP stays light.
 */
export const HERO_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1320px";

/** Quality on the visible hero (desktop + mobile). Preload stays at q62. */
export const HERO_DISPLAY_QUALITY = 82;

/** Origin for preconnect — hero `<img>` loads direct from the cover CDN. */
export function getHeroPreconnectOrigin(imageUrl: string | undefined): string | null {
  const normalized = normalizeCoverImageUrl(imageUrl);
  if (!normalized) return null;
  try {
    return new URL(normalized).origin;
  } catch {
    return null;
  }
}

/** Direct cover URL for `<link rel="preload">` — must match CoverImage (unoptimized). */
export function buildHeroLcpPreloadHref(imageUrl: string | undefined): string | null {
  const src = imageUrl?.trim();
  if (!src) return null;
  return normalizeCoverImageUrl(src) ?? src;
}
