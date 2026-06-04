import { pickCategoryCoverFallback } from "@/lib/cover-fallbacks";
import { resolveEditorialCoverImage } from "@/lib/editorial/resolve-editorial-cover";
import { SEARCH_FALLBACK_IMAGE } from "@/lib/search";
import { isRssArticle } from "@/lib/ui/article-kind";
import type { NewsArticle, NewsCategory } from "@/types";

export type ResolveImageInput = {
  /** Public DTO — mapped from DB coverImage. */
  image?: string | null;
  /** DB / admin API field. */
  coverImage?: string | null;
  category?: NewsCategory | string;
  slug?: string;
  contentOrigin?: NewsArticle["contentOrigin"];
};

/**
 * Single hero/card image resolver.
 * DB source of truth: coverImage → exposed as `image` on public DTO.
 */
export function resolveImage(
  article: ResolveImageInput,
  options?: { withFallback?: boolean }
): string | null {
  const fromDb =
    resolveEditorialCoverImage(article.slug, article.coverImage) ||
    article.image?.trim() ||
    null;
  if (fromDb) return fromDb;

  const withFallback = options?.withFallback ?? true;
  if (!withFallback) return null;

  const category = (article.category ?? "technologie") as NewsCategory;
  const isRss = isRssArticle(article.contentOrigin);
  if (article.slug) {
    return pickCategoryCoverFallback(category, article.slug);
  }
  if (isRss) {
    return SEARCH_FALLBACK_IMAGE;
  }
  return pickCategoryCoverFallback(category, "editorial");
}

/** Public surfaces always get a renderable URL. */
export function resolveImageOrFallback(article: ResolveImageInput): string {
  return resolveImage(article, { withFallback: true }) ?? SEARCH_FALLBACK_IMAGE;
}

/**
 * Hero URL in CMS preview panes — only explicit cover (form / DB field).
 * Public portal uses resolveImage() with category/stock fallbacks instead.
 */
export function resolveHeroDisplayUrl(article: ResolveImageInput): string | null {
  const direct =
    resolveEditorialCoverImage(article.slug, article.coverImage) ||
    article.image?.trim() ||
    null;
  if (direct && /^https?:\/\//i.test(direct)) return direct;
  return null;
}
