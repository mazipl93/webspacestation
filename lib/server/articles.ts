import "server-only";

import { unstable_cache } from "next/cache";
import { revalidatePublicArticleCaches } from "@/lib/cache/revalidate-public-articles";
import { prisma } from "@/lib/prisma";
import { ArticleContentOrigin, ArticleStatus, Prisma, Role } from "@prisma/client";
import type {
  ArticleCreateInput,
  ArticleUpdateInput,
} from "@/lib/server/validation";
import { calculateScore } from "@/lib/news/calculateScore";
import { isExternalAggregatorArticle } from "@/lib/news/is-external-article";
import { isBreakingScore } from "@/lib/news/score-thresholds";
import {
  ARTICLES_TAG,
  CATEGORIES_TAG,
  articleTag,
  categoryTag,
} from "@/lib/cache/tags";
import { categorySlugsForDepartmentFeed } from "@/lib/categories";
import { PUBLISHED_ARTICLE_WHERE } from "@/lib/server/published-only";

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

// Shared selection — never leaks sensitive author fields (e.g. passwordHash).
const articleSelect = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  excerpt: true,
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

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  select: typeof articleSelect;
}>;

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

async function queryPublishedArticlesFromDb(): Promise<ArticleWithRelations[]> {
  try {
    const rows = await prisma.article.findMany({
      where: PUBLISHED_ARTICLE_WHERE,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      select: articleSelect,
    });
    traceArticleFetchPublic({ scope: "published-all", count: rows.length });
    return rows;
  } catch (error) {
    console.error("[getPublishedArticles]", error);
    return [];
  }
}

async function queryPublishedHeroSlidesFromDb(): Promise<ArticleWithRelations[]> {
  try {
    return await prisma.article.findMany({
      where: {
        ...PUBLISHED_ARTICLE_WHERE,
        heroPosition: { gte: 1, lte: 4 },
      },
      orderBy: [{ heroPosition: "asc" }, { publishedAt: "desc" }],
      take: 4,
      select: articleSelect,
    });
  } catch (error) {
    console.error("[getPublishedHeroSlides]", error);
    return [];
  }
}

/** CMS hero slider slots (heroPosition 1–4), ordered ASC. */
export async function getPublishedHeroSlides(): Promise<ArticleWithRelations[]> {
  const useLiveQuery = process.env.NODE_ENV === "development";
  if (useLiveQuery) {
    return queryPublishedHeroSlidesFromDb();
  }
  return unstable_cache(
    queryPublishedHeroSlidesFromDb,
    ["published-hero-slides", "v1-hero-position"],
    { tags: [ARTICLES_TAG] }
  )();
}

/** All published articles, newest first. Cached under the ARTICLES tag. */
export async function getPublishedArticles(): Promise<ArticleWithRelations[]> {
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
    ["published-articles", "v2-week-topic"],
    { tags: [ARTICLES_TAG] }
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

async function queryArticlesByCategoryFromDb(
  categorySlug: string
): Promise<ArticleWithRelations[]> {
  const slugs = categorySlugsForDepartmentFeed(categorySlug);
  try {
    const rows = await prisma.article.findMany({
      where: {
        ...PUBLISHED_ARTICLE_WHERE,
        category:
          slugs.length === 1
            ? { slug: slugs[0] }
            : { slug: { in: slugs } },
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      select: articleSelect,
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

/** Published articles within a category (by category slug), newest first. */
export async function getArticlesByCategory(
  categorySlug: string
): Promise<ArticleWithRelations[]> {
  const tick = await maybeTickScheduledPublish();
  const useLiveQuery =
    process.env.NODE_ENV === "development" ||
    (tick != null && tick.published > 0);
  if (useLiveQuery) {
    return queryArticlesByCategoryFromDb(categorySlug);
  }
  return unstable_cache(
    () => queryArticlesByCategoryFromDb(categorySlug),
    ["category-articles", categorySlug, "v2-legacy-nauka"],
    { tags: [ARTICLES_TAG, categoryTag(categorySlug)] }
  )();
}

/** Top published articles by News Engine score (homepage newsroom). */
export async function getRankedPublishedArticles(
  limit = 20
): Promise<ArticleWithRelations[]> {
  await maybeTickScheduledPublish();
  return unstable_cache(
    async (): Promise<ArticleWithRelations[]> => {
      try {
        return await prisma.article.findMany({
          where: PUBLISHED_ARTICLE_WHERE,
          orderBy: [{ score: "desc" }, { publishedAt: "desc" }],
          take: limit,
          select: articleSelect,
        });
      } catch (error) {
        console.error("[getRankedPublishedArticles]", error);
        return [];
      }
    },
    ["ranked-articles", String(limit)],
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
  if (input.weekTopic !== undefined) data.weekTopic = input.weekTopic;
  if (input.readingTime !== undefined) data.readingTime = input.readingTime;
  if (input.tags !== undefined) data.tags = input.tags;
  if (input.source !== undefined) data.source = input.source;
  if (input.originalUrl !== undefined) data.originalUrl = input.originalUrl;

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

  const article = await prisma.article.create({
    data: {
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      content: input.content,
      contextNote: input.contextNote,
      coverImage: input.coverImage,
      coverImageCredit: input.coverImageCredit,
      authorByline: input.bylineUserId ? null : input.authorByline,
      bylineUserId: input.bylineUserId,
      status: ArticleStatus.DRAFT,
      featured: input.featured,
      heroPosition: input.heroPosition ?? 0,
      weekTopic: input.weekTopic,
      readingTime: input.readingTime,
      tags: input.tags,
      source: input.source,
      originalUrl: input.originalUrl,
      categoryId: input.categoryId,
      authorId: resolvedAuthorId,
      contentOrigin: ArticleContentOrigin.EDITORIAL,
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
    select: { id: true },
  });
  if (!existing) return null;

  traceArticleWriteInput("update", input);

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

  const data = buildPrismaContentUpdateInput(input);
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

/** Recompute score/featured after manual publish (CMS moderation). */
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
  const featured =
    !isExternalAggregatorArticle(row) && isBreakingScore(score);

  await prisma.article.update({
    where: { id: articleId },
    data: { score, featured },
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
