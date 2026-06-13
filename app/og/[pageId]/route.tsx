import { getOgPageById } from "@/lib/seo/page-og-registry";
import { buildOgImageJpeg } from "@/lib/seo/og-image-sharp";

export const runtime = "nodejs";

export const revalidate = 86400;

type RouteContext = { params: Promise<{ pageId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { pageId } = await context.params;
  const entry = getOgPageById(pageId);
  if (!entry) {
    return new Response("Not found", { status: 404 });
  }

  const jpeg = await buildOgImageJpeg(entry);

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
