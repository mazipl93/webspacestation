import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicArticleCaches } from "@/lib/cache/revalidate-public-articles";

import {
  createArticle,
  getArticlesByCategory,
  getArticlesForAdmin,
  getPublishedArticles,
  ArticleWorkflowError,
} from "@/lib/server/articles";
import { validatePublishReady } from "@/lib/articles/workflow";
import { ARTICLES_TAG } from "@/lib/cache/tags";
import { forbidden, isValidSlug, jsonError, mapPrismaError, readJson } from "@/lib/server/http";
import { isArticleStatus, parseArticleCreate } from "@/lib/server/validation";
import { requireCmsAccess, requirePermission } from "@/lib/auth/guard";
import {
  canCreateArticle,
  canPublishArticle,
} from "@/lib/auth/permissions";
import { withAiScores } from "@/lib/ai/enrich-response";
import {
  traceArticleApiResponse,
  traceArticleFetchCms,
  traceArticleFetchPublic,
} from "@/lib/server/article-trace";

// GET /api/articles
//   (public)  → PUBLISHED only, optional ?category=slug (never ?status without CMS auth)
//   (admin)   → ?status=ALL|DRAFT|REVIEW|PUBLISHED|SCHEDULED|ARCHIVED requires CMS auth
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
      traceArticleFetchCms({
        status: normalized,
        count: articles.length,
      });
      traceArticleApiResponse(`GET cms status=${normalized}`, articles);
      return NextResponse.json({ data: withAiScores(articles) });
    }

    const articles =
      categoryParam !== null
        ? await getArticlesByCategory(categoryParam)
        : await getPublishedArticles();
    traceArticleFetchPublic({
      scope: categoryParam ? `category:${categoryParam}` : "published",
      count: articles.length,
    });
    traceArticleApiResponse(
      categoryParam ? `GET public category=${categoryParam}` : "GET public",
      articles
    );
    return NextResponse.json({ data: withAiScores(articles) });
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

    if (parsed.value.status === "PUBLISHED") {
      const pubCheck = validatePublishReady({
        title: parsed.value.title,
        content: parsed.value.content,
        excerpt: parsed.value.excerpt,
        categoryId: parsed.value.categoryId,
      });
      if (!pubCheck.ok) {
        return jsonError(400, "VALIDATION_ERROR", pubCheck.message);
      }
    }

    const payload =
      guard.user.role === "AUTHOR"
        ? { ...parsed.value, status: "DRAFT" as const }
        : parsed.value;

    const article = await createArticle(payload, guard.user.id);

    if (article.status === "PUBLISHED") {
      revalidatePublicArticleCaches({
        articleSlug: article.slug,
        categorySlug: article.category.slug,
      });
    }

    return NextResponse.json({ data: article }, { status: 201 });
  } catch (error) {
    if (error instanceof ArticleWorkflowError) {
      return jsonError(400, "VALIDATION_ERROR", error.message);
    }
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    console.error("[POST /api/articles]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to create article.");
  }
}
