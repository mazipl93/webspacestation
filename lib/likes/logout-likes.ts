import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateAnonLikeId } from "@/lib/likes/anon-id";
import { replaceAccountLikedSlugs } from "@/lib/likes/browser-liked-cache";
import { createClient } from "@/lib/supabase/client";

export async function transferUserLikesToAnon(
  supabase: SupabaseClient,
  anonId: string
): Promise<void> {
  await supabase.rpc("transfer_user_likes_to_anon", { p_anon_id: anonId });
}

/** Move account likes to anon cookie before session ends — enables unlike while logged out. */
export async function prepareLikesForLogout(
  supabase?: SupabaseClient | null
): Promise<void> {
  let client = supabase;
  if (!client) {
    try {
      client = createClient();
    } catch {
      return;
    }
  }

  const anonId = getOrCreateAnonLikeId();
  await transferUserLikesToAnon(client, anonId);
  replaceAccountLikedSlugs([]);
}
