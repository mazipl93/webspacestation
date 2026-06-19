import "server-only";

import { after } from "next/server";
import { unstable_cache } from "next/cache";
import { revalidatePublicArticleCaches } from "@/lib/cache/revalidate-public-articles";
import { prisma } from "@/lib/prisma";
import { ArticleContentOrigin, ArticleStatus, Prisma, Role } from "@prisma/client";
import type {
  ArticleCreateInput,
  ArticleUpdateInput,
} from "@/lib/server/validation";
import { calculateScore } from "@/lib/news/calculateScore";
import { validateContentKindForCategory } from "@/lib/articles/content-kind";
import {
  ARTICLES_TAG,
  CATEGORIES_TAG,
  articleTag,
  categoryTag,
} from "@/lib/cache/tags";
import { categorySlugsForDepartmentFeed } from "@/lib/categories";
import { PUBLISHED_ARTICLE_WHERE } from "@/lib/server/published-only";
import type { NewsSitemapEntry } from "@/lib/seo/sitemap-builders";
import { newsSitemapCutoff } from "@/lib/seo/sitemap-builders";
import { FRESH_CONTENT_KINDS } from "@/lib/articles/content-kind";
import { LAUNCH_TAG_PREFIX } from "@/lib/ops/launch-tag";

export class ArticleWorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArticleWorkflowError";
  }
}
import {
  actionToStatus,
  statusToAction,
  type ArticleStateAction,
} from "@/lib/articles/state-transition";
import {
  resolveCreateStatus,
  validatePublishReady,
  validateScheduleTime,
} from "@/lib/articles/workflow";
import {
  evaluateScheduledPublish,
  summarizeSchedulePublishRun,
  type SchedulePublishRunResult,
} from "@/lib/articles/schedule-publisher";
import {
  traceArticleFetchCms,
  traceArticleFetchPublic,
  traceArticleStateTransition,
  traceArticleWriteInput,
  traceArticleWriteOutput,
} from "@/lib/server/article-trace";
import { publishArticleToFacebookSafe } from "@/lib/social/facebook-publish";
import { publishArticleToInstagramSafe } from "@/lib/social/instagram-publish";

/** FB + IG can take 15–20s (IG container poll). Run after CMS response on Vercel Hobby (10s limit). */
function scheduleSocialAutoPostsOnFirstPublish(
  article: ArticleWithRelations,
): void {
  if (article.facebookPostId && article.instagramPostId) return;

  after(async () => {
    await Promise.all([
      !article.facebookPostId
        ? publishArticleToFacebookSafe(article)
        : Promise.resolve(),
      !article.instagramPostId
        ? publishArticleToInstagramSafe(article)
        : Promise.resolve(),
    ]);
  });
}

// Shared selection — never leaks sensitive author fields (e.g. passwordHash).
const articleSelect = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  excerpt: true,
  socialCardTitle: true,
  socialCardHook: true,
  content: true,
  contextNote: true,
  coverImage: true,
  coverImageCredit: true,
  authorByline: true,
  bylineUserId: true,
  bylineUser: {
    select: {
      id: true,
      name: true,
      role: true,
      avatarUrl: true,
    },
  },
  status: true,
  featured: true,
  heroPosition: true,
  weekTopicPosition: true,
  weekTopic: true,
  score: true,
  readingTime: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  publishAt: true,
  facebookPostId: true,
  facebookPostedAt: true,
  instagramPostId: true,
  instagramPostedAt: true,
  source: true,
  originalUrl: true,
  contentOrigin: true,
  contentKind: true,
  category: {
    select: {
      id: true,
      slug: true,
      name: true,
      colorTheme: true,
    },
  },
  author: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
} satisfies Prisma.ArticleSelect;

/** List/feed reads — bez `content` (setki KB na artykuł; homepage ładuje całą pulę). */
const articleListSelect = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  excerpt: true,
  contextNote: true,
  coverImage: true,
  coverImageCredit: true,
  authorByline: true,
  bylineUserId: true,
  bylineUser: articleSelect.bylineUser,
  status: true,
  featured: true,
  heroPosition: true,
  weekTopicPosition: true,
  weekTopic: true,
  score: true,
  readingTime: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  publishAt: true,
  source: true,
  originalUrl: true,
  contentOrigin: true,
  contentKind: true,
  category: articleSelect.category,
  author: articleSelect.author,
} satisfies Prisma.ArticleSelect;

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  select: typeof articleSelect;
}>;

export type ArticleListItem = Prisma.ArticleGetPayload<{
  select: typeof articleListSelect;
}>;

/** Lean rows for sitemap.xml — no schedule tick, no heavy joins. */
const sitemapArticleSelect = {
  slug: true,
  updatedAt: true,
  publishedAt: true,
} satisfies Prisma.ArticleSelect;

export type SitemapArticleEntry = Prisma.ArticleGetPayload<{
  select: typeof sitemapArticleSelect;
}>;

export type PublishedReadOptions = {
  /** Scheduled publish tick on page traffic; skip on sitemap/RSS (avoids Hobby timeouts). */
  tickSchedule?: boolean;
};

export type PaginatedArticleList = {
  items: ArticleListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const EMPTY_PAGINATED: PaginatedArticleList = {
  items: [],
  page: 1,
  pageSize: 40,
  total: 0,
  totalPages: 0,
};

function paginateMeta(
  page: number,
  pageSize: number,
  total: number,
): Pick<PaginatedArticleList, "page" | "pageSize" | "total" | "totalPages"> {
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  return { page, pageSize, total, totalPages };
}

export type CategoryRecord = Prisma.CategoryGetPayload<{
  select: {
    id: true;
    slug: true;
    name: true;
    description: true;
    colorTheme: true;
    orderIndex: true;
  };
}>;

// ─── Public reads (cached) ───────────────────────────────────────────────────
// These power the public site and are wrapped in `unstable_cache` with tags so
// ISR pages share one Data Cache entry instead of querying Prisma per request.
// Each query is wrapped in try/catch returning an empty/null result so a
// build-time prerender (or a transient DB blip) never fails — the first live
// request after deploy repopulates the cache. Mutations invalidate via
// `revalidateTag` (see app/api/articles & app/api/categories).

async function querySitemapArticlesFromDb(): Promise<SitemapArticleEntry[]> {
  try {
    return await prisma.article.findMany({
      where: PUBLISHED_ARTICLE_WHERE,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      select: sitemapArticleSelect,
    });
  } catch (error) {
    console.error("[getPublishedSitemapEntries]", error);
    return [];
  }
}

/** All published slugs for sitemap.xml — no schedule side effects. */
export async function getPublishedSitemapEntries(): Promise<SitemapArticleEntry[]> {
  return unstable_cache(
    querySitemapArticlesFromDb,
    ["published-sitemap-entries", "v1"],
    { tags: [ARTICLES_TAG] },
  )();
}

async function queryPublishedLaunchNewsFromDb(
  limit: number,
): Promise<ArticleListItem[]> {
  try {
    const rows = await prisma.article.findMany({
      where: {
        ...PUBLISHED_ARTICLE_WHERE,
        category: { slug: "misje" },
        NOT: { tags: { equals: [] } },
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 80,
      select: articleListSelect,
    });
    return rows
      .filter((row) => row.tags.some((tag) => tag.startsWith(LAUNCH_TAG_PREFIX)))
      .slice(0, limit);
  } catch (error) {
    console.error("[getPublishedLaunchNewsArticles]", error);
    return [];
  }
}

/** Published Misje articles with `launch:{id}` tag — /starty „Zapowiedzi i newsy”. */
export async function getPublishedLaunchNewsArticles(
  limit = 6,
): Promise<ArticleListItem[]> {
  return unstable_cache(
    () => queryPublishedLaunchNewsFromDb(limit),
    ["published-launch-news", String(limit), "v1"],
    { tags: [ARTICLES_TAG] },
  )();
}

const freshNewsSitemapSelect = {
  slug: true,
  title: true,
  publishedAt: true,
  contentKind: true,
  category: { select: { slug: true } },
} satisfies Prisma.ArticleSelect;

export type FreshNewsSitemapEntry = Prisma.ArticleGetPayload<{
  select: typeof freshNewsSitemapSelect;
}>;

async function queryFreshNewsSitemapEntriesFromDb(
  now: Date,
): Promise<NewsSitemapEntry[]> {
  try {
    const rows = await prisma.article.findMany({
      where: {
        ...PUBLISHED_ARTICLE_WHERE,
        contentKind: { in: [...FRESH_CONTENT_KINDS] },
        publishedAt: {
          gte: newsSitemapCutoff(now),
          lte: now,
        },
        category: { slug: { not: "nauka" } },
      },
      orderBy: [{ publishedAt: "desc" }],
      select: freshNewsSitemapSelect,
    });

    return rows
      .filter(
        (row): row is typeof row & { publishedAt: Date } => row.publishedAt != null,
      )
      .map((row) => ({
        slug: row.slug,
        title: row.title,
        publishedAt: row.publishedAt,
      }));
  } catch (error) {
    console.error("[getFreshNewsSitemapEntries]", error);
    return [];
  }
}

/** Fresh news/analysis ≤48h for Google News sitemap — excludes Nauka. */
export async function getFreshNewsSitemapEntries(
  now = new Date(),
): Promise<NewsSitemapEntry[]> {
  return queryFreshNewsSitemapEntriesFromDb(now);
}

async function queryPublishedTagsFromDb(): Promise<string[]> {
  try {
    const rows = await prisma.article.findMany({
      where: { ...PUBLISHED_ARTICLE_WHERE, NOT: { tags: { equals: [] } } },
      select: { tags: true },
    });
    const all = rows.flatMap((r) => r.tags);
    return [...new Set(all)].sort();
  } catch (error) {
    console.error("[getPublishedTags]", error);
    return [];
  }
}

/** Unique tags from all published articles — for sitemap /tag/* entries. */
export async function getPublishedTags(): Promise<string[]> {
  return unstable_cache(
    queryPublishedTagsFromDb,
    ["published-tags", "v1"],
    { tags: [ARTICLES_TAG] },
  )();
}

async function queryPublishedArticlesFromDb(): Promise<ArticleListItem[]> {
  try {
    const rows = await prisma.article.findMany({
      where: PUBLISHED_ARTICLE_WHERE,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      select: articleListSelect,
    });
    traceArticleFetchPublic({ scope: "published-all", count: rows.length });
    return rows;
  } catch (error) {
    console.error("[getPublishedArticles]", error);
    return [];
  }
}

async function queryRecentPublishedFromDb(
  limit: number
): Promise<ArticleListItem[]> {
  try {
    const rows = await prisma.article.findMany({
      where: PUBLISHED_ARTICLE_WHERE,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: limit,
      select: articleListSelect,
    });
    traceArticleFetchPublic({ scope: `recent-${limit}`, count: rows.length });
    return rows;
  } catch (error) {
    console.error("[getRecentPublishedArticles]", error);
    return [];
  }
}

async function queryPublishedHeroSlidesFromDb(): Promise<ArticleListItem[]> {
  try {
    return await prisma.article.findMany({
      where: {
        ...PUBLISHED_ARTICLE_WHERE,
        heroPosition: { gte: 1, lte: 4 },
      },
      orderBy: [{ heroPosition: "asc" }, { publishedAt: "desc" }],
      take: 4,
      select: articleListSelect,
    });
  } catch (error) {
    console.error("[getPublishedHeroSlides]", error);
    return [];
  }
}

async function queryPublishedWeekTopicSlidesFromDb(): Promise<ArticleListItem[]> {
  try {
    return await prisma.article.findMany({
      where: {
        ...PUBLISHED_ARTICLE_WHERE,
        weekTopicPosition: { gte: 1, lte: 4 },
      },
      orderBy: [{ weekTopicPosition: "asc" }, { publishedAt: "desc" }],
      take: 4,
      select: articleListSelect,
    });
  } catch (error) {
    console.error("[getPublishedWeekTopicSlides]", error);
    return [];
  }
}

/** CMS „W centrum uwagi” slots (weekTopicPosition 1–4), ordered ASC. */
export async function getPublishedWeekTopicSlides(): Promise<ArticleListItem[]> {
  const tick = await maybeTickScheduledPublish();
  const useLiveQuery =
    process.env.NODE_ENV === "development" ||
    (tick != null && tick.published > 0);
  if (useLiveQuery) {
    return queryPublishedWeekTopicSlidesFromDb();
  }
  return unstable_cache(
    queryPublishedWeekTopicSlidesFromDb,
    ["published-week-topic-slides", "v1-list-no-content"],
    { tags: [ARTICLES_TAG] }
  )();
}

/** CMS hero slider slots (heroPosition 1–4), ordered ASC. */
export async function getPublishedHeroSlides(): Promise<ArticleListItem[]> {
  const useLiveQuery = process.env.NODE_ENV === "development";
  if (useLiveQuery) {
    return queryPublishedHeroSlidesFromDb();
  }
  return unstable_cache(
    queryPublishedHeroSlidesFromDb,
    ["published-hero-slides", "v2-list-no-content"],
    { tags: [ARTICLES_TAG] }
  )();
}

/** All published articles, newest first. Cached under the ARTICLES tag. */
export async function getPublishedArticles(): Promise<ArticleListItem[]> {
  const tick = await maybeTickScheduledPublish();
  // Dev: zawsze świeże dane (unstable_cache utrudniał QA po toggle weekTopic w CMS).
  const useLiveQuery =
    process.env.NODE_ENV === "development" ||
    (tick && tick.published > 0);
  if (useLiveQuery) {
    return queryPublishedArticlesFromDb();
  }
  return unstable_cache(
    queryPublishedArticlesFromDb,
    ["published-articles", "v3-list-no-content"],
    { tags: [ARTICLES_TAG] }
  )();
}

/** Recent published articles (homepage / related pools) — bounded DB read. */
export async function getRecentPublishedArticles(
  limit = 80,
  options: PublishedReadOptions = {},
): Promise<ArticleListItem[]> {
  const tickSchedule = options.tickSchedule !== false;
  const tick = tickSchedule ? await maybeTickScheduledPublish() : null;
  const useLiveQuery =
    process.env.NODE_ENV === "development" ||
    (tick != null && tick.published > 0);
  if (useLiveQuery) {
    return queryRecentPublishedFromDb(limit);
  }
  return unstable_cache(
    () => queryRecentPublishedFromDb(limit),
    ["recent-articles", String(limit), "v1-list-no-content"],
    { tags: [ARTICLES_TAG] },
  )();
}

/** A single published article by slug, or null if not found / not published. */
export async function getPublishedArticleBySlug(
  slug: string
): Promise<ArticleWithRelations | null> {
  await maybeTickScheduledPublish();
  return unstable_cache(
    async (): Promise<ArticleWithRelations | null> => {
      try {
        return await prisma.article.findFirst({
          where: { slug, ...PUBLISHED_ARTICLE_WHERE },
          select: articleSelect,
        });
      } catch (error) {
        console.error("[getPublishedArticleBySlug]", error);
        return null;
      }
    },
    ["published-article", slug],
    { tags: [ARTICLES_TAG, articleTag(slug)] }
  )();
}

/** 301 target when `slug` was renamed in CMS (`previousSlug` on the row). */
export async function getPublishedSlugRedirect(
  slug: string,
): Promise<string | null> {
  try {
    const row = await prisma.article.findFirst({
      where: { previousSlug: slug, ...PUBLISHED_ARTICLE_WHERE },
      select: { slug: true },
    });
    return row?.slug ?? null;
  } catch (error) {
    console.error("[getPublishedSlugRedirect]", error);
    return null;
  }
}

/** Lean, uncached read for OG/share-card — FB crawlers must not hit stale cache. */
const shareCardArticleSelect = {
  slug: true,
  title: true,
  subtitle: true,
  socialCardTitle: true,
  socialCardHook: true,
  coverImage: true,
  coverImageCredit: true,
  source: true,
  originalUrl: true,
  contentOrigin: true,
  category: { select: { slug: true } },
} satisfies Prisma.ArticleSelect;

export type ShareCardArticle = Prisma.ArticleGetPayload<{
  select: typeof shareCardArticleSelect;
}>;

export async function getPublishedArticleForShareCard(
  slug: string,
): Promise<ShareCardArticle | null> {
  try {
    return await prisma.article.findFirst({
      where: { slug, ...PUBLISHED_ARTICLE_WHERE },
      select: shareCardArticleSelect,
    });
  } catch (error) {
    console.error("[getPublishedArticleForShareCard]", error);
    return null;
  }
}

async function queryArticlesByCategoryFromDb(
  categorySlug: string,
  limit?: number,
): Promise<ArticleListItem[]> {
  const where = categoryFeedWhere(categorySlug);
  try {
    const rows = await prisma.article.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      ...(limit != null ? { take: limit } : {}),
      select: articleListSelect,
    });
    traceArticleFetchPublic({
      scope: `category-${categorySlug}`,
      count: rows.length,
    });
    return rows;
  } catch (error) {
    console.error("[getArticlesByCategory]", error);
    return [];
  }
}

function categoryFeedWhere(categorySlug: string): Prisma.ArticleWhereInput {
  const slugs = categorySlugsForDepartmentFeed(categorySlug);
  return {
    ...PUBLISHED_ARTICLE_WHERE,
    category:
      slugs.length === 1
        ? { slug: slugs[0] }
        : { slug: { in: slugs } },
  };
}

async function queryPublishedArticlesPageFromDb(
  page: number,
  pageSize: number,
): Promise<PaginatedArticleList> {
  try {
    const skip = (page - 1) * pageSize;
    const [rows, total] = await Promise.all([
      prisma.article.findMany({
        where: PUBLISHED_ARTICLE_WHERE,
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        skip,
        take: pageSize,
        select: articleListSelect,
      }),
      prisma.article.count({ where: PUBLISHED_ARTICLE_WHERE }),
    ]);
    traceArticleFetchPublic({
      scope: `published-page-${page}`,
      count: rows.length,
    });
    return { items: rows, ...paginateMeta(page, pageSize, total) };
  } catch (error) {
    console.error("[getPublishedArticlesPage]", error);
    return { ...EMPTY_PAGINATED, page, pageSize };
  }
}

async function queryArticlesByCategoryPageFromDb(
  categorySlug: string,
  page: number,
  pageSize: number,
): Promise<PaginatedArticleList> {
  const where = categoryFeedWhere(categorySlug);
  try {
    const skip = (page - 1) * pageSize;
    const [rows, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        skip,
        take: pageSize,
        select: articleListSelect,
      }),
      prisma.article.count({ where }),
    ]);
    traceArticleFetchPublic({
      scope: `category-${categorySlug}-page-${page}`,
      count: rows.length,
    });
    return { items: rows, ...paginateMeta(page, pageSize, total) };
  } catch (error) {
    console.error("[getArticlesByCategoryPage]", error);
    return { ...EMPTY_PAGINATED, page, pageSize };
  }
}

/** Paginated published feed — newest first (HTML archive / SEO crawl path). */
export async function getPublishedArticlesPage(
  page: number,
  pageSize: number,
  options: PublishedReadOptions = {},
): Promise<PaginatedArticleList> {
  const safePage = Math.max(1, page);
  const tickSchedule = options.tickSchedule !== false;
  const tick = tickSchedule ? await maybeTickScheduledPublish() : null;
  const useLiveQuery =
    process.env.NODE_ENV === "development" ||
    (tick != null && tick.published > 0);
  if (useLiveQuery) {
    return queryPublishedArticlesPageFromDb(safePage, pageSize);
  }
  return unstable_cache(
    () => queryPublishedArticlesPageFromDb(safePage, pageSize),
    ["published-articles-page", String(safePage), String(pageSize), "v1"],
    { tags: [ARTICLES_TAG] },
  )();
}

/** Paginated category feed — newest first. */
export async function getArticlesByCategoryPage(
  categorySlug: string,
  page: number,
  pageSize: number,
  options: PublishedReadOptions = {},
): Promise<PaginatedArticleList> {
  const safePage = Math.max(1, page);
  const tickSchedule = options.tickSchedule !== false;
  const tick = tickSchedule ? await maybeTickScheduledPublish() : null;
  const useLiveQuery =
    process.env.NODE_ENV === "development" ||
    (tick != null && tick.published > 0);
  if (useLiveQuery) {
    return queryArticlesByCategoryPageFromDb(categorySlug, safePage, pageSize);
  }
  return unstable_cache(
    () => queryArticlesByCategoryPageFromDb(categorySlug, safePage, pageSize),
    [
      "category-articles-page",
      categorySlug,
      String(safePage),
      String(pageSize),
      "v1",
    ],
    { tags: [ARTICLES_TAG, categoryTag(categorySlug)] },
  )();
}

// ─── Tag feed ────────────────────────────────────────────────────────────────

function tagFeedWhere(tag: string | string[]): Prisma.ArticleWhereInput {
  const filter = Array.isArray(tag)
    ? { hasSome: tag }
    : { has: tag };
  return {
    ...PUBLISHED_ARTICLE_WHERE,
    tags: filter,
  };
}

async function queryArticlesByTagPageFromDb(
  tag: string | string[],
  page: number,
  pageSize: number,
): Promise<PaginatedArticleList> {
  const where = tagFeedWhere(tag);
  try {
    const skip = (page - 1) * pageSize;
    const [rows, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        skip,
        take: pageSize,
        select: articleListSelect,
      }),
      prisma.article.count({ where }),
    ]);
    traceArticleFetchPublic({ scope: `tag-${tag}-page-${page}`, count: rows.length });
    return { items: rows, ...paginateMeta(page, pageSize, total) };
  } catch (error) {
    console.error("[getArticlesByTagPage]", error);
    return { ...EMPTY_PAGINATED, page, pageSize };
  }
}

/** Paginated tag feed — newest first. Uses GIN index on articles.tags[]. */
export async function getArticlesByTagPage(
  tag: string | string[],
  page: number,
  pageSize: number,
): Promise<PaginatedArticleList> {
  const safePage = Math.max(1, page);
  const cacheKey = Array.isArray(tag) ? tag.join("|") : tag;
  if (process.env.NODE_ENV === "development") {
    return queryArticlesByTagPageFromDb(tag, safePage, pageSize);
  }
  return unstable_cache(
    () => queryArticlesByTagPageFromDb(tag, safePage, pageSize),
    ["tag-articles-page", cacheKey, String(safePage), String(pageSize), "v1"],
    { tags: [ARTICLES_TAG] },
  )();
}

// ─── Category feed ───────────────────────────────────────────────────────────

/** Published articles within a category (by category slug), newest first. */
export async function getArticlesByCategory(
  categorySlug: string,
  options: PublishedReadOptions & { limit?: number } = {},
): Promise<ArticleListItem[]> {
  const tickSchedule = options.tickSchedule !== false;
  const tick = tickSchedule ? await maybeTickScheduledPublish() : null;
  const useLiveQuery =
    process.env.NODE_ENV === "development" ||
    (tick != null && tick.published > 0);
  const limitKey = options.limit != null ? String(options.limit) : "all";
  if (useLiveQuery) {
    return queryArticlesByCategoryFromDb(categorySlug, options.limit);
  }
  return unstable_cache(
    () => queryArticlesByCategoryFromDb(categorySlug, options.limit),
    ["category-articles", categorySlug, limitKey, "v3-list-no-content"],
    { tags: [ARTICLES_TAG, categoryTag(categorySlug)] },
  )();
}

/** Top published articles by News Engine score (homepage newsroom). */
export async function getRankedPublishedArticles(
  limit = 20
): Promise<ArticleListItem[]> {
  await maybeTickScheduledPublish();
  return unstable_cache(
    async (): Promise<ArticleListItem[]> => {
      try {
        return await prisma.article.findMany({
          where: PUBLISHED_ARTICLE_WHERE,
          orderBy: [{ score: "desc" }, { publishedAt: "desc" }],
          take: limit,
          select: articleListSelect,
        });
      } catch (error) {
        console.error("[getRankedPublishedArticles]", error);
        return [];
      }
    },
    ["ranked-articles", String(limit), "v2-list-no-content"],
    { tags: [ARTICLES_TAG] }
  )();
}

/** All categories ordered by their editorial orderIndex. Cached. */
export function getCategories(): Promise<CategoryRecord[]> {
  return unstable_cache(
    async (): Promise<CategoryRecord[]> => {
      try {
        return await prisma.category.findMany({
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            colorTheme: true,
            orderIndex: true,
          },
        });
      } catch (error) {
        console.error("[getCategories]", error);
        return [];
      }
    },
    ["categories"],
    { tags: [CATEGORIES_TAG] }
  )();
}

// ─── Admin reads / mutations ─────────────────────────────────────────────────
// These are used by the (unauthenticated, Phase 3) admin API routes. They can
// return non-published content and must never be exposed without an auth guard
// once Phase 4 lands.

export interface AdminArticleQuery {
  status?: ArticleStatus | "ALL";
  categorySlug?: string;
}

/** Admin listing: any status, optional status + category filters, recently edited first. */
export async function getArticlesForAdmin(
  query: AdminArticleQuery = {}
): Promise<ArticleWithRelations[]> {
  await maybeTickScheduledPublish();
  const where: Prisma.ArticleWhereInput = {};
  if (query.status && query.status !== "ALL") {
    where.status = query.status;
  } else {
    where.status = { not: ArticleStatus.ARCHIVED };
  }
  if (query.categorySlug) {
    where.category = { slug: query.categorySlug };
  }
  return prisma.article.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: articleSelect,
  }).then((rows) => {
    traceArticleFetchCms({
      status: query.status ?? "ALL",
      count: rows.length,
    });
    return rows;
  });
}

/** Fetch any article by id, regardless of status (admin editor). */
export function getArticleById(
  id: string
): Promise<ArticleWithRelations | null> {
  return prisma.article.findUnique({
    where: { id },
    select: articleSelect,
  });
}

export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  review: number;
  scheduled: number;
  archived: number;
  categories: number;
}

/** Aggregate counts for the dashboard (single groupBy — avoids pool exhaustion). */
export async function getArticleStats(): Promise<ArticleStats> {
  const [statusGroups, categories] = await Promise.all([
    prisma.article.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.category.count(),
  ]);

  const countFor = (status: ArticleStatus) =>
    statusGroups.find((g) => g.status === status)?._count._all ?? 0;

  const published = countFor(ArticleStatus.PUBLISHED);
  const draft = countFor(ArticleStatus.DRAFT);
  const review = countFor(ArticleStatus.REVIEW);
  const scheduled = countFor(ArticleStatus.SCHEDULED);
  const archived = countFor(ArticleStatus.ARCHIVED);
  const total = published + draft + review + scheduled + archived;

  return { total, published, draft, review, scheduled, archived, categories };
}

/** Content-only Prisma patch — never applies status (workflow uses dedicated transitions). */
function buildPrismaContentUpdateInput(
  input: ArticleUpdateInput
): Prisma.ArticleUncheckedUpdateInput {
  const data: Prisma.ArticleUncheckedUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.subtitle !== undefined) data.subtitle = input.subtitle;
  if (input.excerpt !== undefined) data.excerpt = input.excerpt;
  if (input.socialCardTitle !== undefined) data.socialCardTitle = input.socialCardTitle;
  if (input.socialCardHook !== undefined) data.socialCardHook = input.socialCardHook;
  if (input.content !== undefined) data.content = input.content;
  if (input.contextNote !== undefined) data.contextNote = input.contextNote;
  if (input.coverImage !== undefined) data.coverImage = input.coverImage;
  if (input.coverImageCredit !== undefined) data.coverImageCredit = input.coverImageCredit;
  if (input.bylineUserId !== undefined) {
    data.bylineUserId = input.bylineUserId;
    if (input.bylineUserId) data.authorByline = null;
  }
  if (input.authorByline !== undefined) {
    data.authorByline = input.authorByline;
    if (input.authorByline) data.bylineUserId = null;
  }
  if (input.categoryId !== undefined) data.categoryId = input.categoryId;
  if (input.featured !== undefined) data.featured = input.featured;
  if (input.heroPosition !== undefined) data.heroPosition = input.heroPosition;
  if (input.weekTopicPosition !== undefined) {
    data.weekTopicPosition = input.weekTopicPosition;
    data.weekTopic = input.weekTopicPosition >= 1;
  } else if (input.weekTopic !== undefined) {
    data.weekTopic = input.weekTopic;
    if (!input.weekTopic) data.weekTopicPosition = 0;
  }
  if (input.readingTime !== undefined) data.readingTime = input.readingTime;
  if (input.tags !== undefined) data.tags = input.tags;
  if (input.source !== undefined) data.source = input.source;
  if (input.originalUrl !== undefined) data.originalUrl = input.originalUrl;
  if (input.contentKind !== undefined) data.contentKind = input.contentKind;

  // publishedAt — wyłącznie articleStateTransition (PUBLISH); nigdy z PATCH treści.
  delete (data as { publishedAt?: unknown }).publishedAt;

  return data;
}

export type ArticleStateTransitionInput = {
  id: string;
  action: ArticleStateAction;
  publishAt?: Date;
  /** On PUBLISH from scheduler — use planned time instead of now(). */
  publishStampAt?: Date;
};

/**
 * Single transactional status flow — DRAFT / REVIEW / PUBLISH / SCHEDULE.
 * All CMS and API status changes must go through this function.
 */
export async function articleStateTransition(
  input: ArticleStateTransitionInput
): Promise<ArticleWithRelations | null> {
  const { id, action, publishAt, publishStampAt } = input;
  const nextStatus = actionToStatus(action);

  const existing = await prisma.article.findUnique({
    where: { id },
    select: {
      status: true,
      publishedAt: true,
      title: true,
      excerpt: true,
      content: true,
      categoryId: true,
      contentKind: true,
      category: { select: { slug: true } },
    },
  });
  if (!existing) return null;

  traceArticleStateTransition(id, existing.status, action);

  if (action === "PUBLISH" || action === "SCHEDULE") {
    const pubCheck = validatePublishReady({
      title: existing.title,
      content: existing.content,
      excerpt: existing.excerpt,
      categoryId: existing.categoryId,
    });
    if (!pubCheck.ok) throw new ArticleWorkflowError(pubCheck.message);

    const kindCheck = validateContentKindForCategory(
      existing.category.slug,
      existing.contentKind,
    );
    if (!kindCheck.ok) throw new ArticleWorkflowError(kindCheck.message);
  }

  if (action === "SCHEDULE") {
    if (!publishAt) {
      throw new ArticleWorkflowError(
        "Data zaplanowanej publikacji jest wymagana."
      );
    }
    const timeCheck = validateScheduleTime(publishAt);
    if (!timeCheck.ok) throw new ArticleWorkflowError(timeCheck.message);
  }

  // Idempotent PUBLISH — „Zaktualizuj” / PATCH ze statusem PUBLISHED nie cofa daty Najnowsze.
  if (
    action === "PUBLISH" &&
    existing.status === ArticleStatus.PUBLISHED &&
    existing.publishedAt != null
  ) {
    return getArticleById(id);
  }

  const data: Prisma.ArticleUncheckedUpdateInput = {
    status: nextStatus,
  };

  if (action === "PUBLISH") {
    data.publishAt = null;
    if (existing.status !== ArticleStatus.PUBLISHED || !existing.publishedAt) {
      data.publishedAt = publishStampAt ?? new Date();
    }
  } else {
    if (existing.status === ArticleStatus.PUBLISHED) {
      data.publishedAt = null;
    }
    if (action === "SCHEDULE") {
      data.publishAt = publishAt!;
    }
  }

  const article = await prisma.article.update({
    where: { id },
    data,
    select: articleSelect,
  });

  traceArticleWriteOutput({
    id: article.id,
    status: article.status,
    coverImage: article.coverImage,
    title: article.title,
  });

  if (action === "PUBLISH") {
    await refreshArticleRanking(id);
    const isFirstPublish = existing.status !== ArticleStatus.PUBLISHED;
    if (isFirstPublish) {
      revalidatePublicArticleCaches({
        articleSlug: article.slug,
        categorySlug: article.category.slug,
      });
      scheduleSocialAutoPostsOnFirstPublish(article);
    }
  }

  return article;
}

/** First admin user id — temporary author fallback until auth exists. */
async function getDefaultAuthorId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!admin) {
    throw new Error("No admin user found. Run the seed script first.");
  }
  return admin.id;
}

/**
 * Create an article. Persists content as DRAFT, then applies workflow via
 * articleStateTransition when a non-DRAFT status is requested.
 */
export async function createArticle(
  input: ArticleCreateInput,
  authorId?: string
): Promise<ArticleWithRelations> {
  const resolvedAuthorId = authorId ?? (await getDefaultAuthorId());
  const requestedStatus = resolveCreateStatus(input.status);

  traceArticleWriteInput("create", { ...input, status: requestedStatus });

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { slug: true },
  });
  if (!category) {
    throw new ArticleWorkflowError("Nie znaleziono kategorii artykułu.");
  }
  const kindCheck = validateContentKindForCategory(
    category.slug,
    input.contentKind,
  );
  if (!kindCheck.ok) throw new ArticleWorkflowError(kindCheck.message);

  const article = await prisma.article.create({
    data: {
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      socialCardTitle: input.socialCardTitle,
      socialCardHook: input.socialCardHook,
      content: input.content,
      contextNote: input.contextNote,
      coverImage: input.coverImage,
      coverImageCredit: input.coverImageCredit,
      authorByline: input.bylineUserId ? null : input.authorByline,
      bylineUserId: input.bylineUserId,
      status: ArticleStatus.DRAFT,
      featured: input.featured,
      heroPosition: input.heroPosition ?? 0,
      weekTopicPosition: input.weekTopicPosition ?? 0,
      weekTopic:
        (input.weekTopicPosition ?? 0) >= 1 || input.weekTopic === true,
      readingTime: input.readingTime,
      tags: input.tags,
      source: input.source,
      originalUrl: input.originalUrl,
      categoryId: input.categoryId,
      authorId: resolvedAuthorId,
      contentOrigin: ArticleContentOrigin.EDITORIAL,
      contentKind: input.contentKind,
      publishedAt: null,
      publishAt: null,
    },
    select: articleSelect,
  });

  if (requestedStatus === ArticleStatus.DRAFT) {
    traceArticleWriteOutput({
      id: article.id,
      status: article.status,
      coverImage: article.coverImage,
      title: article.title,
    });
    return article;
  }

  const action = statusToAction(requestedStatus);
  if (!action) {
    throw new ArticleWorkflowError(`Nieobsługiwany status: ${requestedStatus}`);
  }

  const transitioned = await articleStateTransition({
    id: article.id,
    action,
    publishAt:
      requestedStatus === ArticleStatus.SCHEDULED
        ? (input.publishAt ?? undefined)
        : undefined,
  });

  return transitioned ?? article;
}

/**
 * Update article content fields only. Status is ignored — use workflow transitions.
 */
export async function updateArticle(
  id: string,
  input: ArticleUpdateInput
): Promise<ArticleWithRelations | null> {
  const existing = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      contentKind: true,
      categoryId: true,
      category: { select: { slug: true } },
    },
  });
  if (!existing) return null;

  traceArticleWriteInput("update", input);

  const nextContentKind = input.contentKind ?? existing.contentKind;
  if (
    input.categoryId !== undefined ||
    input.contentKind !== undefined
  ) {
    const category =
      input.categoryId !== undefined && input.categoryId !== existing.categoryId
        ? await prisma.category.findUnique({
            where: { id: input.categoryId },
            select: { slug: true },
          })
        : existing.category;
    if (!category) {
      throw new ArticleWorkflowError("Nie znaleziono kategorii artykułu.");
    }
    const kindCheck = validateContentKindForCategory(
      category.slug,
      nextContentKind,
    );
    if (!kindCheck.ok) throw new ArticleWorkflowError(kindCheck.message);
  }

  if (
    input.heroPosition !== undefined &&
    input.heroPosition >= 1 &&
    input.heroPosition <= 4
  ) {
    await prisma.article.updateMany({
      where: { heroPosition: input.heroPosition, id: { not: id } },
      data: { heroPosition: 0 },
    });
  }

  if (
    input.weekTopicPosition !== undefined &&
    input.weekTopicPosition >= 1 &&
    input.weekTopicPosition <= 4
  ) {
    await prisma.article.updateMany({
      where: { weekTopicPosition: input.weekTopicPosition, id: { not: id } },
      data: { weekTopicPosition: 0, weekTopic: false },
    });
  }

  const data = buildPrismaContentUpdateInput(input);
  if (
    input.slug !== undefined &&
    input.slug !== existing.slug
  ) {
    data.previousSlug = existing.slug;
  }
  if (Object.keys(data).length === 0) {
    return getArticleById(id);
  }

  const article = await prisma.article.update({
    where: { id },
    data,
    select: articleSelect,
  });

  traceArticleWriteOutput({
    id: article.id,
    status: article.status,
    coverImage: article.coverImage,
    title: article.title,
  });

  return article;
}

/**
 * Cron worker — publish due SCHEDULED articles idempotently.
 * Skips invalid rows without throwing (stays SCHEDULED until fixed in CMS).
 */
export async function runScheduledPublish(
  now: Date = new Date()
): Promise<SchedulePublishRunResult> {
  const due = await prisma.article.findMany({
    where: {
      status: ArticleStatus.SCHEDULED,
      publishAt: { lte: now },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      categoryId: true,
      status: true,
      publishAt: true,
      publishedAt: true,
    },
  });

  const results = due.map((row) => evaluateScheduledPublish(row));

  for (let i = 0; i < due.length; i++) {
    const row = due[i];
    const decision = results[i];
    if (!decision?.ok) continue;

    await articleStateTransition({
      id: row.id,
      action: "PUBLISH",
      publishStampAt: row.publishAt ?? undefined,
    });
  }

  if (results.some((r) => r.ok)) {
    revalidatePublicArticleCaches();
  }

  return summarizeSchedulePublishRun(results);
}

/**
 * Publish due SCHEDULED rows at most ~once per 55s (Data Cache).
 * Vercel Hobby cron cannot run every minute — this runs on site/CMS traffic instead.
 */
const scheduledPublishTick = unstable_cache(
  async (): Promise<SchedulePublishRunResult> => runScheduledPublish(),
  ["wss-scheduled-publish-tick"],
  { revalidate: 55 }
);

export async function maybeTickScheduledPublish(): Promise<SchedulePublishRunResult | null> {
  try {
    return await scheduledPublishTick();
  } catch (error) {
    console.error("[maybeTickScheduledPublish]", error);
    return null;
  }
}

/** Recompute score after manual publish (CMS moderation). */
export async function refreshArticleRanking(articleId: string): Promise<void> {
  const row = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      status: true,
      title: true,
      excerpt: true,
      source: true,
      originalUrl: true,
      publishedAt: true,
    },
  });
  if (!row || row.status !== ArticleStatus.PUBLISHED) return;

  const score = calculateScore({
    title: row.title,
    excerpt: row.excerpt,
    source: row.source,
    publishedAt: row.publishedAt,
  });
  await prisma.article.update({
    where: { id: articleId },
    data: { score },
  });
}

/** Hard delete — only rows already in ARCHIVED (trash). */
export async function permanentlyDeleteArchivedArticles(
  ids: string[]
): Promise<{ deleted: number; slugs: string[]; categorySlugs: string[] }> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return { deleted: 0, slugs: [], categorySlugs: [] };
  }

  const rows = await prisma.article.findMany({
    where: { id: { in: uniqueIds }, status: ArticleStatus.ARCHIVED },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  });

  if (rows.length === 0) {
    return { deleted: 0, slugs: [], categorySlugs: [] };
  }

  await prisma.article.deleteMany({
    where: { id: { in: rows.map((r) => r.id) } },
  });

  return {
    deleted: rows.length,
    slugs: rows.map((r) => r.slug),
    categorySlugs: [...new Set(rows.map((r) => r.category.slug))],
  };
}

/** Soft delete: move an article to ARCHIVED instead of removing the row. */
export async function archiveArticle(
  id: string
): Promise<ArticleWithRelations | null> {
  const existing = await prisma.article.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return null;

  return prisma.article.update({
    where: { id },
    data: { status: ArticleStatus.ARCHIVED, publishedAt: null },
    select: articleSelect,
  });
}
