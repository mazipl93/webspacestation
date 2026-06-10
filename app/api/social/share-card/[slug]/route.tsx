import { ImageResponse } from "next/og";
import { resolveArticleImageCredit } from "@/lib/articles/image-credit";
import { getCategoryInfo } from "@/lib/categories";
import { normalizeCoverImageUrl } from "@/lib/media/cover-url";
import { getPublishedArticleForShareCard } from "@/lib/server/articles";
import { getSiteUrl } from "@/lib/site-url";
import { extractShareCardSubline } from "@/lib/social/facebook-caption";
import { loadShareCardFonts } from "@/lib/social/share-card-fonts";
import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
  ShareCardLayout,
} from "@/lib/social/share-card";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const row = await getPublishedArticleForShareCard(slug);

  if (!row) {
    return new Response("Not found", { status: 404 });
  }

  const category = getCategoryInfo(row.category.slug);
  const coverUrl = normalizeCoverImageUrl(row.coverImage);
  const imageCredit = resolveArticleImageCredit(row);
  const fonts = await loadShareCardFonts();
  const subline = extractShareCardSubline({
    title: row.title,
    excerpt: row.excerpt,
    subtitle: row.subtitle,
    content: row.content,
  });

  return new ImageResponse(
    (
      <ShareCardLayout
        title={row.title}
        excerpt={subline || null}
        coverUrl={coverUrl}
        imageCredit={imageCredit}
        category={category}
        categorySlug={row.category.slug}
        brandBaseUrl={getSiteUrl()}
      />
    ),
    {
      width: SHARE_CARD_WIDTH,
      height: SHARE_CARD_HEIGHT,
      fonts,
    },
  );
}
