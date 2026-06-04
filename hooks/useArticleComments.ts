"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { ArticleComment } from "@/lib/comments/article-comments";
import {
  deleteArticleComment,
  fetchArticleComments,
  insertArticleComment,
  updateArticleComment,
} from "@/lib/comments/article-comments";

interface CommentsState {
  comments: ArticleComment[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  currentUserId: string | null;
  refresh: () => Promise<void>;
  postComment: (body: string) => Promise<string | null>;
  editComment: (id: string, body: string) => Promise<boolean>;
  removeComment: (id: string) => Promise<boolean>;
}

export function useArticleComments(slug: string): CommentsState {
  const { user, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const clientRef = useRef<SupabaseClient | null>(null);
  if (clientRef.current === null) {
    try {
      clientRef.current = createClient();
    } catch {
      clientRef.current = null;
    }
  }

  const load = useCallback(async () => {
    const supabase = clientRef.current;
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [listed, authUser] = await Promise.all([
      fetchArticleComments(supabase, slug),
      supabase.auth.getUser(),
    ]);

    if (listed.error) {
      setError(listed.error.message);
      setComments([]);
    } else {
      setComments(listed.comments);
    }

    setCurrentUserId(authUser.data.user?.id ?? null);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load, user?.email]);

  const postComment = useCallback(
    async (body: string): Promise<string | null> => {
      if (!user) return null;
      const supabase = clientRef.current;
      if (!supabase) return null;

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser?.id) return null;

      setSaving(true);
      setError(null);

      const { comment, error: insertError } = await insertArticleComment(
        supabase,
        {
          slug,
          userId: authUser.id,
          authorName: user.name,
          authorAvatarUrl: user.avatarUrl,
          body,
        }
      );

      setSaving(false);

      if (insertError || !comment) {
        setError(insertError?.message ?? "Nie udało się dodać komentarza");
        return null;
      }

      setComments((prev) => [comment, ...prev]);
      return comment.id;
    },
    [slug, user]
  );

  const editComment = useCallback(
    async (id: string, body: string): Promise<boolean> => {
      const supabase = clientRef.current;
      if (!supabase) return false;

      setSaving(true);
      setError(null);

      const { comment, error: updateError } = await updateArticleComment(
        supabase,
        id,
        body
      );

      setSaving(false);

      if (updateError || !comment) {
        setError(updateError?.message ?? "Nie udało się zapisać komentarza");
        return false;
      }

      setComments((prev) =>
        prev.map((c) => (c.id === id ? comment : c))
      );
      return true;
    },
    []
  );

  const removeComment = useCallback(async (id: string): Promise<boolean> => {
    const supabase = clientRef.current;
    if (!supabase) return false;

    setSaving(true);
    setError(null);

    const { error: deleteError } = await deleteArticleComment(supabase, id);
    setSaving(false);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setComments((prev) => prev.filter((c) => c.id !== id));
    return true;
  }, []);

  return {
    comments,
    loading: loading || authLoading,
    saving,
    error,
    currentUserId,
    refresh: load,
    postComment,
    editComment,
    removeComment,
  };
}
