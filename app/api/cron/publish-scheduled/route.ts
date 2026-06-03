import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { runScheduledPublish } from "@/lib/server/articles";
import { ARTICLES_TAG } from "@/lib/cache/tags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const vercelCron = request.headers.get("x-vercel-cron");
  return vercelCron === "1" && Boolean(secret);
}

/** Publish due SCHEDULED articles — idempotent, never auto-publishes RSS/REVIEW. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runScheduledPublish();

    if (result.published > 0) {
      revalidateTag(ARTICLES_TAG);
    }

    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/publish-scheduled]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
