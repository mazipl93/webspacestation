import { getImageProps } from "next/image";

/** Hosts for the first hero cover — keep ≤4 preconnect hints. */
export const HERO_IMAGE_PRECONNECT_ORIGINS = [
  "https://images-assets.nasa.gov",
  "https://images.unsplash.com",
] as const;

/** Matches HomepageHeroSlider CoverImage `sizes` (mobile LCP). */
export const HERO_LCP_IMAGE_SIZES = "(max-width: 640px) 100vw, 1320px";

/** Optimized `/_next/image` URL for early discovery (PageSpeed LCP). */
export function buildHeroLcpPreloadHref(imageUrl: string | undefined): string | null {
  const src = imageUrl?.trim();
  if (!src) return null;

  try {
    const { props } = getImageProps({
      src,
      alt: "",
      width: 828,
      height: 466,
      sizes: HERO_LCP_IMAGE_SIZES,
      quality: 75,
      priority: true,
    });
    return typeof props.src === "string" ? props.src : null;
  } catch {
    return null;
  }
}
