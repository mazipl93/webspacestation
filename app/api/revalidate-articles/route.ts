import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { ARTICLES_TAG } from "@/lib/cache/tags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV === "development";
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** Clears cached article lists (homepage, ranking) after bulk DB updates. */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(ARTICLES_TAG);
  return NextResponse.json({ ok: true, tag: ARTICLES_TAG });
}
