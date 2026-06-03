import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { runScheduledPublish } from "@/lib/server/articles";
import { ARTICLES_TAG } from "@/lib/cache/tags";
import { requireCmsAccess } from "@/lib/auth/guard";
import { jsonError } from "@/lib/server/http";

/** CMS: publish all SCHEDULED rows whose publishAt <= now (manual cron). */
export async function POST() {
  try {
    const guard = await requireCmsAccess();
    if (!guard.ok) return guard.response;

    const result = await runScheduledPublish();
    if (result.published > 0) {
      revalidateTag(ARTICLES_TAG);
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("[POST /api/articles/publish-scheduled]", err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to publish scheduled articles.");
  }
}
