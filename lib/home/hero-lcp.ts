import { getImageProps } from "next/image";
import { normalizeCoverImageUrl, shouldBypassImageOptimizer } from "@/lib/media/cover-url";

/** LCP hero is served via same-origin `/_next/image` — preconnect only the active cover host. */
export const HERO_IMAGE_PRECONNECT_ORIGINS = [] as const;

/** Matches HomepageHeroSlider CoverImage `sizes` (mobile LCP). */
export const HERO_LCP_IMAGE_SIZES = "(max-width: 640px) 100vw, 640px";

export const HERO_LCP_QUALITY = 60;

/** Moto G class ~412 CSS px × 2 DPR — keep preload payload small. */
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

/** Optimized `/_next/image` URL for early discovery (PageSpeed LCP). */
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
      sizes: HERO_LCP_IMAGE_SIZES,
      quality: HERO_LCP_QUALITY,
      priority: true,
    });
    return typeof props.src === "string" ? props.src : null;
  } catch {
    return null;
  }
}
