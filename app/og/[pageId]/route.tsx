import { getOgPageById } from "@/lib/seo/page-og-registry";
import { loadOgBackgroundDataUrl } from "@/lib/seo/og-load-background";
import { buildOgImageResponse } from "@/lib/seo/og-image-response";

/** Node: odczyt plików z /public (edge często nie ładuje tła z URL). */
export const runtime = "nodejs";

export const revalidate = 86400;

type RouteContext = { params: Promise<{ pageId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { pageId } = await context.params;
  const entry = getOgPageById(pageId);
  if (!entry) {
    return new Response("Not found", { status: 404 });
  }

  let backgroundSrc: string | null = null;
  if (entry.backgroundImage) {
    backgroundSrc = await loadOgBackgroundDataUrl(entry.backgroundImage);
  }

  return buildOgImageResponse(entry, { backgroundSrc });
}
