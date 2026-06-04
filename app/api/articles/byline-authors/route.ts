import { NextResponse } from "next/server";
import { listBylineAuthorCandidates } from "@/lib/server/byline-authors";
import { requireCmsAccess } from "@/lib/auth/guard";
import { jsonError } from "@/lib/server/http";

/** CMS: redakcja do wyboru jako autor artykułu (bez roli USER). */
export async function GET() {
  try {
    const guard = await requireCmsAccess();
    if (!guard.ok) return guard.response;

    const authors = await listBylineAuthorCandidates();
    return NextResponse.json({ data: authors });
  } catch (err) {
    console.error("[GET /api/articles/byline-authors]", err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load byline authors.");
  }
}
