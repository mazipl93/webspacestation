import { revalidatePath, revalidateTag } from "next/cache";
import { CATEGORY_SLUG_ORDER } from "@/lib/categories";
import { ARTICLES_TAG, articleTag, categoryTag } from "@/lib/cache/tags";
import { RSS_CATEGORY_FEEDS } from "@/lib/rss-feeds";

const SEO_FEED_PATHS = [
  "/sitemap.xml",
  "/sitemaps/pages.xml",
  "/sitemaps/articles.xml",
  "/sitemaps/news.xml",
  "/feed.xml",
] as const;

const PUBLIC_LIST_PATHS = [
  "/",
  "/aktualnosci",
  ...CATEGORY_SLUG_ORDER.map((slug) => `/${slug}`),
] as const;

type RevalidateOptions = {
  /** When set, only that department page is path-invalidated (plus home + feed). */
  categorySlug?: string;
  articleSlug?: string;
  /** After slug rename — invalidate cached page at the old path. */
  previousArticleSlug?: string;
};

/**
 * Invalidate cached article data and public list pages after publish.
 * Uses `page` scope (not `layout`) so root layout + AuthProvider are not rebuilt for every visitor.
 * Data cache is cleared via `revalidateTag(ARTICLES_TAG)` — list queries no longer load full `content`.
 */
export function revalidatePublicArticleCaches(options: RevalidateOptions = {}): void {
  revalidateTag(ARTICLES_TAG);

  if (options.articleSlug) {
    revalidateTag(articleTag(options.articleSlug));
    revalidatePath(`/aktualnosci/${options.articleSlug}`, "page");
  }
  if (options.previousArticleSlug) {
    revalidateTag(articleTag(options.previousArticleSlug));
    revalidatePath(`/aktualnosci/${options.previousArticleSlug}`, "page");
  }
  if (options.categorySlug) {
    revalidateTag(categoryTag(options.categorySlug));
  }

  revalidatePath("/", "page");
  revalidatePath("/aktualnosci", "page");

  for (const path of SEO_FEED_PATHS) {
    revalidatePath(path, "page");
  }
  for (const feed of RSS_CATEGORY_FEEDS) {
    revalidatePath(feed.path, "page");
  }

  if (options.categorySlug) {
    revalidatePath(`/${options.categorySlug}`, "page");
    return;
  }

  for (const slug of CATEGORY_SLUG_ORDER) {
    revalidatePath(`/${slug}`, "page");
  }
}

/** Paths touched by a full publish sweep (for scripts / logging). */
export function publicArticleListPaths(): readonly string[] {
  return PUBLIC_LIST_PATHS;
}
