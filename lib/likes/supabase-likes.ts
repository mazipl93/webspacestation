import type { SupabaseClient } from "@supabase/supabase-js";

export type ToggleArticleLikeResult = {
  liked: boolean;
  count: number;
  slug: string;
};

/** Authenticated toggle — Krok 2 UX. Requires user_article_likes.sql on Supabase. */
export async function toggleArticleLike(
  supabase: SupabaseClient,
  slug: string
): Promise<{ data: ToggleArticleLikeResult | null; error: Error | null }> {
  const { data, error } = await supabase.rpc("toggle_article_like", { p_slug: slug });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  if (!data || typeof data !== "object") {
    return { data: null, error: new Error("Invalid toggle response") };
  }

  const payload = data as Record<string, unknown>;
  return {
    data: {
      liked: Boolean(payload.liked),
      count: typeof payload.count === "number" ? payload.count : 0,
      slug: typeof payload.slug === "string" ? payload.slug : slug,
    },
    error: null,
  };
}

/** Slugs liked by the signed-in user — Krok 2 profile. */
export async function fetchMyLikedSlugs(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.rpc("my_liked_article_slugs");
  if (error || !data) return [];
  return (data as unknown[]).filter((s): s is string => typeof s === "string");
}
