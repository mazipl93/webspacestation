import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, Prisma, Role } from "@prisma/client";
import type {
  ArticleCreateInput,
  ArticleUpdateInput,
} from "@/lib/server/validation";
import {
  ARTICLES_TAG,
  CATEGORIES_TAG,
  articleTag,
  categoryTag,
} from "@/lib/cache/tags";

// Shared selection — never leaks sensitive author fields (e.g. passwordHash).
const articleSelect = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  excerpt: true,
  content: true,
  coverImage: true,
  status: true,
  featured: true,
  readingTime: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
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
          where: { status: ArticleStatus.PUBLISHED },
          orderBy: { publishedAt: "desc" },
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
          where: { slug, status: ArticleStatus.PUBLISHED },
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
            status: ArticleStatus.PUBLISHED,
            category: { slug: categorySlug },
          },
          orderBy: { publishedAt: "desc" },
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
  archived: number;
  categories: number;
}

/** Aggregate counts for the dashboard. */
export async function getArticleStats(): Promise<ArticleStats> {
  const [total, published, draft, review, archived, categories] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      prisma.article.count({ where: { status: ArticleStatus.REVIEW } }),
      prisma.article.count({ where: { status: ArticleStatus.ARCHIVED } }),
      prisma.category.count(),
    ]);
  return { total, published, draft, review, archived, categories };
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
 * Create an article. If status is PUBLISHED, publishedAt is stamped.
 * The author defaults to the first admin when no authorId is supplied.
 */
export async function createArticle(
  input: ArticleCreateInput,
  authorId?: string
): Promise<ArticleWithRelations> {
  const resolvedAuthorId = authorId ?? (await getDefaultAuthorId());
  return prisma.article.create({
    data: {
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      content: input.content,
      coverImage: input.coverImage,
      status: input.status,
      featured: input.featured,
      readingTime: input.readingTime,
      categoryId: input.categoryId,
      authorId: resolvedAuthorId,
      publishedAt:
        input.status === ArticleStatus.PUBLISHED ? new Date() : null,
    },
    select: articleSelect,
  });
}

/**
 * Update an article. Transitioning into PUBLISHED stamps publishedAt (once);
 * leaving PUBLISHED clears it.
 */
export async function updateArticle(
  id: string,
  input: ArticleUpdateInput
): Promise<ArticleWithRelations | null> {
  const existing = await prisma.article.findUnique({
    where: { id },
    select: { status: true, publishedAt: true },
  });
  if (!existing) return null;

  // Unchecked input lets us pass categoryId as a scalar FK directly.
  const data: Prisma.ArticleUncheckedUpdateInput = { ...input };

  if (input.status !== undefined) {
    if (input.status === ArticleStatus.PUBLISHED && !existing.publishedAt) {
      data.publishedAt = new Date();
    } else if (input.status !== ArticleStatus.PUBLISHED) {
      data.publishedAt = null;
    }
  }

  return prisma.article.update({
    where: { id },
    data,
    select: articleSelect,
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
