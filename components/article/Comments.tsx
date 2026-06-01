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
import Avatar from "@/components/profile/Avatar";

type StoredComment = {
  id: string;
  author: string;
  authorEmail?: string; // owner identity — enables edit/delete by author
  authorAvatarUrl?: string; // profile picture at post time (from user_metadata)
  body: string;
  createdAt: string; // ISO
  editedAt?: string; // ISO, set when the author edits
};

// NOTE: comments are persisted in localStorage for now. The data shape mirrors
// what a Supabase `comments` table will store later (author / body / createdAt),
// so swapping the storage layer won't require UI changes.
function storageKey(slug: string) {
  return `wss:comments:${slug}`;
}

function readComments(slug: string): StoredComment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeComments(slug: string, comments: StoredComment[]) {
  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(comments));
  } catch {
    /* storage unavailable — keep in-memory only */
  }
}

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
  comment: StoredComment,
  currentUser: { email: string; avatarUrl?: string } | null
): string | undefined {
  if (comment.authorAvatarUrl) return comment.authorAvatarUrl;
  if (
    currentUser?.avatarUrl &&
    comment.authorEmail &&
    comment.authorEmail === currentUser.email
  ) {
    return currentUser.avatarUrl;
  }
  return undefined;
}

export default function Comments({ slug }: { slug: string }) {
  const { user, loading } = useSessionUser();
  const pathname = usePathname();
  const loginHref = pathname
    ? `/logowanie?redirectTo=${encodeURIComponent(pathname)}`
    : "/logowanie";
  const [comments, setComments] = useState<StoredComment[]>([]);
  const [draft, setDraft] = useState("");
  const [posted, setPosted] = useState(false);
  const [lastPostedId, setLastPostedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    setComments(readComments(slug));
  }, [slug]);

  // Auto-clear the success confirmation.
  useEffect(() => {
    if (!posted) return;
    const id = window.setTimeout(() => setPosted(false), 2800);
    return () => window.clearTimeout(id);
  }, [posted]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !user) return;

    const next: StoredComment[] = [
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now()),
        author: user.name,
        authorEmail: user.email,
        authorAvatarUrl: user.avatarUrl,
        body,
        createdAt: new Date().toISOString(),
      },
      ...comments,
    ];
    setComments(next);
    setDraft("");
    setPosted(true);
    setLastPostedId(next[0].id);
    writeComments(slug, next);
  }

  function startEdit(comment: StoredComment) {
    setEditingId(comment.id);
    setEditDraft(comment.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft("");
  }

  function saveEdit(id: string) {
    const body = editDraft.trim();
    if (!body) return;
    const next = comments.map((c) =>
      c.id === id ? { ...c, body, editedAt: new Date().toISOString() } : c
    );
    setComments(next);
    writeComments(slug, next);
    setEditingId(null);
    setEditDraft("");
  }

  function deleteComment(id: string) {
    const next = comments.filter((c) => c.id !== id);
    setComments(next);
    writeComments(slug, next);
    if (editingId === id) cancelEdit();
  }

  const count = comments.length;
  const heading = useMemo(
    () => `${count} ${count === 1 ? "komentarz" : count >= 2 && count <= 4 ? "komentarze" : "komentarzy"}`,
    [count]
  );

  return (
    <section className="card-surface p-5 sm:p-7" aria-label="Komentarze">
      <div className="mb-5 flex items-center gap-2.5">
        <MessageCircle size={16} className="text-accent-cyan" />
        <h2 className="text-[15px] font-bold text-text-primary">Komentarze</h2>
        <span className="text-[12px] text-text-muted">· {heading}</span>
      </div>

      {/* ── Composer / login gate ── */}
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
            <div className="mt-2.5 flex items-center justify-between">
              <span
                role="status"
                aria-live="polite"
                className="flex items-center gap-1.5 text-[11px] text-text-muted"
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
                disabled={!draft.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-[12.5px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
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
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-accent-blue px-4 py-2.5 text-[12.5px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover active:scale-[0.97]"
            >
              Zaloguj się
            </Link>
          </div>
        )}
      </div>

      {/* ── Comment list ── */}
      {count === 0 ? (
        <p className="rounded-xl border border-dashed border-hairline px-5 py-8 text-center text-[13px] text-text-muted">
          Brak komentarzy. {user ? "Bądź pierwszą osobą, która skomentuje." : "Zaloguj się, aby skomentować jako pierwszy."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {comments.map((c) => {
            const isOwner = !!user && !!c.authorEmail && c.authorEmail === user.email;
            const isEditing = editingId === c.id;
            return (
              <li
                key={c.id}
                className="flex gap-3"
                style={c.id === lastPostedId ? {
                  animation: "reveal-fade 0.4s cubic-bezier(0.22,1,0.36,1) both"
                } : undefined}
              >
                <Avatar
                  name={c.author}
                  src={commentAvatarSrc(c, user)}
                  size={36}
                />
                <div className="min-w-0 flex-1 rounded-xl border border-hairline bg-space-card px-4 py-3">
                  <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-[13px] font-semibold text-text-primary">{c.author}</span>
                    <span className="text-[11px] text-text-muted">{formatWhen(c.createdAt)}</span>
                    {c.editedAt && (
                      <span className="text-[11px] text-text-muted">(edytowano)</span>
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
                          disabled={!editDraft.trim()}
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
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-text-muted transition-colors duration-200 hover:text-accent-cyan"
                          >
                            <Pencil size={12} />
                            Edytuj
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteComment(c.id)}
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-text-muted transition-colors duration-200 hover:text-accent-live"
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
