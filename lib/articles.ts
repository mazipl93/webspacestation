import "server-only";

import {
  getPublishedArticles,
  getRecentPublishedArticles,
  getPublishedArticleBySlug,
  getPublishedHeroSlides,
  getPublishedWeekTopicArticles,
  getArticlesByCategory as dbGetArticlesByCategory,
  getRankedPublishedArticles,
  type ArticleListItem,
  type ArticleWithRelations,
} from "@/lib/server/articles";
import {
  isBreakingScore,
  isTopPriorityScore,
} from "@/lib/news/score-thresholds";
import { isRssArticle } from "@/lib/ui/article-kind";
import { resolveArticleImageCredit } from "@/lib/articles/image-credit";
import { polishTypography } from "@/lib/rss/translate";
import {
  pickReadNext,
  pickReadNextArticles,
  READ_NEXT_LIST_LIMIT,
  pickRelatedArticles,
  pickSameCategoryRelated,
} from "@/lib/article/related-articles";
import {
  pickWeaveInternalLinkCandidates,
  type InternalLinkCandidate,
} from "@/lib/article/weave-internal-links";
import { targetInternalLinkCount } from "@/lib/articles/display-content";
import { resolveImageOrFallback } from "@/lib/articles/resolve-image";
import {
  formatRelativePublishLabel,
  resolvePublicPublishTime,
} from "@/lib/articles/public-publish-time";
import { resolvePublicArticleByline } from "@/lib/article/resolve-public-byline";
import type { NewsArticle, NewsCategory } from "@/types";

// Public reads now come from the Prisma DB (single source of truth shared with
// the admin panel), so edits made in /admin appear on the public site. Content
// originally in data/news.json is migrated into the DB via prisma/seed.ts.

// Map a DB article (with relations) onto the NewsArticle shape the public UI
// expects. `featured` (CMS „Ważne”) → badge „Ważne”; `weekTopic` → „W centrum uwagi”.
export function toNewsArticle(a: ArticleWithRelations | ArticleListItem): NewsArticle {
  const when = resolvePublicPublishTime({
    status: a.status,
    publishedAt: a.publishedAt,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  });
  const isRss = isRssArticle(a.contentOrigin);

  const rawContent = "content" in a ? a.content : null;
  const paragraphs = rawContent
    ? rawContent
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  const image = resolveImageOrFallback({
    coverImage: a.coverImage,
    category: a.category.slug,
    slug: a.slug,
    contentOrigin: a.contentOrigin,
  });

  return {
    id: a.id,
    slug: a.slug,
    title: polishTypography(a.title),
    excerpt: polishTypography(a.excerpt ?? ""),
    category: a.category.slug as NewsCategory,
    publishedAt: when.toISOString(),
    timeLabel: formatRelativePublishLabel(when),
    image,
    isBreaking:
      !isRss && (isBreakingScore(a.score ?? 0) || Boolean(a.featured)),
    isTopPriority: !isRss && isTopPriorityScore(a.score ?? 0),
    score: a.score,
    featured: a.featured,
    heroPosition: a.heroPosition ?? 0,
    weekTopic: a.weekTopic,
    createdAt: new Date(a.createdAt).toISOString(),
    updatedAt: new Date(a.updatedAt).toISOString(),
    content: paragraphs.length > 0 ? paragraphs : undefined,
    readTime: a.readingTime ?? undefined,
    contextNote: a.contextNote?.trim()
      ? polishTypography(a.contextNote)
      : undefined,
    contentOrigin: a.contentOrigin,
    source: a.source ?? undefined,
    originalUrl: a.originalUrl ?? undefined,
    coverImageCredit: a.coverImageCredit?.trim() || undefined,
    imageCredit: resolveArticleImageCredit({
      coverImageCredit: a.coverImageCredit,
      source: a.source,
      originalUrl: a.originalUrl,
      subtitle: a.subtitle,
      contentOrigin: a.contentOrigin,
    }),
    authorByline: a.authorByline?.trim() || undefined,
    publicByline: resolvePublicArticleByline(a),
    tags: a.tags?.length ? a.tags : undefined,
  };
}

export async function getAllArticles(): Promise<NewsArticle[]> {
  const articles = await getPublishedArticles();
  return articles.map(toNewsArticle);
}

/** Homepage editorial pool — recent N rows, not the full archive. */
export async function getHomepageArticles(
  limit = 80
): Promise<NewsArticle[]> {
  const articles = await getRecentPublishedArticles(limit);
  return articles.map(toNewsArticle);
}

/** Related / read-next pool on article pages — bounded list query. */
export async function getRelatedArticlePool(
  limit = 50
): Promise<NewsArticle[]> {
  const articles = await getRecentPublishedArticles(limit);
  return articles.map(toNewsArticle);
}

/** CMS hero slots (heroPosition 1–4), ordered ASC. */
export async function getHeroSlideArticles(): Promise<NewsArticle[]> {
  const rows = await getPublishedHeroSlides();
  return rows.map(toNewsArticle);
}

/** CMS weekTopic flag — sekcja „W centrum uwagi”, newest first. */
export async function getWeekTopicArticles(limit = 8): Promise<NewsArticle[]> {
  const rows = await getPublishedWeekTopicArticles(limit);
  return rows.map(toNewsArticle);
}

/** Homepage / newsroom — top N by score, then recency. */
export async function getRankedArticles(limit = 20): Promise<NewsArticle[]> {
  const articles = await getRankedPublishedArticles(limit);
  return articles.map(toNewsArticle);
}

/** Public feed — newest by CMS publish time (Najnowsze). */
export async function getLatestArticles(limit = 40): Promise<NewsArticle[]> {
  const articles = await getRecentPublishedArticles(limit);
  return articles.map(toNewsArticle);
}

export async function getAllSlugs(): Promise<string[]> {
  const articles = await getPublishedArticles();
  return articles.map((a) => a.slug);
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const article = await getPublishedArticleBySlug(slug);
  return article ? toNewsArticle(article) : null;
}

export async function getArticlesByCategory(
  category: string
): Promise<NewsArticle[]> {
  const articles = await dbGetArticlesByCategory(category);
  return articles.map(toNewsArticle);
}

/**
 * Up to `count` related articles — tag overlap, category, score similarity (PR9).
 */
type ArticlePoolOptions = { pool?: NewsArticle[] };

async function resolveArticlePool(pool?: NewsArticle[]): Promise<NewsArticle[]> {
  return pool ?? getRelatedArticlePool();
}

export async function getRelatedArticles(
  article: NewsArticle,
  count = 6,
  options: ArticlePoolOptions = {}
): Promise<NewsArticle[]> {
  const all = await resolveArticlePool(options.pool);
  return pickRelatedArticles(article, all, { min: 3, max: count });
}

/**
 * Candidates for automatic in-body links (rule-based ranking, no AI).
 * Excludes ids already used in read-next / sidebar when passed via `excludeIds`.
 */
export async function getWeaveInternalLinkCandidates(
  article: NewsArticle,
  options: { excludeIds?: Iterable<string>; limit?: number; pool?: NewsArticle[] } = {}
): Promise<InternalLinkCandidate[]> {
  const limit = options.limit ?? targetInternalLinkCount(article);
  if (limit <= 0) return [];

  const all = await resolveArticlePool(options.pool);
  const picked = pickWeaveInternalLinkCandidates(article, all, limit, {
    excludeIds: options.excludeIds,
  });

  return picked.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
  }));
}

/** Three related articles from the same category (in-body „Czytaj również”). */
export async function getSameCategoryRelatedArticles(
  article: NewsArticle,
  count = 3,
  options: ArticlePoolOptions = {}
): Promise<NewsArticle[]> {
  const all = await resolveArticlePool(options.pool);
  return pickSameCategoryRelated(article, all, count);
}

/** Next article in feed (newest-first), popular fallback when oldest (PR9). */
export async function getReadNextArticle(
  article: NewsArticle,
  options: ArticlePoolOptions = {}
): Promise<NewsArticle | null> {
  const all = await resolveArticlePool(options.pool);
  return pickReadNext(article, all);
}

/** Kilka propozycji „Czytaj dalej” — ten sam dział preferowany (PR9 + UI lista). */
export async function getReadNextArticles(
  article: NewsArticle,
  count = READ_NEXT_LIST_LIMIT,
  options: ArticlePoolOptions = {}
): Promise<NewsArticle[]> {
  const all = await resolveArticlePool(options.pool);
  return pickReadNextArticles(article, all, { limit: count });
}
