import { NextRequest, NextResponse } from "next/server";

import {
  createArticle,
  getArticlesByCategory,
  getArticlesForAdmin,
  getPublishedArticles,
} from "@/lib/server/articles";
import { forbidden, isValidSlug, jsonError, mapPrismaError, readJson } from "@/lib/server/http";
import { isArticleStatus, parseArticleCreate } from "@/lib/server/validation";
import { requirePermission } from "@/lib/auth/guard";
import { canCreateArticle, canPublishArticle } from "@/lib/auth/permissions";

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

    // Admin view: any status. Triggered by the ?status param.
    if (statusParam !== null) {
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

    // Public view: published only.
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

// POST /api/articles → create a new article (ADMIN / EDITOR / AUTHOR)
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

    // Publishing on create requires publish permission (AUTHOR → drafts only).
    if (parsed.value.status === "PUBLISHED" && !canPublishArticle(guard.user)) {
      return forbidden();
    }

    const article = await createArticle(parsed.value, guard.user.id);
    return NextResponse.json({ data: article }, { status: 201 });
  } catch (error) {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    console.error("[POST /api/articles]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to create article.");
  }
}
