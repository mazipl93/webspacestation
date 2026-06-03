import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { permanentlyDeleteArchivedArticles } from "@/lib/server/articles";
import { ARTICLES_TAG, articleTag, categoryTag } from "@/lib/cache/tags";
import { jsonError, mapPrismaError, readJson } from "@/lib/server/http";
import { requirePermission } from "@/lib/auth/guard";
import { canDeleteArticle } from "@/lib/auth/permissions";

type Body = { ids?: unknown };

function parseIds(body: Body): string[] | null {
  if (!Array.isArray(body.ids)) return null;
  const ids = body.ids.filter((id): id is string => typeof id === "string" && id.length > 0);
  return ids.length > 0 ? ids : [];
}

/** Permanently remove ARCHIVED articles from the database (bulk). */
export async function POST(request: NextRequest) {
  try {
    const guard = await requirePermission(canDeleteArticle);
    if (!guard.ok) return guard.response;

    const body = await readJson(request);
    if (body === undefined || typeof body !== "object" || body === null) {
      return jsonError(400, "INVALID_BODY", "Request body must be valid JSON.");
    }

    const ids = parseIds(body as Body);
    if (ids === null) {
      return jsonError(400, "VALIDATION_ERROR", "Field 'ids' must be a non-empty array of strings.");
    }
    if (ids.length === 0) {
      return jsonError(400, "VALIDATION_ERROR", "No article ids provided.");
    }

    const result = await permanentlyDeleteArchivedArticles(ids);

    if (result.deleted > 0) {
      revalidateTag(ARTICLES_TAG);
      for (const slug of result.slugs) {
        revalidateTag(articleTag(slug));
      }
      for (const catSlug of result.categorySlugs) {
        revalidateTag(categoryTag(catSlug));
      }
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    console.error("[POST /api/articles/permanent-delete]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to permanently delete articles.");
  }
}
