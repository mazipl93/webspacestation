import { rankLatest } from "@/lib/home/rank-articles";
import type { NewsArticle } from "@/types";

export const HERO_SLIDE_MAX = 4;
export const HERO_AUTO_MS = 8_000;

/**
 * CMS slides (heroPosition 1–4, ASC) or newest published when no slots set.
 */
export function buildHomepageHeroSlides(
  cmsOrdered: NewsArticle[],
  allPublished: NewsArticle[],
  max = HERO_SLIDE_MAX
): NewsArticle[] {
  if (cmsOrdered.length > 0) {
    return cmsOrdered.slice(0, max);
  }
  return rankLatest(allPublished, max);
}

/** @deprecated Hero fallback uses rankLatest — kept for legacy imports. */
export function pickHeroLead(
  _important: NewsArticle[]
): NewsArticle | undefined {
  return undefined;
}
