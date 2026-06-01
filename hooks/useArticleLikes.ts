"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { addLikedLocal, hasLikedLocal } from "@/lib/likes";

interface LikesState {
  /** Global like count from the DB, or null while loading / when unconfigured. */
  count: number | null;
  /** Whether THIS device has already liked (localStorage guard). */
  liked: boolean;
  /** True until the first count fetch resolves. */
  loading: boolean;
  /** Likes are allowed without login but accumulate globally via RPC. */
  like: () => void;
}

/**
 * Global article-likes counter backed by Supabase. Liking is allowed for
 * logged-out users; the count is a single shared stat (Supabase `article_likes`
 * table + `increment_like` RPC), never per-browser. localStorage only remembers
 * that this device already liked, to prevent spam and show the filled state.
 *
 * Degrades gracefully (no-op, count stays null) when Supabase isn't configured.
 */
export function useArticleLikes(slug: string): LikesState {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const clientRef = useRef<SupabaseClient | null>(null);
  if (clientRef.current === null) {
    try {
      clientRef.current = createClient();
    } catch {
      clientRef.current = null;
    }
  }

  useEffect(() => {
    setLiked(hasLikedLocal(slug));
  }, [slug]);

  // Fetch the current global count for this slug.
  useEffect(() => {
    const supabase = clientRef.current;
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("article_likes")
        .select("count")
        .eq("slug", slug)
        .maybeSingle();
      if (!active) return;
      if (error) {
        setCount(null);
      } else {
        setCount((data?.count as number | undefined) ?? 0);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const like = useCallback(() => {
    if (liked) return; // this device already liked
    const supabase = clientRef.current;

    // Optimistic UI: bump locally and mark the device as having liked.
    setLiked(true);
    setCount((c) => (c ?? 0) + 1);
    addLikedLocal(slug);

    if (!supabase) return; // unconfigured — keep optimistic local state only

    (async () => {
      const { data, error } = await supabase.rpc("increment_like", { slug });
      if (error) {
        // Roll back the optimistic count (keep the local "liked" guard so the
        // user isn't prompted to retry endlessly on a flaky network).
        setCount((c) => (c === null ? c : Math.max(0, c - 1)));
        return;
      }
      if (typeof data === "number") setCount(data);
    })();
  }, [liked, slug]);

  return { count, liked, loading, like };
}
