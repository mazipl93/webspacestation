import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import {
  archiveArticle,
  getArticleById,
  getPublishedArticleBySlug,
  refreshArticleRanking,
  updateArticle,
} from "@/lib/server/articles";
import { ArticleStatus } from "@prisma/client";
import { ARTICLES_TAG, articleTag, categoryTag } from "@/lib/cache/tags";
import {
  forbidden,
  isValidId,
  isValidSlug,
  jsonError,
  mapPrismaError,
  readJson,
} from "@/lib/server/http";
import { parseArticleUpdate } from "@/lib/server/validation";
import { requireCmsAccess, requirePermission } from "@/lib/auth/guard";
import {
  canDeleteArticle,
  canEditArticle,
  canPublishArticle,
} from "@/lib/auth/permissions";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const { slug } = await params;
    const byId = request.nextUrl.searchParams.get("byId") !== null;

    if (byId) {
      const cmsGuard = await requireCmsAccess();
      if (!cmsGuard.ok) return cmsGuard.response;

      if (!isValidId(slug)) {
        return jsonError(400, "INVALID_PARAM", "Invalid article id.");
      }
      const article = await getArticleById(slug);
      if (!article) return jsonError(404, "NOT_FOUND", "Article not found.");
      return NextResponse.json({ data: article });
    }

    if (!isValidSlug(slug)) {
      return jsonError(400, "INVALID_PARAM", "Invalid article slug.");
    }
    const article = await getPublishedArticleBySlug(slug);
    if (!article) return jsonError(404, "NOT_FOUND", "Article not found.");
    return NextResponse.json({ data: article });
  } catch (error) {
    console.error("[GET /api/articles/[slug]]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load article.");
  }
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  try {
    const guard = await requirePermission(canEditArticle);
    if (!guard.ok) return guard.response;

    const { slug: id } = await params;
    if (!isValidId(id)) {
      return jsonError(400, "INVALID_PARAM", "Invalid article id.");
    }

    const body = await readJson(request);
    if (body === undefined) {
      return jsonError(400, "INVALID_BODY", "Request body must be valid JSON.");
    }

    const parsed = parseArticleUpdate(body);
    if (!parsed.ok) {
      return jsonError(400, "VALIDATION_ERROR", parsed.message);
    }

    if (
      parsed.value.status === "PUBLISHED" &&
      !canPublishArticle(guard.user.role)
    ) {
      return forbidden();
    }

    const article = await updateArticle(id, parsed.value);
    if (!article) return jsonError(404, "NOT_FOUND", "Article not found.");

    const wasPublished =
      parsed.value.status === ArticleStatus.PUBLISHED ||
      article.status === ArticleStatus.PUBLISHED;

    if (parsed.value.status === ArticleStatus.PUBLISHED) {
      await refreshArticleRanking(article.id);
    }

    if (wasPublished || parsed.value.status === ArticleStatus.PUBLISHED) {
      revalidateTag(ARTICLES_TAG);
      revalidateTag(articleTag(article.slug));
      revalidateTag(categoryTag(article.category.slug));
    }

    return NextResponse.json({ data: article });
  } catch (error) {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    console.error("[PATCH /api/articles/[id]]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to update article.");
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const guard = await requirePermission(canDeleteArticle);
    if (!guard.ok) return guard.response;

    const { slug: id } = await params;
    if (!isValidId(id)) {
      return jsonError(400, "INVALID_PARAM", "Invalid article id.");
    }
    const article = await archiveArticle(id);
    if (!article) return jsonError(404, "NOT_FOUND", "Article not found.");

    // Archiving removes it from public feeds — invalidate the same surfaces.
    revalidateTag(ARTICLES_TAG);
    revalidateTag(articleTag(article.slug));
    revalidateTag(categoryTag(article.category.slug));

    return NextResponse.json({ data: article });
  } catch (error) {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    console.error("[DELETE /api/articles/[id]]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to archive article.");
  }
}
