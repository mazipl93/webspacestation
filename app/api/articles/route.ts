import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import {
  createArticle,
  getArticlesByCategory,
  getArticlesForAdmin,
  getPublishedArticles,
} from "@/lib/server/articles";
import { ARTICLES_TAG, articleTag, categoryTag } from "@/lib/cache/tags";
import { forbidden, isValidSlug, jsonError, mapPrismaError, readJson } from "@/lib/server/http";
import { isArticleStatus, parseArticleCreate } from "@/lib/server/validation";
import { requireCmsAccess, requirePermission } from "@/lib/auth/guard";
import {
  canCreateArticle,
  canPublishArticle,
} from "@/lib/auth/permissions";

// GET /api/articles
//   (public)  → published articles, optional ?category=slug
//   (admin)   → ?status=ALL|DRAFT|REVIEW|PUBLISHED|ARCHIVED returns any status
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const categoryParam = params.get("category");
    const statusParam = params.get("status");

    if (categoryParam !== null && !isValidSlug(categoryParam)) {
      return jsonError(400, "INVALID_PARAM", "Invalid 'category' parameter.");
    }

    if (statusParam !== null) {
      const cmsGuard = await requireCmsAccess();
      if (!cmsGuard.ok) return cmsGuard.response;

      const normalized = statusParam.toUpperCase();
      if (normalized !== "ALL" && !isArticleStatus(normalized)) {
        return jsonError(400, "INVALID_PARAM", "Invalid 'status' parameter.");
      }
      const articles = await getArticlesForAdmin({
        status: normalized === "ALL" ? "ALL" : normalized,
        categorySlug: categoryParam ?? undefined,
      });
      return NextResponse.json({ data: articles });
    }

    const articles =
      categoryParam !== null
        ? await getArticlesByCategory(categoryParam)
        : await getPublishedArticles();
    return NextResponse.json({ data: articles });
  } catch (error) {
    console.error("[GET /api/articles]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load articles.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requirePermission(canCreateArticle);
    if (!guard.ok) return guard.response;

    const body = await readJson(request);
    if (body === undefined) {
      return jsonError(400, "INVALID_BODY", "Request body must be valid JSON.");
    }

    const parsed = parseArticleCreate(body);
    if (!parsed.ok) {
      return jsonError(400, "VALIDATION_ERROR", parsed.message);
    }

    if (
      parsed.value.status === "PUBLISHED" &&
      !canPublishArticle(guard.user.role)
    ) {
      return forbidden();
    }

    const payload =
      guard.user.role === "AUTHOR"
        ? { ...parsed.value, status: "DRAFT" as const }
        : parsed.value;

    const article = await createArticle(payload, guard.user.id);

    // Bust the public ISR cache so a freshly published article appears at once.
    revalidateTag(ARTICLES_TAG);
    revalidateTag(articleTag(article.slug));
    revalidateTag(categoryTag(article.category.slug));

    return NextResponse.json({ data: article }, { status: 201 });
  } catch (error) {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    console.error("[POST /api/articles]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to create article.");
  }
}
