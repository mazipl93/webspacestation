"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  Lock,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useArticleComments } from "@/hooks/useArticleComments";
import type { ArticleComment } from "@/lib/comments/article-comments";
import Avatar from "@/components/profile/Avatar";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function commentAvatarSrc(
  comment: ArticleComment,
  currentUser: { avatarUrl?: string } | null,
  isOwner: boolean
): string | undefined {
  if (comment.authorAvatarUrl) return comment.authorAvatarUrl;
  if (isOwner && currentUser?.avatarUrl) return currentUser.avatarUrl;
  return undefined;
}

export default function Comments({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useSessionUser();
  const pathname = usePathname();
  const loginHref = pathname
    ? `/logowanie?redirectTo=${encodeURIComponent(pathname)}`
    : "/logowanie";

  const {
    comments,
    loading: commentsLoading,
    saving,
    error,
    currentUserId,
    postComment,
    editComment,
    removeComment,
  } = useArticleComments(slug);

  const [draft, setDraft] = useState("");
  const [posted, setPosted] = useState(false);
  const [lastPostedId, setLastPostedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const loading = authLoading || commentsLoading;

  useEffect(() => {
    if (!posted) return;
    const id = window.setTimeout(() => setPosted(false), 2800);
    return () => window.clearTimeout(id);
  }, [posted]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !user || saving) return;

    const newId = await postComment(body);
    if (!newId) return;

    setDraft("");
    setPosted(true);
    setLastPostedId(newId);
  }

  function startEdit(comment: ArticleComment) {
    setEditingId(comment.id);
    setEditDraft(comment.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft("");
  }

  async function saveEdit(id: string) {
    if (!editDraft.trim() || saving) return;
    const ok = await editComment(id, editDraft);
    if (!ok) return;
    setEditingId(null);
    setEditDraft("");
  }

  async function deleteComment(id: string) {
    if (saving) return;
    const ok = await removeComment(id);
    if (!ok) return;
    if (editingId === id) cancelEdit();
  }

  const count = comments.length;
  const heading = useMemo(
    () =>
      `${count} ${count === 1 ? "komentarz" : count >= 2 && count <= 4 ? "komentarze" : "komentarzy"}`,
    [count]
  );

  return (
    <section className="article-panel card-surface p-5 sm:p-7" aria-label="Komentarze">
      <div className="mb-5 flex items-center gap-2.5">
        <MessageCircle size={16} className="text-accent-cyan" />
        <h2 className="text-[15px] font-bold text-text-primary">Komentarze</h2>
        <span className="text-[12px] text-text-muted">· {heading}</span>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-accent-live/30 bg-accent-live/10 px-4 py-2.5 text-[12.5px] text-text-secondary"
        >
          {error}
        </p>
      )}

      <div className="mb-6 min-h-[108px]">
        {loading ? (
          <div className="h-[92px] animate-pulse rounded-xl border border-hairline bg-glass" />
        ) : user ? (
          <form onSubmit={submit}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="Dołącz do dyskusji…"
              className="w-full resize-y rounded-xl border border-hairline bg-black/25 px-4 py-3 text-[13.5px] leading-relaxed text-text-primary outline-none transition-all duration-300 placeholder:text-text-muted focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/20"
            />
            <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <span
                role="status"
                aria-live="polite"
                className="flex min-w-0 items-center gap-1.5 text-[11px] text-text-muted"
              >
                {posted ? (
                  <span className="flex items-center gap-1.5 text-[#22c55e]">
                    <CheckCircle2 size={13} />
                    Komentarz dodany
                  </span>
                ) : (
                  <>
                    Komentujesz jako{" "}
                    <span className="text-text-secondary">{user.name}</span>
                  </>
                )}
              </span>
              <button
                type="submit"
                disabled={!draft.trim() || saving}
                className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-[12.5px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Send size={14} />
                Opublikuj
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-hairline bg-glass px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline text-text-tertiary">
                <Lock size={16} />
              </span>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Zaloguj się, aby dołączyć do dyskusji i komentować artykuły.
              </p>
            </div>
            <Link
              href={loginHref}
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-accent-blue px-4 py-2.5 text-[12.5px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover active:scale-[0.97] sm:w-auto"
            >
              Zaloguj się
            </Link>
          </div>
        )}
      </div>

      {count === 0 ? (
        <p className="rounded-xl border border-dashed border-hairline px-5 py-8 text-center text-[13px] text-text-muted">
          Brak komentarzy.{" "}
          {user
            ? "Bądź pierwszą osobą, która skomentuje."
            : "Zaloguj się, aby skomentować jako pierwszy."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {comments.map((c) => {
            const isOwner =
              !!currentUserId && c.userId === currentUserId;
            const isEditing = editingId === c.id;
            return (
              <li
                key={c.id}
                className="flex gap-3"
                style={
                  c.id === lastPostedId
                    ? {
                        animation:
                          "reveal-fade 0.4s cubic-bezier(0.22,1,0.36,1) both",
                      }
                    : undefined
                }
              >
                <Avatar
                  name={c.author}
                  src={commentAvatarSrc(c, user, isOwner)}
                  size={36}
                />
                <div className="min-w-0 flex-1 rounded-xl border border-hairline bg-space-card px-4 py-3">
                  <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-[13px] font-semibold text-text-primary">
                      {c.author}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {formatWhen(c.createdAt)}
                    </span>
                    {c.editedAt && (
                      <span className="text-[11px] text-text-muted">
                        (edytowano)
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2">
                      <textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={3}
                        className="w-full resize-y rounded-xl border border-hairline bg-black/25 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-text-primary outline-none transition-all duration-300 placeholder:text-text-muted focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/20"
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(c.id)}
                          disabled={!editDraft.trim() || saving}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-blue px-3 py-2 text-[12px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 size={13} />
                          Zapisz
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-glass px-3 py-2 text-[12px] font-medium text-text-secondary transition-all duration-300 hover:border-hairline-strong hover:text-text-primary active:scale-[0.97]"
                        >
                          <X size={13} />
                          Anuluj
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-line break-words text-[13.5px] leading-relaxed text-text-secondary">
                        {c.body}
                      </p>
                      {isOwner && (
                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-text-muted transition-colors duration-200 hover:text-accent-cyan disabled:opacity-50"
                          >
                            <Pencil size={12} />
                            Edytuj
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteComment(c.id)}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-text-muted transition-colors duration-200 hover:text-accent-live disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                            Usuń
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
