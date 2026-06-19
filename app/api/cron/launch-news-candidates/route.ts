import { NextResponse } from "next/server";
import { readStoredCore } from "@/lib/ops/snapshot-store";
import { syncLaunchNewsDrafts } from "@/lib/ops/launch-news-sync";

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

/** Dev/manual: create or refresh Misje DRAFTs for upcoming launches (T+7d). */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stored = await readStoredCore();
    const launches = stored?.launches ?? [];
    const result = await syncLaunchNewsDrafts(launches);
    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      launches: launches.length,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/launch-news-candidates]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
