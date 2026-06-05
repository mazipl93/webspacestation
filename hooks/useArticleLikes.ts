"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { fetchSingleArticleLikeCount } from "@/lib/likes/article-like-counts";
import { LIKES_CHANGE_EVENT } from "@/lib/likes/events";
import { articleLikeErrorMessage } from "@/lib/likes/like-errors";
import { toggleArticleLike } from "@/lib/likes/supabase-likes";

interface LikesState {
  count: number | null;
  liked: boolean;
  loading: boolean;
  toggling: boolean;
  error: string | null;
  isAuthed: boolean;
  toggle: () => void;
}

async function fetchUserLiked(
  supabase: SupabaseClient,
  slug: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_article_likes")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

/** Per-user likes (auth required to toggle). Count is public aggregate. */
export function useArticleLikes(slug: string): LikesState {
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<SupabaseClient | null>(null);
  if (clientRef.current === null) {
    try {
      clientRef.current = createClient();
    } catch {
      clientRef.current = null;
    }
  }

  const refresh = useCallback(async () => {
    const supabase = clientRef.current;
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const total = await fetchSingleArticleLikeCount(supabase, slug);
    setCount(total);

    if (user) {
      const mine = await fetchUserLiked(supabase, slug);
      setLiked(mine);
    } else {
      setLiked(false);
    }
    setLoading(false);
  }, [slug, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => void refresh();
    window.addEventListener(LIKES_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(LIKES_CHANGE_EVENT, onChange);
  }, [refresh]);

  const toggle = useCallback(() => {
    if (!isAuthed || toggling) return;

    const supabase = clientRef.current;
    if (!supabase) return;

    const wasLiked = liked;
    setToggling(true);
    setError(null);
    setLiked(!wasLiked);
    setCount((c) => {
      const base = c ?? 0;
      return wasLiked ? Math.max(0, base - 1) : base + 1;
    });

    (async () => {
      const { data, error } = await toggleArticleLike(supabase, slug);
      setToggling(false);

      if (error || !data) {
        setLiked(wasLiked);
        setCount((c) => {
          const base = c ?? 0;
          return wasLiked ? base + 1 : Math.max(0, base - 1);
        });
        setError(articleLikeErrorMessage(error?.message ?? "Invalid toggle response"));
        return;
      }

      setLiked(data.liked);
      setCount(data.count);
      window.dispatchEvent(new Event(LIKES_CHANGE_EVENT));
    })();
  }, [isAuthed, liked, slug, toggling]);

  return {
    count,
    liked,
    loading: loading || authLoading,
    toggling,
    error,
    isAuthed,
    toggle,
  };
}
