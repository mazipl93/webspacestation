import { NextResponse } from "next/server";
import { runScheduledPublish } from "@/lib/server/articles";
import { revalidatePublicArticleCaches } from "@/lib/cache/revalidate-public-articles";
import { requireCmsAccess } from "@/lib/auth/guard";
import { jsonError } from "@/lib/server/http";

/** CMS: publish all SCHEDULED rows whose publishAt <= now (manual cron). */
export async function POST() {
  try {
    const guard = await requireCmsAccess();
    if (!guard.ok) return guard.response;

    const result = await runScheduledPublish();
    if (result.published > 0) {
      revalidatePublicArticleCaches();
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("[POST /api/articles/publish-scheduled]", err);
    return jsonError(500, "INTERNAL_ERROR", "Failed to publish scheduled articles.");
  }
}
