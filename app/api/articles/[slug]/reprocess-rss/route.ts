import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { getArticleById } from "@/lib/server/articles";
import { ARTICLES_TAG } from "@/lib/cache/tags";
import { jsonError, isValidId } from "@/lib/server/http";
import { requireCmsAccess } from "@/lib/auth/guard";
import { reprocessRssArticle } from "@/lib/rss/reprocess-rss-article";

type Ctx = { params: Promise<{ slug: string }> };

/** POST /api/articles/:id/reprocess-rss — ponowne AI dla jednego wpisu RSS */
export async function POST(_request: NextRequest, { params }: Ctx) {
  try {
    const guard = await requireCmsAccess();
    if (!guard.ok) return guard.response;

    const { slug: id } = await params;
    if (!isValidId(id)) {
      return jsonError(400, "INVALID_PARAM", "Invalid article id.");
    }

    const result = await reprocessRssArticle(id);
    if (!result.ok) {
      return jsonError(422, "REPROCESS_FAILED", result.error);
    }

    const article = await getArticleById(id);
    if (!article) {
      return jsonError(404, "NOT_FOUND", "Article not found.");
    }

    revalidateTag(ARTICLES_TAG);

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error("[POST /api/articles/reprocess-rss]", error);
    return jsonError(500, "INTERNAL_ERROR", "Nie udało się ponowić AI.");
  }
}
