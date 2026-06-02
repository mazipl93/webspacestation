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
import { isExternalAggregatorArticle } from "@/lib/news/is-external-article";
import { pickCategoryCoverFallback } from "@/lib/cover-fallbacks";
import { polishTypography } from "@/lib/rss/translate";
import { SEARCH_FALLBACK_IMAGE } from "@/lib/search";
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
  // `when` may arrive as a Date (direct Prisma) or an ISO string (after the
  // unstable_cache Data Cache round-trips the value), so coerce defensively.
  const when = new Date(a.publishedAt ?? a.createdAt);
  const external = isExternalAggregatorArticle({
    source: a.source,
    originalUrl: a.originalUrl,
  });

  const paragraphs = a.content
    ? a.content
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  const cover =
    a.coverImage?.trim() ||
    (external
      ? pickCategoryCoverFallback(a.category.slug, a.slug)
      : SEARCH_FALLBACK_IMAGE);

  return {
    id: a.id,
    slug: a.slug,
    title: polishTypography(a.title),
    excerpt: polishTypography(a.excerpt ?? ""),
    category: a.category.slug as NewsCategory,
    publishedAt: when.toISOString(),
    timeLabel: relativeLabel(when),
    imageUrl: cover,
    isBreaking:
      !external && (isBreakingScore(a.score ?? 0) || Boolean(a.featured)),
    isTopPriority: !external && isTopPriorityScore(a.score ?? 0),
    score: a.score,
    content: paragraphs.length > 0 ? paragraphs : undefined,
    readTime: a.readingTime ?? undefined,
    source: a.source ?? undefined,
    originalUrl: a.originalUrl ?? undefined,
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
 * Up to `count` related articles: same category first, then fill from others.
 * The source article itself is excluded.
 */
export async function getRelatedArticles(
  article: NewsArticle,
  count = 3
): Promise<NewsArticle[]> {
  const all = await getAllArticles();
  const sameCategory = all.filter(
    (a) => a.id !== article.id && a.category === article.category
  );
  const otherCategory = all.filter(
    (a) => a.id !== article.id && a.category !== article.category
  );
  return [...sameCategory, ...otherCategory].slice(0, count);
}
