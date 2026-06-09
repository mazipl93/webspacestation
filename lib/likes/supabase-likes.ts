import type { SupabaseClient } from "@supabase/supabase-js";

export type ToggleArticleLikeResult = {
  liked: boolean;
  count: number;
  slug: string;
};

function parseTogglePayload(
  data: unknown,
  slug: string
): ToggleArticleLikeResult | null {
  if (!data || typeof data !== "object") return null;
  const payload = data as Record<string, unknown>;
  return {
    liked: Boolean(payload.liked),
    count: typeof payload.count === "number" ? payload.count : 0,
    slug: typeof payload.slug === "string" ? payload.slug : slug,
  };
}

/** Authenticated toggle — requires user_article_likes.sql on Supabase. */
export async function toggleArticleLike(
  supabase: SupabaseClient,
  slug: string
): Promise<{ data: ToggleArticleLikeResult | null; error: Error | null }> {
  const { data, error } = await supabase.rpc("toggle_article_like", { p_slug: slug });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const parsed = parseTogglePayload(data, slug);
  if (!parsed) {
    return { data: null, error: new Error("Invalid toggle response") };
  }

  return { data: parsed, error: null };
}

/** Anonymous toggle — requires anon_article_likes.sql on Supabase. */
export async function toggleAnonArticleLike(
  supabase: SupabaseClient,
  slug: string,
  anonId: string
): Promise<{ data: ToggleArticleLikeResult | null; error: Error | null }> {
  const { data, error } = await supabase.rpc("toggle_anon_article_like", {
    p_slug: slug,
    p_anon_id: anonId,
  });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const parsed = parseTogglePayload(data, slug);
  if (!parsed) {
    return { data: null, error: new Error("Invalid toggle response") };
  }

  return { data: parsed, error: null };
}

export async function fetchAnonArticleLiked(
  supabase: SupabaseClient,
  slug: string,
  anonId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("anon_article_liked", {
    p_slug: slug,
    p_anon_id: anonId,
  });
  if (error) return false;
  return Boolean(data);
}

/** After login — attach cookie likes to the account (no double count). */
export async function mergeAnonLikes(
  supabase: SupabaseClient,
  anonId: string
): Promise<void> {
  await supabase.rpc("merge_anon_likes", { p_anon_id: anonId });
}

/** On logout — hand likes to browser anon id so guest can unlike later. */
export async function transferUserLikesToAnon(
  supabase: SupabaseClient,
  anonId: string
): Promise<void> {
  await supabase.rpc("transfer_user_likes_to_anon", { p_anon_id: anonId });
}

/** Slugs liked by the signed-in user — profile. */
export async function fetchMyLikedSlugs(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.rpc("my_liked_article_slugs");
  if (error || !data) return [];
  return (data as unknown[]).filter((s): s is string => typeof s === "string");
}
