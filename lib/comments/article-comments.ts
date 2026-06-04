import type { SupabaseClient } from "@supabase/supabase-js";

export const ARTICLE_COMMENTS_TABLE = "article_comments";

export const COMMENT_BODY_MAX = 4000;

/** PostgREST 404 when `article_comments` was not created in Supabase yet. */
export function formatCommentError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("article_comments") &&
    (lower.includes("schema cache") ||
      lower.includes("could not find the table") ||
      lower.includes("does not exist"))
  ) {
    return (
      "Komentarze nie są jeszcze skonfigurowane w bazie. " +
      "W Supabase SQL Editor uruchom plik supabase/article_comments.sql, " +
      "potem odśwież stronę."
    );
  }
  return message;
}

export type ArticleComment = {
  id: string;
  articleSlug: string;
  userId: string;
  author: string;
  authorAvatarUrl?: string;
  body: string;
  createdAt: string;
  editedAt?: string;
};

type CommentRow = {
  id: string;
  article_slug: string;
  user_id: string;
  author_name: string;
  author_avatar_url: string | null;
  body: string;
  created_at: string;
  edited_at: string | null;
};

export function normalizeCommentBody(raw: string): string | null {
  const body = raw.trim();
  if (!body || body.length > COMMENT_BODY_MAX) return null;
  return body;
}

export function rowToComment(row: CommentRow): ArticleComment {
  return {
    id: row.id,
    articleSlug: row.article_slug,
    userId: row.user_id,
    author: row.author_name,
    authorAvatarUrl: row.author_avatar_url ?? undefined,
    body: row.body,
    createdAt: row.created_at,
    editedAt: row.edited_at ?? undefined,
  };
}

export async function fetchArticleComments(
  supabase: SupabaseClient,
  slug: string
): Promise<{ comments: ArticleComment[]; error: Error | null }> {
  const clean = slug.trim();
  if (!clean) return { comments: [], error: null };

  const { data, error } = await supabase
    .from(ARTICLE_COMMENTS_TABLE)
    .select(
      "id, article_slug, user_id, author_name, author_avatar_url, body, created_at, edited_at"
    )
    .eq("article_slug", clean)
    .order("created_at", { ascending: false });

  if (error) {
    return { comments: [], error: new Error(formatCommentError(error.message)) };
  }

  const comments = (data ?? []).map((row) =>
    rowToComment(row as CommentRow)
  );
  return { comments, error: null };
}

export async function insertArticleComment(
  supabase: SupabaseClient,
  input: {
    slug: string;
    userId: string;
    authorName: string;
    authorAvatarUrl?: string;
    body: string;
  }
): Promise<{ comment: ArticleComment | null; error: Error | null }> {
  const body = normalizeCommentBody(input.body);
  const slug = input.slug.trim();
  const userId = input.userId.trim();
  if (!body || !slug || !userId) {
    return { comment: null, error: new Error("Invalid comment") };
  }

  const { data, error } = await supabase
    .from(ARTICLE_COMMENTS_TABLE)
    .insert({
      article_slug: slug,
      user_id: userId,
      author_name: input.authorName.trim() || "Użytkownik",
      author_avatar_url: input.authorAvatarUrl ?? null,
      body,
    })
    .select(
      "id, article_slug, user_id, author_name, author_avatar_url, body, created_at, edited_at"
    )
    .single();

  if (error) {
    return { comment: null, error: new Error(formatCommentError(error.message)) };
  }

  return { comment: rowToComment(data as CommentRow), error: null };
}

export async function updateArticleComment(
  supabase: SupabaseClient,
  id: string,
  body: string
): Promise<{ comment: ArticleComment | null; error: Error | null }> {
  const normalized = normalizeCommentBody(body);
  if (!normalized) {
    return { comment: null, error: new Error("Invalid comment") };
  }

  const editedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from(ARTICLE_COMMENTS_TABLE)
    .update({ body: normalized, edited_at: editedAt })
    .eq("id", id)
    .select(
      "id, article_slug, user_id, author_name, author_avatar_url, body, created_at, edited_at"
    )
    .single();

  if (error) {
    return { comment: null, error: new Error(formatCommentError(error.message)) };
  }

  return { comment: rowToComment(data as CommentRow), error: null };
}

export async function deleteArticleComment(
  supabase: SupabaseClient,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from(ARTICLE_COMMENTS_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    return { error: new Error(formatCommentError(error.message)) };
  }
  return { error: null };
}
