import { getOgPageById } from "@/lib/seo/page-og-registry";
import { buildOgImage, type OgImageFormat } from "@/lib/seo/og-image-sharp";

export const runtime = "nodejs";

export const revalidate = 86400;

type RouteContext = { params: Promise<{ pageId: string }> };

function resolveFormat(request: Request): OgImageFormat {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("image/webp")) return "webp";
  if (accept.includes("image/jpeg") || accept.includes("image/jpg")) return "jpeg";
  return "webp";
}

export async function GET(request: Request, context: RouteContext) {
  const { pageId } = await context.params;
  const entry = getOgPageById(pageId);
  if (!entry) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const format = resolveFormat(request);
    const image = await buildOgImage(entry, format);
    const contentType = format === "jpeg" ? "image/jpeg" : "image/webp";

    return new Response(new Uint8Array(image), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        Vary: "Accept",
      },
    });
  } catch (error) {
    console.error("[og]", pageId, error);
    return new Response("OG render failed", { status: 500 });
  }
}
