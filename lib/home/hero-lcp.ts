import { getImageProps } from "next/image";
import {
  getAllArticles,
  getHeroSlideArticles,
} from "@/lib/articles";
import {
  buildHomepageHeroSlides,
  pickHeroLead,
} from "@/lib/home/hero-slides";
import { rankImportantNow, rankLatest } from "@/lib/home/rank-articles";

const HERO_LCP_SIZES = "(max-width: 1024px) 100vw, min(100vw, 900px)";

/** Hosts often used for hero covers — preconnect in root layout. */
export const HERO_IMAGE_PRECONNECT_ORIGINS = [
  "https://cdn.mos.cms.futurecdn.net",
  "https://www.esa.int",
  "https://images.unsplash.com",
  "https://www.nasa.gov",
  "https://www.space.com",
] as const;

/**
 * Same hero slide as ContentGrid — for LCP preload in app/page (cached reads).
 */
export async function resolveHomepageLcpImageUrl(): Promise<string | null> {
  const [allPublished, cmsHeroSlides] = await Promise.all([
    getAllArticles(),
    getHeroSlideArticles(),
  ]);
  if (allPublished.length === 0) return null;

  const importantRanked = rankImportantNow(allPublished, 14);
  let heroSlides = buildHomepageHeroSlides(cmsHeroSlides, importantRanked);
  if (heroSlides.length === 0) {
    const fallback =
      pickHeroLead(importantRanked) ?? rankLatest(allPublished, 1)[0];
    if (fallback) heroSlides = [fallback];
  }

  const src = heroSlides[0]?.image?.trim();
  return src || null;
}

/** Optimized `/_next/image` URL aligned with homepage hero CoverImage. */
export function buildHomepageHeroPreloadHref(imageUrl: string): string {
  const { props } = getImageProps({
    src: imageUrl,
    alt: "",
    width: 900,
    height: 506,
    sizes: HERO_LCP_SIZES,
    quality: 75,
  });
  return typeof props.src === "string" ? props.src : imageUrl;
}

export function originFromImageUrl(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}
