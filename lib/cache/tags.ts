// Centralised cache-tag vocabulary for the public content layer.
//
// Public reads are wrapped in `unstable_cache` with these tags so mutations can
// invalidate exactly what changed via `revalidateTag` (e.g. after an article is
// published from /admin). Keep the strings stable — they are the contract
// between cached reads (lib/server/articles.ts) and the API mutation routes.

/** Whole published-article surface: home feed, category feeds, related, lists. */
export const ARTICLES_TAG = "articles";

/** Category catalogue (names, colours, ordering). */
export const CATEGORIES_TAG = "categories";

/** A single article detail page, keyed by slug. */
export function articleTag(slug: string): string {
  return `article:${slug}`;
}

/** Published feed scoped to one category, keyed by category slug. */
export function categoryTag(categorySlug: string): string {
  return `category:${categorySlug}`;
}
