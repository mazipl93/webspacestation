"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Heading2, Link2, ListPlus, Loader2, Pencil } from "lucide-react";
import { insertListItemAtCaret } from "@/lib/articles/content-list";
import { insertContentImageAtCaret } from "@/lib/articles/content-image";
import { insertHeadingAtCaret } from "@/lib/articles/content-heading";
import { insertLinkAtCaret } from "@/lib/articles/content-link";
import { insertContentVideoAtCaret } from "@/lib/articles/content-video";
import ContentImageInserter from "@/components/admin/ContentImageInserter";
import ContentVideoInserter from "@/components/admin/ContentVideoInserter";
import { adminApi, ApiError, type ArticleWritePayload } from "@/lib/admin/api";
import type {
  AdminArticle,
  AdminCategory,
  ArticleContentKind,
  ArticleFormValues,
  ArticleStatus,
  BylineAuthorOption,
} from "@/lib/admin/types";
import { slugify } from "@/lib/admin/slugify";
import { Banner, Button, Field } from "@/components/admin/primitives";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { canPublishArticle } from "@/lib/auth/permissions";
import {
  CATEGORY_EDITOR_HINTS,
  prepareCategoriesForEditor,
  type CategorySlug,
} from "@/lib/categories";
import { defaultContentKindForCategory } from "@/lib/articles/content-kind";
import { normalizeArticleTags } from "@/lib/rss/article-tags";
import ArticleEditorPreviewPane from "@/components/admin/ArticleEditorPreviewPane";
import EditorTopBar from "@/components/admin/EditorTopBar";
import EditorSidebar from "@/components/admin/EditorSidebar";
import {
  datetimeLocalToIso,
  formatScheduleLabel,
  isPublishScheduleDue,
  toDatetimeLocalValue,
  validateScheduleLocal,
} from "@/lib/admin/schedule-datetime";
import { validatePublishReady } from "@/lib/articles/workflow";

// ─── Form helpers ─────────────────────────────────────────────────────────────

const EMPTY_FORM: ArticleFormValues = {
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  content: "",
  coverImage: "",
  coverImageCredit: "",
  authorByline: "",
  bylineUserId: "",
  categoryId: "",
  contentKind: "NEWS",
  featured: false,
  heroPosition: 0,
  weekTopicPosition: 0,
  weekTopic: false,
  readingTime: null,
  tagsText: "",
  publishAtLocal: "",
};

function tagsToText(tags: string[] | undefined): string {
  return (tags ?? []).filter((t) => t.trim()).join(", ");
}

function parseTagsText(text: string): string[] {
  return normalizeArticleTags(
    text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  );
}

function toForm(a: AdminArticle): ArticleFormValues {
  return {
    title: a.title,
    slug: a.slug,
    subtitle: a.subtitle ?? "",
    excerpt: a.excerpt ?? "",
    content: a.content ?? "",
    coverImage: a.coverImage ?? "",
    coverImageCredit: a.coverImageCredit ?? "",
    authorByline: a.authorByline ?? "",
    bylineUserId: a.bylineUserId ?? "",
    categoryId: a.category.id,
    contentKind: a.contentKind,
    featured: a.featured,
    heroPosition: a.heroPosition ?? 0,
    weekTopicPosition: a.weekTopicPosition ?? (a.weekTopic ? 1 : 0),
    weekTopic: a.weekTopic ?? false,
    readingTime: a.readingTime,
    tagsText: tagsToText(a.tags),
    publishAtLocal: toDatetimeLocalValue(a.publishAt),
  };
}

function toPayload(form: ArticleFormValues): ArticleWritePayload {
  return {
    title: form.title,
    slug: form.slug,
    subtitle: form.subtitle || null,
    excerpt: form.excerpt || null,
    content: form.content || null,
    coverImage: form.coverImage.trim() || null,
    coverImageCredit: form.coverImageCredit.trim() || null,
    authorByline: form.bylineUserId ? null : form.authorByline.trim() || null,
    bylineUserId: form.bylineUserId.trim() || null,
    categoryId: form.categoryId,
    contentKind: form.contentKind,
    tags: parseTagsText(form.tagsText),
    featured: form.featured,
    heroPosition: form.heroPosition,
    weekTopicPosition: form.weekTopicPosition,
    readingTime: form.readingTime,
  };
}

function isFormPublishReady(form: ArticleFormValues): boolean {
  return validatePublishReady({
    title: form.title,
    content: form.content || null,
    excerpt: form.excerpt || null,
    categoryId: form.categoryId,
  }).ok;
}

/** Omit empty categoryId so legacy rows without category can still save draft. */
function toDraftPayload(form: ArticleFormValues): ArticleWritePayload {
  const payload = toPayload(form);
  if (!form.categoryId.trim()) {
    const { categoryId: _omit, ...rest } = payload;
    return rest;
  }
  return payload;
}

function defaultScheduleDatetimeLocal(): string {
  const d = new Date(Date.now() + 120_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function applyDefaultScheduleForm(form: ArticleFormValues): ArticleFormValues {
  if (form.publishAtLocal.trim()) return form;
  return { ...form, publishAtLocal: defaultScheduleDatetimeLocal() };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BARE_INPUT =
  "w-full bg-transparent border-none shadow-none outline-none ring-0 " +
  "focus:ring-0 focus:outline-none placeholder:text-text-muted/40 px-0 py-1";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ArticleEditor({ articleId }: { articleId?: string }) {
  const { role } = useAdminAuth();
  const [bylineAuthors, setBylineAuthors] = useState<BylineAuthorOption[]>([]);
  const mayPublish = canPublishArticle(role);

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<ArticleFormValues>(EMPTY_FORM);
  const [status, setStatus] = useState<ArticleStatus>("DRAFT");
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");

  const [currentId, setCurrentId] = useState<string | null>(articleId ?? null);
  const [loadedArticle, setLoadedArticle] = useState<AdminArticle | null>(null);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [saving, setSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState<string>("");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enhanceSuccess, setEnhanceSuccess] = useState<string | null>(null);

  // UI state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDirtyDisplay, setIsDirtyDisplay] = useState(false);
  const [slugEditOpen, setSlugEditOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const slugTouched = useRef(Boolean(articleId));
  const dirty = useRef(false);
  const savingRef = useRef(false);
  const articleIdRef = useRef<string | null>(articleId ?? null);
  const createInFlightRef = useRef(false);
  const slugConflictRef = useRef(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const contentSelectionRef = useRef({ start: 0, end: 0 });
  const pendingContentCaretRef = useRef<{ start: number; end: number } | null>(null);

  const syncContentSelection = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    contentSelectionRef.current = {
      start: el.selectionStart,
      end: el.selectionEnd,
    };
  }, []);

  useLayoutEffect(() => {
    const pending = pendingContentCaretRef.current;
    if (!pending) return;
    pendingContentCaretRef.current = null;
    const el = contentRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.setSelectionRange(pending.start, pending.end);
  }, [form.content]);

  const schedulePastDue =
    status === "SCHEDULED" &&
    isPublishScheduleDue(loadedArticle?.publishAt ?? null);
  const scheduleDueLabel = loadedArticle?.publishAt
    ? formatScheduleLabel(new Date(loadedArticle.publishAt))
    : null;

  const sortedCategories = useMemo(
    () => prepareCategoriesForEditor(categories),
    [categories]
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId) ?? null,
    [categories, form.categoryId]
  );

  const categoryEditorHint = selectedCategory
    ? CATEGORY_EDITOR_HINTS[selectedCategory.slug as CategorySlug]
    : undefined;

  // ── Data loading ─────────────────────────────────────────────────────────────

  useEffect(() => {
    let active = true;
    adminApi.listBylineAuthors().then((rows) => {
      if (active) setBylineAuthors(rows);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cats = await adminApi.listCategories();
        if (active) setCategories(cats);
        if (articleId) {
          const article = await adminApi.getArticle(articleId);
          if (!active) return;
          articleIdRef.current = article.id;
          setLoadedArticle(article);
          const initialForm = toForm(article);
          const initialMode =
            article.status === "SCHEDULED" || article.status === "REVIEW"
              ? "schedule"
              : "now";
          setForm(
            initialMode === "schedule"
              ? applyDefaultScheduleForm(initialForm)
              : initialForm
          );
          setStatus(article.status);
          setPublishedSlug(article.status === "PUBLISHED" ? article.slug : null);
          setPublishMode(initialMode);
        }
      } catch (e) {
        if (active) {
          setError(e instanceof ApiError ? e.message : "Nie udało się załadować danych.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [articleId]);

  const reloadArticle = useCallback(async () => {
    const id = articleIdRef.current;
    if (!id) return;
    try {
      const article = await adminApi.getArticle(id);
      setLoadedArticle(article);
      setForm(toForm(article));
      setStatus(article.status);
      setPublishedSlug(article.status === "PUBLISHED" ? article.slug : null);
      setPublishMode(
        article.status === "SCHEDULED" || article.status === "REVIEW"
          ? "schedule"
          : "now"
      );
    } catch {
      // ignore — poller / user retry
    }
  }, []);

  useEffect(() => {
    const onPublished = async () => {
      await reloadArticle();
      setEnhanceSuccess(
        "Zaplanowana publikacja wykonana. Jeśli artykułu nie ma w Najnowsze na homepage — odśwież ją (Ctrl+F5)."
      );
    };
    window.addEventListener("wss:scheduled-published", onPublished);
    return () => window.removeEventListener("wss:scheduled-published", onPublished);
  }, [reloadArticle]);

  useEffect(() => {
    if (!schedulePastDue || !articleIdRef.current) return;
    void adminApi
      .publishDueScheduled()
      .then((result) => {
        if (result.published > 0) void reloadArticle();
      })
      .catch(() => {});
  }, [schedulePastDue, reloadArticle]);

  // ── Autosave (CMS-ED-2) ───────────────────────────────────────────────────────

  useEffect(() => {
    const idSnapshot = currentId;
    if (!isDirtyDisplay || !idSnapshot || status === "PUBLISHED" || savingRef.current) return;

    const timer = setTimeout(async () => {
      if (!dirty.current || savingRef.current) return;
      try {
        await adminApi.updateArticle(idSnapshot, toDraftPayload(form));
        dirty.current = false;
        setIsDirtyDisplay(false);
        setLastSavedAt(new Date());
      } catch {
        // silent — topbar pokazuje "Niezapisany"
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [form, currentId, status, isDirtyDisplay]);

  // ── Persist ───────────────────────────────────────────────────────────────────

  const persist = useCallback(
    async (
      opts: {
        publish?: boolean;
        schedule?: boolean;
        review?: boolean;
        draft?: boolean;
      } = {}
    ) => {
      if (savingRef.current) return;
      if (!form.title.trim()) {
        setError("Tytuł jest wymagany.");
        return;
      }
      if (
        !form.categoryId &&
        !opts.draft &&
        (opts.publish || opts.schedule || opts.review || Boolean(articleIdRef.current))
      ) {
        setError("Wybierz kategorię przed zapisem lub publikacją.");
        return;
      }
      if (opts.schedule && !form.publishAtLocal.trim()) {
        setError("Podaj datę zaplanowanej publikacji.");
        return;
      }
      if (opts.schedule) {
        const scheduleCheck = validateScheduleLocal(form.publishAtLocal);
        if (!scheduleCheck.ok) {
          setError(scheduleCheck.message);
          return;
        }
      }
      if (!articleIdRef.current && createInFlightRef.current) return;

      savingRef.current = true;
      setSaving(true);
      setSavingLabel(
        opts.publish && status !== "PUBLISHED"
          ? "Publikowanie…"
          : opts.schedule
            ? "Planowanie…"
            : "Zapisywanie…"
      );
      setError(null);

      const publishAtLocalDraft = form.publishAtLocal;

      try {
        let saved: AdminArticle;
        const activeId = articleIdRef.current;

        if (!activeId) {
          createInFlightRef.current = true;
          const basePayload = opts.draft ? toDraftPayload(form) : toPayload(form);
          const createPayload: ArticleWritePayload = {
            ...basePayload,
            status: opts.publish
              ? "PUBLISHED"
              : opts.schedule
                ? "SCHEDULED"
                : "DRAFT",
          };
          if (opts.schedule) {
            createPayload.publishAt = datetimeLocalToIso(form.publishAtLocal);
          }
          saved = await adminApi.createArticle(createPayload);
          articleIdRef.current = saved.id;
          slugConflictRef.current = false;
          setCurrentId(saved.id);
          window.history.replaceState(null, "", `/admin/articles/${saved.id}/edit`);
        } else if (opts.publish) {
          saved = await adminApi.updateArticle(activeId, toPayload(form));
          if (status !== "PUBLISHED") {
            saved = await adminApi.updateArticle(activeId, { status: "PUBLISHED" });
          }
        } else if (opts.schedule) {
          await adminApi.updateArticle(activeId, toPayload(form));
          saved = await adminApi.updateArticle(activeId, {
            status: "SCHEDULED",
            publishAt: datetimeLocalToIso(form.publishAtLocal),
          });
        } else if (opts.review) {
          await adminApi.updateArticle(activeId, toPayload(form));
          saved = await adminApi.updateArticle(activeId, { status: "REVIEW" });
        } else if (opts.draft) {
          saved = await adminApi.updateArticle(activeId, toDraftPayload(form));
          if (saved.status !== "DRAFT" && saved.status !== "PUBLISHED") {
            saved = await adminApi.updateArticle(activeId, { status: "DRAFT" });
          }
        } else {
          saved = await adminApi.updateArticle(activeId, toPayload(form));
        }

        dirty.current = false;
        setIsDirtyDisplay(false);
        setLoadedArticle(saved);
        setForm(() => {
          const next = toForm(saved);
          if (publishAtLocalDraft.trim() && !next.publishAtLocal.trim()) {
            next.publishAtLocal = publishAtLocalDraft;
          }
          return next;
        });
        setStatus(saved.status);
        setPublishedSlug(saved.status === "PUBLISHED" ? saved.slug : null);
        setPublishMode(saved.status === "SCHEDULED" ? "schedule" : "now");
        setLastSavedAt(new Date());
        setEnhanceSuccess("Zapisano zmiany w artykule.");
      } catch (e) {
        if (e instanceof ApiError && e.status === 409 && !articleIdRef.current) {
          slugConflictRef.current = true;
          setError(
            "Ten slug jest już zajęty. Zmień slug albo otwórz istniejący artykuł z listy."
          );
        } else {
          setError(e instanceof ApiError ? e.message : "Zapis nie powiódł się.");
        }
      } finally {
        createInFlightRef.current = false;
        savingRef.current = false;
        setSaving(false);
        setSavingLabel("");
      }
    },
    [form, status]
  );

  // ── Update ────────────────────────────────────────────────────────────────────

  const update = <K extends keyof ArticleFormValues>(
    key: K,
    value: ArticleFormValues[K]
  ) => {
    dirty.current = true;
    setIsDirtyDisplay(true);
    setEnhanceSuccess(null);
    if (key === "slug") {
      slugConflictRef.current = false;
    }
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugTouched.current) {
        next.slug = slugify(String(value));
        slugConflictRef.current = false;
      }
      if (key === "categoryId") {
        const cat = categories.find((c) => c.id === value);
        if (cat) {
          next.contentKind = defaultContentKindForCategory(
            cat.slug
          ) as ArticleContentKind;
        }
      }
      return next;
    });
  };

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-space-bg text-meta text-text-tertiary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie edytora…
        </div>
      </div>
    );
  }

  const isPublishReady = isFormPublishReady(form);

  // ── Sidebar props (shared between desktop aside and mobile drawer) ────────────

  const sidebarProps = {
    form,
    update,
    onSlugChange: (value: string) => {
      slugTouched.current = true;
      update("slug", slugify(value));
    },
    sortedCategories,
    bylineAuthors,
    categoryEditorHint,
    status,
    publishedSlug,
    currentId,
    saving,
    canPublish: mayPublish,
    schedulePastDue,
    scheduleDueLabel,
    publishMode,
    onSetPublishMode: setPublishMode,
    onPublish: () => persist({ publish: true }),
    onSaveDraft: () => persist({ draft: true }),
    onSubmitReview: () => persist({ review: true }),
    onSchedule: () => persist({ schedule: true }),
    onUpdate: () => persist(),
    isPublishReady,
  } as const;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-space-bg">
      <EditorTopBar
        title={form.title}
        status={status}
        lastSavedAt={lastSavedAt}
        dirty={isDirtyDisplay}
        saving={saving}
        canPublish={mayPublish}
        onSave={() => persist()}
        onSaveDraft={() => persist({ draft: true })}
        onPublish={() => persist({ publish: true })}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      {saving && savingLabel && (
        <div className="flex h-0.5 shrink-0 items-center overflow-hidden">
          <div className="h-full w-full animate-pulse bg-accent-blue/40" />
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── Content area ── */}
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-6 py-8 lg:px-10 lg:py-10">

            {/* Banners */}
            {schedulePastDue && (
              <div className="mb-5">
                <Banner tone="error">
                  Termin publikacji minął
                  {scheduleDueLabel ? ` (${scheduleDueLabel})` : ""}. Cron mógł jeszcze
                  nie zadziałać. Kliknij <strong>Zaplanuj/Opublikuj</strong> w panelu
                  po prawej lub użyj{" "}
                  <code className="rounded bg-white/10 px-1">npm run publish:scheduled</code>.
                </Banner>
              </div>
            )}
            {error && (
              <div className="mb-5">
                <Banner tone="error">{error}</Banner>
              </div>
            )}
            {enhanceSuccess && (
              <div className="mb-5">
                <Banner tone="success">{enhanceSuccess}</Banner>
              </div>
            )}

            {/* Title */}
            <input
              id="title"
              type="text"
              value={form.title}
              placeholder="Tytuł artykułu"
              onChange={(e) => update("title", e.target.value)}
              className={`${BARE_INPUT} text-[1.875rem] font-bold leading-tight text-text-primary`}
            />

            {/* Inline slug preview / edit */}
            {slugEditOpen ? (
              <div className="mb-3 mt-1">
                <input
                  id="slug"
                  type="text"
                  value={form.slug}
                  placeholder="slug-artykulu"
                  autoFocus
                  onChange={(e) => {
                    slugTouched.current = true;
                    update("slug", slugify(e.target.value));
                  }}
                  onBlur={() => setSlugEditOpen(false)}
                  className={`${BARE_INPUT} text-meta text-text-secondary border-b border-hairline`}
                />
              </div>
            ) : (
              <div className="mb-3 mt-1 flex items-center gap-1.5 text-[11px] text-text-muted">
                <span>/aktualnosci/</span>
                <span className="text-text-tertiary">{form.slug || "—"}</span>
                <button
                  type="button"
                  onClick={() => setSlugEditOpen(true)}
                  className="text-text-muted transition-colors hover:text-text-primary"
                  aria-label="Edytuj slug"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Subtitle */}
            <input
              id="subtitle"
              type="text"
              value={form.subtitle}
              placeholder="Podtytuł (opcjonalny)"
              onChange={(e) => update("subtitle", e.target.value)}
              className={`${BARE_INPUT} text-[1.125rem] text-text-secondary`}
            />

            <div className="my-4 border-b border-hairline-faint" />

            {/* Toolbar */}
            <div className="mb-3 flex flex-wrap gap-1">
              <Button
                type="button"
                variant="ghost"
                className="px-2.5 py-1.5 text-meta"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const el = contentRef.current;
                  const caretStart = el?.selectionStart ?? contentSelectionRef.current.start;
                  const caretEnd = el?.selectionEnd ?? contentSelectionRef.current.end;
                  const { value, selectionStart, selectionEnd } = insertHeadingAtCaret(
                    form.content, caretStart, caretEnd, 2
                  );
                  pendingContentCaretRef.current = { start: selectionStart, end: selectionEnd };
                  update("content", value);
                }}
              >
                <Heading2 size={14} aria-hidden />
                Nagłówek
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="px-2.5 py-1.5 text-meta"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const el = contentRef.current;
                  const caretStart = el?.selectionStart ?? contentSelectionRef.current.start;
                  const caretEnd = el?.selectionEnd ?? contentSelectionRef.current.end;
                  const { value, selectionStart, selectionEnd } = insertLinkAtCaret(
                    form.content, caretStart, caretEnd
                  );
                  pendingContentCaretRef.current = { start: selectionStart, end: selectionEnd };
                  update("content", value);
                }}
              >
                <Link2 size={14} aria-hidden />
                Link
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="px-2.5 py-1.5 text-meta"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const el = contentRef.current;
                  const caretStart = el?.selectionStart ?? contentSelectionRef.current.start;
                  const caretEnd = el?.selectionEnd ?? contentSelectionRef.current.end;
                  const { value, selectionStart, selectionEnd } = insertListItemAtCaret(
                    form.content, caretStart, caretEnd
                  );
                  pendingContentCaretRef.current = { start: selectionStart, end: selectionEnd };
                  update("content", value);
                }}
              >
                <ListPlus size={14} aria-hidden />
                Lista
              </Button>
              <ContentImageInserter
                articleId={currentId}
                disabled={false}
                onInsertImage={(src, caption) => {
                  const el = contentRef.current;
                  const caretStart = el?.selectionStart ?? contentSelectionRef.current.start;
                  const caretEnd = el?.selectionEnd ?? contentSelectionRef.current.end;
                  const { value, selectionStart, selectionEnd } = insertContentImageAtCaret(
                    form.content, caretStart, caretEnd, src, caption
                  );
                  pendingContentCaretRef.current = { start: selectionStart, end: selectionEnd };
                  update("content", value);
                }}
              />
              <ContentVideoInserter
                disabled={false}
                onInsertVideo={(src, caption) => {
                  const el = contentRef.current;
                  const caretStart = el?.selectionStart ?? contentSelectionRef.current.start;
                  const caretEnd = el?.selectionEnd ?? contentSelectionRef.current.end;
                  const { value, selectionStart, selectionEnd } = insertContentVideoAtCaret(
                    form.content, caretStart, caretEnd, src, caption
                  );
                  pendingContentCaretRef.current = { start: selectionStart, end: selectionEnd };
                  update("content", value);
                }}
              />
            </div>

            <div className="mb-4 border-b border-hairline-faint" />

            {/* Content */}
            <textarea
              ref={contentRef}
              id="content"
              value={form.content}
              placeholder="Zacznij pisać…"
              onChange={(e) => update("content", e.target.value)}
              onSelect={syncContentSelection}
              onKeyUp={syncContentSelection}
              onClick={syncContentSelection}
              onFocus={syncContentSelection}
              className={`${BARE_INPUT} min-h-[420px] resize-none font-mono text-[15px] leading-[1.8] text-text-primary`}
            />

            <div className="my-4 border-b border-hairline-faint" />

            {/* Excerpt */}
            <Field
              label="Zajawka (lead)"
              htmlFor="excerpt"
              hint="Lead na kartach artykułu i w Google — 2–3 zdania."
            >
              <textarea
                id="excerpt"
                rows={4}
                value={form.excerpt}
                placeholder="Lead na listach — 2–3 zdania."
                onChange={(e) => update("excerpt", e.target.value)}
                className={`${BARE_INPUT} resize-none text-[14px] leading-relaxed text-text-secondary border-b border-hairline/30`}
              />
            </Field>

            {/* Collapsible preview */}
            <button
              type="button"
              onClick={() => setShowPreview((p) => !p)}
              className="mt-8 flex items-center gap-2 text-meta text-text-muted transition-colors hover:text-text-primary"
            >
              {showPreview ? "▾" : "▸"} Podgląd artykułu
            </button>
            {showPreview && (
              <div className="mt-4 overflow-hidden rounded-[0.75rem] border border-hairline bg-white/[0.03] p-3 sm:p-4">
                <ArticleEditorPreviewPane
                  form={form}
                  categories={categories}
                  status={status}
                  contentOrigin={loadedArticle?.contentOrigin}
                  articleId={currentId}
                  bylineAuthors={bylineAuthors}
                />
              </div>
            )}

            {/* Bottom padding for comfortable scrolling */}
            <div className="h-16" />
          </div>
        </main>

        {/* ── Desktop sidebar ── */}
        <aside className="hidden w-[320px] shrink-0 overflow-y-auto border-l border-hairline lg:block">
          <EditorSidebar {...sidebarProps} />
        </aside>

        {/* ── Mobile sidebar drawer ── */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute bottom-0 right-0 top-0 w-[320px] overflow-y-auto border-l border-hairline bg-space-surface">
              <EditorSidebar {...sidebarProps} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
