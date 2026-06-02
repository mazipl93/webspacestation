import { NextResponse } from "next/server";
import { runNewsEngineIngest } from "@/lib/rss/ingest";
import { runRssDraftProcessing } from "@/lib/rss/process-drafts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

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

/** Step 1: raw RSS → DRAFT. Step 2: AI → REVIEW. Never auto-publishes. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ingest = await runNewsEngineIngest();
    const process = await runRssDraftProcessing();

    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      ingest,
      process,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/rss]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
