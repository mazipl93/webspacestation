import { getOgPageById } from "@/lib/seo/page-og-registry";
import { buildOgImageResponse } from "@/lib/seo/og-image-response";

export const runtime = "edge";

/** CDN cache: OG cards are stable per page; refresh daily. */
export const revalidate = 86400;

type RouteContext = { params: Promise<{ pageId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { pageId } = await context.params;
  const entry = getOgPageById(pageId);
  if (!entry) {
    return new Response("Not found", { status: 404 });
  }
  return buildOgImageResponse(entry);
}
