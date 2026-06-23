import { revalidateTag } from "next/cache";
import { CATEGORY_SLUG_ORDER } from "@/lib/categories";
import { ARTICLES_TAG, articleTag, categoryTag } from "@/lib/cache/tags";

const PUBLIC_LIST_PATHS = [
  "/",
  "/aktualnosci",
  ...CATEGORY_SLUG_ORDER.map((slug) => `/${slug}`),
] as const;

type RevalidateOptions = {
  categorySlug?: string;
  articleSlug?: string;
  /** After slug rename — invalidate cached page at the old path. */
  previousArticleSlug?: string;
};

/**
 * Invalidate cached article data after publish using tag-based revalidation only.
 * revalidateTag rebuilds pages lazily on next request — zero extra Vercel invocations.
 *
 * Category feeds use only categoryTag (not ARTICLES_TAG) so publishing in "misje"
 * does NOT blow the "astronomia" or "nauka" cache. ARTICLES_TAG covers only home feed
 * and cross-category aggregates (recent, hero slides, week topic, sitemaps).
 */
export function revalidatePublicArticleCaches(options: RevalidateOptions = {}): void {
  if (options.articleSlug) {
    revalidateTag(articleTag(options.articleSlug));
  }
  if (options.previousArticleSlug) {
    revalidateTag(articleTag(options.previousArticleSlug));
  }

  if (options.categorySlug) {
    // Granular: only invalidate the affected category + home feed aggregates.
    revalidateTag(categoryTag(options.categorySlug));
    revalidateTag(ARTICLES_TAG);
  } else {
    // Structural change or bulk publish — invalidate everything including all categories.
    revalidateTag(ARTICLES_TAG);
    for (const slug of CATEGORY_SLUG_ORDER) {
      revalidateTag(categoryTag(slug));
    }
  }
}

/** Paths touched by a full publish sweep (for scripts / logging). */
export function publicArticleListPaths(): readonly string[] {
  return PUBLIC_LIST_PATHS;
}
