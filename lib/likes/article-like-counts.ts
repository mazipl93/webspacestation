import type { SupabaseClient } from "@supabase/supabase-js";

/** Public aggregate view (user_article_likes.sql). */
export const ARTICLE_LIKE_COUNTS_VIEW = "article_like_counts";

/** Legacy anonymous counter — fallback until Krok 2 retires increment_like. */
export const LEGACY_ARTICLE_LIKES_TABLE = "article_likes";

function rowsToMap(rows: { slug: string; count: number | null }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.slug, row.count ?? 0);
  }
  return map;
}

/**
 * Public like count for one article (registered + anonymous likes combined).
 */
export async function fetchSingleArticleLikeCount(
  supabase: SupabaseClient,
  slug: string
): Promise<number> {
  const rpc = await supabase.rpc("get_article_like_count", { p_slug: slug });
  if (!rpc.error && typeof rpc.data === "number") {
    return rpc.data;
  }

  const modern = await supabase
    .from(ARTICLE_LIKE_COUNTS_VIEW)
    .select("count")
    .eq("slug", slug)
    .maybeSingle();

  if (!modern.error) {
    return (modern.data?.count as number | undefined) ?? 0;
  }

  const legacy = await supabase
    .from(LEGACY_ARTICLE_LIKES_TABLE)
    .select("count")
    .eq("slug", slug)
    .maybeSingle();

  if (legacy.error) return 0;
  return (legacy.data?.count as number | undefined) ?? 0;
}

/**
 * Fetches global like counts for Popularne / sidebar.
 * Prefers article_like_counts (per-user model); falls back to legacy article_likes.
 */
export async function fetchArticleLikeCounts(
  supabase: SupabaseClient
): Promise<Map<string, number>> {
  const modern = await supabase
    .from(ARTICLE_LIKE_COUNTS_VIEW)
    .select("slug, count");

  if (!modern.error && modern.data) {
    return rowsToMap(modern.data as { slug: string; count: number | null }[]);
  }

  const legacy = await supabase
    .from(LEGACY_ARTICLE_LIKES_TABLE)
    .select("slug, count");

  if (legacy.error || !legacy.data) {
    return new Map();
  }

  return rowsToMap(legacy.data as { slug: string; count: number | null }[]);
}
