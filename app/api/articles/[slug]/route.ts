import { NextRequest, NextResponse } from "next/server";

import {
  archiveArticle,
  getArticleById,
  getPublishedArticleBySlug,
  updateArticle,
} from "@/lib/server/articles";
import {
  forbidden,
  isValidId,
  isValidSlug,
  jsonError,
  mapPrismaError,
  readJson,
} from "@/lib/server/http";
import { parseArticleUpdate } from "@/lib/server/validation";
import { requirePermission } from "@/lib/auth/guard";
import {
  canDeleteArticle,
  canEditArticle,
  canPublishArticle,
} from "@/lib/auth/permissions";

type Ctx = { params: Promise<{ slug: string }> };

// GET /api/articles/[slug]
//   (public) → published article by slug
//   (admin)  → ?byId=1 resolves the param as an id and returns any status
export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const { slug } = await params;
    const byId = request.nextUrl.searchParams.get("byId") !== null;

    if (byId) {
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

// PATCH /api/articles/[id] → update fields and/or status (ADMIN / EDITOR)
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

    // Transitioning to PUBLISHED requires publish permission.
    if (parsed.value.status === "PUBLISHED" && !canPublishArticle(guard.user)) {
      return forbidden();
    }

    const article = await updateArticle(id, parsed.value);
    if (!article) return jsonError(404, "NOT_FOUND", "Article not found.");
    return NextResponse.json({ data: article });
  } catch (error) {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    console.error("[PATCH /api/articles/[id]]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to update article.");
  }
}

// DELETE /api/articles/[id] → soft delete (archive) (ADMIN only)
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
    return NextResponse.json({ data: article });
  } catch (error) {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    console.error("[DELETE /api/articles/[id]]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to archive article.");
  }
}
