import { rankPopular, type RankableArticle } from "@/lib/home/rank-articles";
import type { NewsArticle, NewsCategory } from "@/types";

/** Article fields used for related / read-next (frontend only). */
export type RelatableArticle = Pick<
  NewsArticle,
  "id" | "slug" | "category" | "publishedAt" | "createdAt" | "score"
> & {
  tags?: string[];
} & Partial<Pick<RankableArticle, "featured" | "isBreaking" | "readTime">>;

export const TAG_MATCH_SCORE = 3;
export const CATEGORY_MATCH_SCORE = 2;
export const RECENCY_MAX_BIAS = 2;
export const RECENCY_BIAS_DECAY_PER_DAY = 0.05;
export const SCORE_OVERLAP_MAX = 2;

function articleTimestamp(article: RelatableArticle): number {
  const raw = article.publishedAt ?? article.createdAt;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

function normalizeTags(tags?: string[]): Set<string> {
  return new Set(
    (tags ?? [])
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
  );
}

function countCommonTags(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const tag of b) {
    if (a.has(tag)) count += 1;
  }
  return count;
}

function recencyBias(publishedAt: string, nowMs: number): number {
  const ageDays = Math.max(
    0,
    (nowMs - new Date(publishedAt).getTime()) / 86_400_000
  );
  return Math.max(0, RECENCY_MAX_BIAS - ageDays * RECENCY_BIAS_DECAY_PER_DAY);
}

/** Optional score proximity — closer editorial scores rank slightly higher. */
function scoreOverlap(a?: number, b?: number): number {
  if (a == null || b == null) return 0;
  const diff = Math.abs(a - b);
  return Math.max(0, SCORE_OVERLAP_MAX - diff * 0.2);
}

/**
 * Relatedness score: tags (+3 each) → category (+2) → recency → score overlap.
 */
export function calculateRelatedScore(
  source: RelatableArticle,
  candidate: RelatableArticle,
  nowMs = Date.now()
): number {
  if (source.id === candidate.id) return Number.NEGATIVE_INFINITY;

  const sourceTags = normalizeTags(source.tags);
  const candidateTags = normalizeTags(candidate.tags);
  const commonTags = countCommonTags(sourceTags, candidateTags);

  let total = commonTags * TAG_MATCH_SCORE;
  if (source.category === candidate.category) total += CATEGORY_MATCH_SCORE;
  total += recencyBias(candidate.createdAt ?? candidate.publishedAt, nowMs);
  total += scoreOverlap(source.score, candidate.score);

  return total;
}

export type PickRelatedOptions = {
  /** Minimum desired matches (best-effort when pool is small). */
  min?: number;
  /** Maximum matches (default 6). */
  max?: number;
};

/**
 * Rank related articles: tag overlap first, then category, then score similarity.
 */
export function pickRelatedArticles<T extends RelatableArticle>(
  source: T,
  all: T[],
  options: PickRelatedOptions = {}
): T[] {
  const { min = 3, max = 6 } = options;
  const nowMs = Date.now();
  const cap = Math.min(Math.max(max, 1), 6);

  const ranked = all
    .filter((a) => a.id !== source.id)
    .map((article) => ({
      article,
      score: calculateRelatedScore(source, article, nowMs),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return articleTimestamp(b.article) - articleTimestamp(a.article);
    })
    .map((row) => row.article);

  const result = ranked.slice(0, cap);
  if (result.length >= min || result.length === ranked.length) return result;
  return ranked.slice(0, Math.min(min, ranked.length));
}

/**
 * Next article in the published feed (newest-first), then popular fallback.
 */
export function pickReadNext<T extends RelatableArticle>(
  source: T,
  all: T[]
): T | null {
  const sorted = [...all].sort(
    (a, b) => articleTimestamp(b) - articleTimestamp(a)
  );
  const index = sorted.findIndex((a) => a.id === source.id);
  if (index === -1) return null;

  const nextInFeed = sorted[index + 1];
  if (nextInFeed) return nextInFeed;

  const others = all.filter((a) => a.id !== source.id);
  if (others.length === 0) return null;

  const [popular] = rankPopular(others, { limit: 1 });
  return popular ?? null;
}
