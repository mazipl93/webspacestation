import "server-only";

import { unstable_cache } from "next/cache";
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
import { PUBLISHED_ARTICLE_WHERE } from "@/lib/server/published-only";

export class ArticleWorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArticleWorkflowError";
  }
}
import {
  publishedAtPatchForStatusTransition,
  resolveCreateStatus,
  validatePublishReady,
  validateScheduleTime,
} from "@/lib/articles/workflow";
import {
  evaluateScheduledPublish,
  summarizeSchedulePublishRun,
  type SchedulePublishRunResult,
} from "@/lib/articles/schedule-publisher";

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
  status: true,
  featured: true,
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

/** All published articles, newest first. Cached under the ARTICLES tag. */
export function getPublishedArticles(): Promise<ArticleWithRelations[]> {
  return unstable_cache(
    async (): Promise<ArticleWithRelations[]> => {
      try {
        return await prisma.article.findMany({
          where: PUBLISHED_ARTICLE_WHERE,
          orderBy: [{ score: "desc" }, { publishedAt: "desc" }],
          select: articleSelect,
        });
      } catch (error) {
        console.error("[getPublishedArticles]", error);
        return [];
      }
    },
    ["published-articles"],
    { tags: [ARTICLES_TAG] }
  )();
}

/** A single published article by slug, or null if not found / not published. */
export function getPublishedArticleBySlug(
  slug: string
): Promise<ArticleWithRelations | null> {
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

/** Published articles within a category (by category slug), newest first. */
export function getArticlesByCategory(
  categorySlug: string
): Promise<ArticleWithRelations[]> {
  return unstable_cache(
    async (): Promise<ArticleWithRelations[]> => {
      try {
        return await prisma.article.findMany({
          where: {
            ...PUBLISHED_ARTICLE_WHERE,
            category: { slug: categorySlug },
          },
          orderBy: [{ score: "desc" }, { publishedAt: "desc" }],
          select: articleSelect,
        });
      } catch (error) {
        console.error("[getArticlesByCategory]", error);
        return [];
      }
    },
    ["category-articles", categorySlug],
    { tags: [ARTICLES_TAG, categoryTag(categorySlug)] }
  )();
}

/** Top published articles by News Engine score (homepage newsroom). */
export function getRankedPublishedArticles(
  limit = 20
): Promise<ArticleWithRelations[]> {
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

/** Admin listing: any status, optional status + category filters, newest first. */
export function getArticlesForAdmin(
  query: AdminArticleQuery = {}
): Promise<ArticleWithRelations[]> {
  const where: Prisma.ArticleWhereInput = {};
  if (query.status && query.status !== "ALL") {
    where.status = query.status;
  }
  if (query.categorySlug) {
    where.category = { slug: query.categorySlug };
  }
  return prisma.article.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: articleSelect,
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

/** Aggregate counts for the dashboard. */
export async function getArticleStats(): Promise<ArticleStats> {
  const [total, published, draft, review, scheduled, archived, categories] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      prisma.article.count({ where: { status: ArticleStatus.REVIEW } }),
      prisma.article.count({ where: { status: ArticleStatus.SCHEDULED } }),
      prisma.article.count({ where: { status: ArticleStatus.ARCHIVED } }),
      prisma.category.count(),
    ]);
  return { total, published, draft, review, scheduled, archived, categories };
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
 * Create an article. Status defaults to DRAFT; never inferred from content or source fields.
 * PUBLISHED on create requires publish validation (prefer publishArticle() for CMS).
 */
export async function createArticle(
  input: ArticleCreateInput,
  authorId?: string
): Promise<ArticleWithRelations> {
  const resolvedAuthorId = authorId ?? (await getDefaultAuthorId());
  const status = resolveCreateStatus(input.status);

  if (status === ArticleStatus.PUBLISHED) {
    const check = validatePublishReady({
      title: input.title,
      content: input.content,
      categoryId: input.categoryId,
    });
    if (!check.ok) throw new ArticleWorkflowError(check.message);
  }

  if (status === ArticleStatus.SCHEDULED) {
    if (!input.publishAt) {
      throw new ArticleWorkflowError(
        "Data zaplanowanej publikacji jest wymagana."
      );
    }
    const pubCheck = validatePublishReady({
      title: input.title,
      content: input.content,
      categoryId: input.categoryId,
    });
    if (!pubCheck.ok) throw new ArticleWorkflowError(pubCheck.message);
    const timeCheck = validateScheduleTime(input.publishAt);
    if (!timeCheck.ok) throw new ArticleWorkflowError(timeCheck.message);
  }

  const publishedAt =
    status === ArticleStatus.PUBLISHED ? new Date() : null;

  return prisma.article.create({
    data: {
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      content: input.content,
      contextNote: input.contextNote,
      coverImage: input.coverImage,
      status,
      featured: input.featured,
      readingTime: input.readingTime,
      tags: input.tags,
      source: input.source,
      originalUrl: input.originalUrl,
      categoryId: input.categoryId,
      authorId: resolvedAuthorId,
      contentOrigin: ArticleContentOrigin.EDITORIAL,
      publishedAt,
      publishAt: status === ArticleStatus.SCHEDULED ? input.publishAt : null,
    },
    select: articleSelect,
  });
}

/**
 * Update an article. Status changes only when explicitly passed in input.
 * No automatic workflow transitions from content, source, or contentOrigin.
 */
export async function updateArticle(
  id: string,
  input: ArticleUpdateInput
): Promise<ArticleWithRelations | null> {
  const existing = await prisma.article.findUnique({
    where: { id },
    select: {
      status: true,
      publishedAt: true,
      title: true,
      content: true,
      categoryId: true,
    },
  });
  if (!existing) return null;

  if (input.status === ArticleStatus.PUBLISHED) {
    const check = validatePublishReady({
      title: input.title ?? existing.title,
      content: input.content !== undefined ? input.content : existing.content,
      categoryId: input.categoryId ?? existing.categoryId,
    });
    if (!check.ok) throw new ArticleWorkflowError(check.message);
  }

  if (input.status === ArticleStatus.SCHEDULED) {
    const publishAt = input.publishAt;
    if (!publishAt) {
      throw new ArticleWorkflowError(
        "Data zaplanowanej publikacji jest wymagana."
      );
    }
    const pubCheck = validatePublishReady({
      title: input.title ?? existing.title,
      content: input.content !== undefined ? input.content : existing.content,
      categoryId: input.categoryId ?? existing.categoryId,
    });
    if (!pubCheck.ok) throw new ArticleWorkflowError(pubCheck.message);
    const timeCheck = validateScheduleTime(publishAt);
    if (!timeCheck.ok) throw new ArticleWorkflowError(timeCheck.message);
  }

  // HARD RULE: contentOrigin is immutable after creation (ingest → RSS, CMS create → EDITORIAL).
  const data: Prisma.ArticleUncheckedUpdateInput = { ...input };
  delete (data as { contentOrigin?: unknown }).contentOrigin;

  if (input.status !== undefined) {
    Object.assign(
      data,
      publishedAtPatchForStatusTransition(input.status, existing)
    );
    if (input.status === ArticleStatus.PUBLISHED) {
      data.publishAt = null;
    }
  }

  return prisma.article.update({
    where: { id },
    data,
    select: articleSelect,
  });
}

/**
 * Explicit publish transition — sets PUBLISHED and refreshes ranking.
 * Status-only; no heuristics.
 */
export async function publishArticle(
  id: string
): Promise<ArticleWithRelations | null> {
  const existing = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      publishedAt: true,
      title: true,
      content: true,
      categoryId: true,
    },
  });
  if (!existing) return null;

  const check = validatePublishReady({
    title: existing.title,
    content: existing.content,
    categoryId: existing.categoryId,
  });
  if (!check.ok) throw new ArticleWorkflowError(check.message);

  const article = await prisma.article.update({
    where: { id },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: existing.publishedAt ?? new Date(),
      publishAt: null,
    },
    select: articleSelect,
  });

  await refreshArticleRanking(id);
  return article;
}

/**
 * Schedule explicit publish — status SCHEDULED + future publishAt.
 * Requires publish-ready content (same guard as PUBLISHED).
 */
export async function scheduleArticle(
  id: string,
  publishAt: Date
): Promise<ArticleWithRelations | null> {
  const existing = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      categoryId: true,
    },
  });
  if (!existing) return null;

  const pubCheck = validatePublishReady({
    title: existing.title,
    content: existing.content,
    categoryId: existing.categoryId,
  });
  if (!pubCheck.ok) throw new ArticleWorkflowError(pubCheck.message);

  const timeCheck = validateScheduleTime(publishAt);
  if (!timeCheck.ok) throw new ArticleWorkflowError(timeCheck.message);

  return prisma.article.update({
    where: { id },
    data: {
      status: ArticleStatus.SCHEDULED,
      publishAt,
    },
    select: articleSelect,
  });
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

    const updated = await prisma.article.updateMany({
      where: { id: row.id, status: ArticleStatus.SCHEDULED },
      data: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: row.publishedAt ?? now,
        publishAt: null,
      },
    });

    if (updated.count === 0) continue;

    await refreshArticleRanking(row.id);
  }

  return summarizeSchedulePublishRun(results);
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
