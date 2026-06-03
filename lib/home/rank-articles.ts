import type { NewsArticle } from "@/types";

/** Inputs available on published articles without new API fields. */
export type RankableArticle = Pick<
  NewsArticle,
  | "slug"
  | "publishedAt"
  | "score"
  | "readTime"
  | "isBreaking"
  | "isTopPriority"
> & {
  featured?: boolean;
  createdAt?: string;
};

export const FEATURED_RANK_BOOST = 25;
export const BREAKING_RANK_BOOST = 12;
export const RECENCY_MAX_BOOST = 20;
/** Points lost per day since publish (recency decay). */
export const RECENCY_DECAY_PER_DAY = 0.65;

export type RankArticlesOptions = {
  limit?: number;
};

function articleTimestamp(article: RankableArticle): number {
  const raw = article.createdAt ?? article.publishedAt;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

function recencyBoost(publishedAt: string, nowMs: number): number {
  const ageDays = Math.max(0, (nowMs - new Date(publishedAt).getTime()) / 86_400_000);
  return Math.max(0, RECENCY_MAX_BOOST - ageDays * RECENCY_DECAY_PER_DAY);
}

/** Composite rank: featured + score + recency decay; tie-break createdAt desc. */
export function rankScore(article: RankableArticle, nowMs = Date.now()): number {
  let total = article.score ?? 0;
  if (article.featured) total += FEATURED_RANK_BOOST;
  if (article.isTopPriority) total += BREAKING_RANK_BOOST + 8;
  else if (article.isBreaking) total += BREAKING_RANK_BOOST;
  total += recencyBoost(article.publishedAt, nowMs);
  return total;
}

export function rankArticles<T extends RankableArticle>(
  articles: T[],
  options: RankArticlesOptions = {}
): T[] {
  const { limit } = options;
  const nowMs = Date.now();

  const sorted = [...articles].sort((a, b) => {
    const diff = rankScore(b, nowMs) - rankScore(a, nowMs);
    if (diff !== 0) return diff;
    return articleTimestamp(b) - articleTimestamp(a);
  });

  return limit != null ? sorted.slice(0, limit) : sorted;
}

/** Ważne teraz — featured + score + recency. */
export function rankImportantNow<T extends RankableArticle>(
  articles: T[],
  limit = 8
): T[] {
  if (articles.length === 0) return [];
  return withSectionFallback(rankArticles(articles, { limit }), articles, limit);
}

/** Najnowsze — createdAt (fallback publishedAt) descending. */
export function rankLatest<T extends RankableArticle>(
  articles: T[],
  limit = 8
): T[] {
  if (articles.length === 0) return [];
  return [...articles]
    .sort((a, b) => articleTimestamp(b) - articleTimestamp(a))
    .slice(0, limit);
}

/**
 * Homepage section guarantee: never return empty when the pool has articles.
 * Falls back to newest-first from the full candidate pool (no score/featured gate).
 */
export function withSectionFallback<T extends RankableArticle>(
  result: T[],
  articles: T[],
  limit = 8
): T[] {
  if (articles.length === 0) return [];
  if (result.length > 0) return result.slice(0, limit);
  return rankLatest(articles, limit);
}

export type PopularRankOptions = {
  limit?: number;
  /** Optional engagement counts keyed by slug (e.g. Supabase likes). */
  engagementBySlug?: Map<string, number>;
};

function popularScore(
  article: RankableArticle,
  engagementBySlug?: Map<string, number>
): number {
  const likes = engagementBySlug?.get(article.slug) ?? 0;
  let total = likes * 8;
  total += (article.score ?? 0) * 1.5;
  total += (article.readTime ?? 0) * 0.75;
  if (article.featured) total += 10;
  if (article.isBreaking) total += 6;
  return total;
}

/** Popularne — engagement (likes proxy) + score + read time. */
export function rankPopular<T extends RankableArticle>(
  articles: T[],
  options: PopularRankOptions = {}
): T[] {
  const { limit = 8, engagementBySlug } = options;
  if (articles.length === 0) return [];
  const ranked = [...articles]
    .sort((a, b) => {
      const diff =
        popularScore(b, engagementBySlug) - popularScore(a, engagementBySlug);
      if (diff !== 0) return diff;
      return articleTimestamp(b) - articleTimestamp(a);
    })
    .slice(0, limit);
  return withSectionFallback(ranked, articles, limit);
}

export function excludeBySlugs<T extends { slug: string }>(
  articles: T[],
  used: Set<string>
): T[] {
  return articles.filter((a) => !used.has(a.slug));
}

export function markSlugsUsed<T extends { slug: string }>(
  articles: T[],
  used: Set<string>
): void {
  for (const a of articles) used.add(a.slug);
}
