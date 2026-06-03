import "server-only";

import {
  getPublishedArticles,
  getPublishedArticleBySlug,
  getArticlesByCategory as dbGetArticlesByCategory,
  getRankedPublishedArticles,
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
  pickRelatedArticles,
} from "@/lib/article/related-articles";
import { resolveImageOrFallback } from "@/lib/articles/resolve-image";
import type { NewsArticle, NewsCategory } from "@/types";

// Public reads now come from the Prisma DB (single source of truth shared with
// the admin panel), so edits made in /admin appear on the public site. Content
// originally in data/news.json is migrated into the DB via prisma/seed.ts.

// Polish relative time label, falling back to an absolute date for older posts.
function relativeLabel(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "przed chwilą";
  if (min < 60) return `${min} min temu`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "wczoraj";
  if (days < 7) return `${days} dni temu`;
  if (days < 14) return "tydzień temu";
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Map a DB article (with relations) onto the NewsArticle shape the public UI
// expects. `featured` drives the "Najważniejsze" badge / lead-story pick.
export function toNewsArticle(a: ArticleWithRelations): NewsArticle {
  // publishedAt = CMS „Opublikuj” moment only (never RSS ingest / createdAt).
  const when =
    a.publishedAt != null
      ? new Date(a.publishedAt)
      : new Date(a.updatedAt ?? a.createdAt);
  const isRss = isRssArticle(a.contentOrigin);

  const paragraphs = a.content
    ? a.content
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
    timeLabel: relativeLabel(when),
    image,
    isBreaking:
      !isRss && (isBreakingScore(a.score ?? 0) || Boolean(a.featured)),
    isTopPriority: !isRss && isTopPriorityScore(a.score ?? 0),
    score: a.score,
    featured: a.featured,
    weekTopic: a.weekTopic,
    createdAt: new Date(a.createdAt).toISOString(),
    content: paragraphs.length > 0 ? paragraphs : undefined,
    readTime: a.readingTime ?? undefined,
    contextNote: a.contextNote?.trim()
      ? polishTypography(a.contextNote)
      : undefined,
    contentOrigin: a.contentOrigin,
    source: a.source ?? undefined,
    originalUrl: a.originalUrl ?? undefined,
    imageCredit: resolveArticleImageCredit({
      coverImageCredit: a.coverImageCredit,
      source: a.source,
      originalUrl: a.originalUrl,
      subtitle: a.subtitle,
      contentOrigin: a.contentOrigin,
    }),
    tags: a.tags?.length ? a.tags : undefined,
  };
}

export async function getAllArticles(): Promise<NewsArticle[]> {
  const articles = await getPublishedArticles();
  return articles.map(toNewsArticle);
}

/** Homepage / newsroom — top N by score, then recency. */
export async function getRankedArticles(limit = 20): Promise<NewsArticle[]> {
  const articles = await getRankedPublishedArticles(limit);
  return articles.map(toNewsArticle);
}

/** Public feed — newest by CMS publish time (Najnowsze). */
export async function getLatestArticles(limit = 40): Promise<NewsArticle[]> {
  const articles = await getPublishedArticles();
  return articles.slice(0, limit).map(toNewsArticle);
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
export async function getRelatedArticles(
  article: NewsArticle,
  count = 6
): Promise<NewsArticle[]> {
  const all = await getAllArticles();
  return pickRelatedArticles(article, all, { min: 3, max: count });
}

/** Next article in feed (newest-first), popular fallback when oldest (PR9). */
export async function getReadNextArticle(
  article: NewsArticle
): Promise<NewsArticle | null> {
  const all = await getAllArticles();
  return pickReadNext(article, all);
}
