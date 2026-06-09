import {
  CATEGORY_SLUG_ORDER,
  HOMEPAGE_DEPARTMENT_SLUGS,
} from "@/lib/categories";
import {
  getHeroSlideArticles,
  getHomepageArticles,
  getWeekTopicArticles,
} from "@/lib/articles";
import {
  buildHomepageHeroSlides,
  pickHeroLead,
} from "@/lib/home/hero-slides";
import {
  markSlugsUsed,
  pickHomepageLatest,
  rankImportantNow,
  rankLatest,
} from "@/lib/home/rank-articles";
import {
  getWeekTopicConfig,
  pickWeekTopicArticles,
  type WeekTopicConfig,
  type WeekTopicPick,
} from "@/lib/home/week-topic";
import { HOMEPAGE_LAYOUT_V2 } from "@/lib/site-layout";
import type { NewsArticle } from "@/types";

const IMPORTANT_POOL = 14;
export const HOMEPAGE_POOL_LIMIT = 80;
const LATEST_FEED_LIMIT = 12;

export type HomepageDerived = {
  heroSlides: NewsArticle[];
  latest: NewsArticle[];
  weekTopicPick: WeekTopicPick;
  weekTopicConfig: WeekTopicConfig;
  usedSlugs: Set<string>;
  naukaFeatured: NewsArticle[];
  categoryArticles: { slug: string; articles: NewsArticle[] }[];
  excludeForPopular: string[];
};

export type HomepageContent = {
  allPublished: NewsArticle[];
  derived: HomepageDerived;
};

export function buildHomepageDerived(
  allPublished: NewsArticle[],
  cmsHeroSlides: NewsArticle[],
  weekTopicPool: NewsArticle[] = allPublished
): HomepageDerived {
  const importantRanked = rankImportantNow(allPublished, IMPORTANT_POOL);
  let heroSlides = buildHomepageHeroSlides(cmsHeroSlides, importantRanked);
  if (heroSlides.length === 0) {
    const fallback =
      pickHeroLead(importantRanked) ?? rankLatest(allPublished, 1)[0];
    if (fallback) heroSlides = [fallback];
  }
  const usedSlugs = new Set<string>();
  markSlugsUsed(heroSlides, usedSlugs);

  const weekTopicConfig = getWeekTopicConfig();
  const weekTopicPick = pickWeekTopicArticles(
    weekTopicPool,
    usedSlugs,
    weekTopicConfig
  );
  markSlugsUsed(weekTopicPick.articles, usedSlugs);

  const latest = pickHomepageLatest(allPublished, LATEST_FEED_LIMIT);
  markSlugsUsed(latest, usedSlugs);

  const homepageCategorySlugs = HOMEPAGE_LAYOUT_V2
    ? HOMEPAGE_DEPARTMENT_SLUGS
    : CATEGORY_SLUG_ORDER;

  const naukaFeatured = rankLatest(
    allPublished.filter((a) => a.category === "nauka"),
    4
  );

  const categoryArticles = homepageCategorySlugs.map((slug) => {
    const fromPublished = allPublished.filter((a) => a.category === slug);
    const ranked = rankLatest(fromPublished, 4);
    return { slug, articles: ranked };
  });

  return {
    heroSlides,
    latest,
    weekTopicPick,
    weekTopicConfig,
    usedSlugs,
    naukaFeatured,
    categoryArticles,
    excludeForPopular: [...usedSlugs],
  };
}

/** Single homepage data fetch — shared by page shell (LCP preload) and ContentGrid. */
export async function loadHomepageContent(): Promise<HomepageContent> {
  const weekTopicConfig = getWeekTopicConfig();
  const [allPublished, cmsHeroSlides, weekTopicPool] = await Promise.all([
    getHomepageArticles(HOMEPAGE_POOL_LIMIT),
    getHeroSlideArticles(),
    getWeekTopicArticles(weekTopicConfig.limit),
  ]);
  return {
    allPublished,
    derived: buildHomepageDerived(
      allPublished,
      cmsHeroSlides,
      weekTopicPool
    ),
  };
}
