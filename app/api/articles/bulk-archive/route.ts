import { NextRequest, NextResponse } from "next/server";
import { bulkArchiveArticles } from "@/lib/server/bulk-articles";
import { requirePermission } from "@/lib/auth/guard";
import { canDeleteArticle } from "@/lib/auth/permissions";
import { jsonError, readJson } from "@/lib/server/http";

type Body = { ids?: unknown };

function parseIds(body: Body): string[] | null {
  if (!Array.isArray(body.ids)) return null;
  const ids = body.ids.filter((id): id is string => typeof id === "string" && id.length > 0);
  return ids.length > 0 ? ids : [];
}

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

    const result = await bulkArchiveArticles(ids);
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("[POST /api/articles/bulk-archive]", err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to bulk archive articles.");
  }
}
