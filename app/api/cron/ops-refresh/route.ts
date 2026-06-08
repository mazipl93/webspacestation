import { NextResponse } from "next/server";
import { refreshOpsCache } from "@/lib/ops/refresh-ops-cache";

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

/** Refresh Launch Library / ISS / NASA snapshots into DB — zero external API on user SSR. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await refreshOpsCache();
    return NextResponse.json({ ok: true, at: new Date().toISOString(), ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/ops-refresh]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
