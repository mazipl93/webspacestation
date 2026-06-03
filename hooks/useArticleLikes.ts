"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  ARTICLE_LIKE_COUNTS_VIEW,
  LEGACY_ARTICLE_LIKES_TABLE,
} from "@/lib/likes/article-like-counts";
import { LIKES_CHANGE_EVENT } from "@/lib/likes/events";
import { toggleArticleLike } from "@/lib/likes/supabase-likes";

interface LikesState {
  count: number | null;
  liked: boolean;
  loading: boolean;
  toggling: boolean;
  isAuthed: boolean;
  toggle: () => void;
}

async function fetchLikeCount(
  supabase: SupabaseClient,
  slug: string
): Promise<number> {
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

  const clientRef = useRef<SupabaseClient | null>(null);
  if (clientRef.current === null) {
    try {
      clientRef.current = createClient();
    } catch {
      clientRef.current = null;
    }
  }

  useEffect(() => {
    const supabase = clientRef.current;
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    (async () => {
      const total = await fetchLikeCount(supabase, slug);
      if (!active) return;
      setCount(total);

      if (user) {
        const mine = await fetchUserLiked(supabase, slug);
        if (active) setLiked(mine);
      } else {
        setLiked(false);
      }

      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [slug, user]);

  const toggle = useCallback(() => {
    if (!isAuthed || toggling) return;

    const supabase = clientRef.current;
    if (!supabase) return;

    const wasLiked = liked;
    setToggling(true);
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
    isAuthed,
    toggle,
  };
}
