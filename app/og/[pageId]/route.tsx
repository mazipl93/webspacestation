import { getOgPageById } from "@/lib/seo/page-og-registry";
import { buildOgImage, type OgImageFormat } from "@/lib/seo/og-image-sharp";
import { getOgZorzaKpSubtitle } from "@/lib/seo/og-zorza-kp-line";

export const runtime = "nodejs";

/** Domyślny ISR; /zorza nadpisuje Cache-Control w odpowiedzi (live Kp). */
export const revalidate = 86400;

const ZORZA_OG_MAX_AGE = 300;

type RouteContext = { params: Promise<{ pageId: string }> };

function resolveFormat(request: Request): OgImageFormat {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("image/webp") && !accept.includes("image/jpeg") && !accept.includes("image/jpg")) {
    return "webp";
  }
  return "jpeg";
}

export async function GET(request: Request, context: RouteContext) {
  const { pageId } = await context.params;
  const entry = getOgPageById(pageId);
  if (!entry) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const format = resolveFormat(request);
    const subtitleOverride =
      pageId === "zorza" ? ((await getOgZorzaKpSubtitle()) ?? undefined) : undefined;

    const image = await buildOgImage(entry, format, { subtitleOverride });
    const contentType = format === "jpeg" ? "image/jpeg" : "image/webp";
    const maxAge = pageId === "zorza" ? ZORZA_OG_MAX_AGE : 86400;

    return new Response(new Uint8Array(image), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
        Vary: "Accept",
      },
    });
  } catch (error) {
    console.error("[og]", pageId, error);
    return new Response("OG render failed", { status: 500 });
  }
}
