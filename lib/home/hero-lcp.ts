import { getImageProps } from "next/image";
import { normalizeCoverImageUrl, shouldBypassImageOptimizer } from "@/lib/media/cover-url";

/** LCP hero is served via same-origin `/_next/image` — preconnect only the active cover host. */
export const HERO_IMAGE_PRECONNECT_ORIGINS = [] as const;

/**
 * Hero `<img sizes>` — mobile 100vw, desktop up to ~1320px (sharp on large screens).
 * Preload uses a separate, smaller hint so mobile LCP stays light.
 */
export const HERO_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1320px";

/** Quality on the visible hero (desktop + mobile). */
export const HERO_DISPLAY_QUALITY = 74;

/** Preload hint only — tuned for Moto G LCP, not desktop sharpness. */
const HERO_LCP_PRELOAD_SIZES = "(max-width: 640px) 100vw, 640px";
const HERO_LCP_PRELOAD_QUALITY = 62;
const HERO_LCP_PRELOAD_WIDTH = 640;

/** Origin for preconnect when the hero cover is fetched unoptimized (rare). */
export function getHeroPreconnectOrigin(imageUrl: string | undefined): string | null {
  const normalized = normalizeCoverImageUrl(imageUrl);
  if (!normalized || !shouldBypassImageOptimizer(normalized)) return null;
  try {
    return new URL(normalized).origin;
  } catch {
    return null;
  }
}

/** Optimized `/_next/image` URL for early discovery (PageSpeed mobile LCP). */
export function buildHeroLcpPreloadHref(imageUrl: string | undefined): string | null {
  const src = imageUrl?.trim();
  if (!src) return null;

  if (shouldBypassImageOptimizer(src)) {
    return normalizeCoverImageUrl(src);
  }

  try {
    const { props } = getImageProps({
      src,
      alt: "",
      width: HERO_LCP_PRELOAD_WIDTH,
      height: Math.round((HERO_LCP_PRELOAD_WIDTH * 9) / 16),
      sizes: HERO_LCP_PRELOAD_SIZES,
      quality: HERO_LCP_PRELOAD_QUALITY,
      priority: true,
    });
    return typeof props.src === "string" ? props.src : null;
  } catch {
    return null;
  }
}
