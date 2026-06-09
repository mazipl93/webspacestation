"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  getAnonLikeIdIfPresent,
  getOrCreateAnonLikeId,
} from "@/lib/likes/anon-id";
import {
  isAccountLikedLocally,
  replaceAccountLikedSlugs,
  setAccountLikedSlug,
} from "@/lib/likes/browser-liked-cache";
import { fetchSingleArticleLikeCount } from "@/lib/likes/article-like-counts";
import { LIKES_CHANGE_EVENT } from "@/lib/likes/events";
import { articleLikeErrorMessage } from "@/lib/likes/like-errors";
import {
  fetchAnonArticleLiked,
  fetchMyLikedSlugs,
  mergeAnonLikes,
  toggleAnonArticleLike,
  toggleArticleLike,
} from "@/lib/likes/supabase-likes";

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

/** Article likes — logged-in (per account) or anonymous (per browser cookie). */
export function useArticleLikes(slug: string): LikesState {
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<SupabaseClient | null>(null);
  const mergedAnonRef = useRef(false);
  const anonLikedRef = useRef(false);

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
      setAccountLikedSlug(slug, mine);
      anonLikedRef.current = false;
      setLiked(mine);
    } else {
      const anonId = getAnonLikeIdIfPresent();
      const anonLiked = anonId
        ? await fetchAnonArticleLiked(supabase, slug, anonId)
        : false;
      anonLikedRef.current = anonLiked;
      setLiked(anonLiked || isAccountLikedLocally(slug));
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

  useEffect(() => {
    if (!user) {
      mergedAnonRef.current = false;
      return;
    }

    const supabase = clientRef.current;
    if (!supabase) return;

    void (async () => {
      if (!mergedAnonRef.current) {
        const anonId = getAnonLikeIdIfPresent();
        if (anonId) {
          mergedAnonRef.current = true;
          await mergeAnonLikes(supabase, anonId);
        }
      }

      const slugs = await fetchMyLikedSlugs(supabase);
      replaceAccountLikedSlugs(slugs);

      await refresh();
      window.dispatchEvent(new Event(LIKES_CHANGE_EVENT));
    })();
  }, [user, refresh]);

  const toggle = useCallback(() => {
    if (toggling) return;

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
      const result = isAuthed
        ? await toggleArticleLike(supabase, slug)
        : await toggleAnonArticleLike(
            supabase,
            slug,
            getOrCreateAnonLikeId()
          );

      setToggling(false);

      if (result.error || !result.data) {
        setLiked(wasLiked);
        setCount((c) => {
          const base = c ?? 0;
          return wasLiked ? base + 1 : Math.max(0, base - 1);
        });
        setError(
          articleLikeErrorMessage(
            result.error?.message ?? "Invalid toggle response"
          )
        );
        return;
      }

      if (isAuthed) {
        setAccountLikedSlug(slug, result.data.liked);
        anonLikedRef.current = false;
      } else {
        anonLikedRef.current = result.data.liked;
        setAccountLikedSlug(slug, result.data.liked);
      }

      setLiked(result.data.liked);
      setCount(result.data.count);
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
};
