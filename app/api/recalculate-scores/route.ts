import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { ARTICLES_TAG } from "@/lib/cache/tags";
import { recalculateAllScores } from "@/lib/news/recalculateScores";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await recalculateAllScores();
    revalidateTag(ARTICLES_TAG);
    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[recalculate-scores]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
