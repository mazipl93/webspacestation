import { NextResponse } from "next/server";
import { getArticleStats } from "@/lib/server/articles";
import { requireCmsAccess } from "@/lib/auth/guard";
import { jsonError } from "@/lib/server/http";

/** CMS: aggregate article counts by status (lightweight; no full list). */
export async function GET() {
  try {
    const guard = await requireCmsAccess();
    if (!guard.ok) return guard.response;

    const stats = await getArticleStats();
    return NextResponse.json({ data: stats });
  } catch (err) {
    console.error("[GET /api/articles/stats]", err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load article stats.");
  }
}
