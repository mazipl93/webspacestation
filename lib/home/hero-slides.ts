import { isRssArticle } from "@/lib/ui/article-kind";
import type { NewsArticle } from "@/types";

export const HERO_SLIDE_MAX = 4;
export const HERO_AUTO_MS = 8_000;

/** Legacy lead pick when no CMS heroPosition slots are set. */
export function pickHeroLead(important: NewsArticle[]): NewsArticle | undefined {
  const editorial = (a: NewsArticle) => !isRssArticle(a.contentOrigin);
  return (
    important.find((a) => editorial(a) && a.isTopPriority) ??
    important.find((a) => editorial(a)) ??
    important[0]
  );
}

/**
 * CMS slides (heroPosition 1–4, ASC) or fallback pool (lead + important).
 */
export function buildHomepageHeroSlides(
  cmsOrdered: NewsArticle[],
  importantPool: NewsArticle[],
  max = HERO_SLIDE_MAX
): NewsArticle[] {
  if (cmsOrdered.length > 0) {
    return cmsOrdered.slice(0, max);
  }

  const seen = new Set<string>();
  const slides: NewsArticle[] = [];
  const lead = pickHeroLead(importantPool);
  if (lead) {
    slides.push(lead);
    seen.add(lead.id);
  }
  for (const article of importantPool) {
    if (slides.length >= max) break;
    if (seen.has(article.id)) continue;
    slides.push(article);
    seen.add(article.id);
  }
  return slides;
}
