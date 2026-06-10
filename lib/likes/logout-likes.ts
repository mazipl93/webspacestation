import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateAnonLikeId } from "@/lib/likes/anon-id";
import { transferUserLikesToAnon } from "@/lib/likes/supabase-likes";
import { createClient } from "@/lib/supabase/client";

/** Move account likes to anon cookie before session ends — unlike works while logged out. */
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
}
