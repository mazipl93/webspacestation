"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Heading2, Link2, ListPlus, Loader2 } from "lucide-react";
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
  ArticleFormValues,
  ArticleStatus,
  BylineAuthorOption,
} from "@/lib/admin/types";
import { slugify } from "@/lib/admin/slugify";
import {
  Banner,
  Button,
  Card,
  Field,
  Select,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/admin/primitives";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { canPublishArticle } from "@/lib/auth/permissions";
import {
  CATEGORY_EDITOR_HINTS,
  prepareCategoriesForEditor,
  type CategorySlug,
} from "@/lib/categories";
import {
  hasPublishableBody,
  validatePublishReady,
} from "@/lib/articles/workflow";
import { normalizeArticleTags } from "@/lib/rss/article-tags";
import { cmsArticleTypeLabel, hasCitationFields } from "@/lib/ui/article-kind";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import CoverImageUploader from "@/components/admin/CoverImageUploader";
import ArticleEditorPreviewPane from "@/components/admin/ArticleEditorPreviewPane";
import EditorSection from "@/components/admin/EditorSection";
import {
  EditorControlPanel,
  EditorFieldPanel,
} from "@/components/admin/EditorFieldPanel";
import AuthorBylineField from "@/components/admin/AuthorBylineField";
import {
  combineDateIso,
  combineDatetimeLocal,
  combineTime24,
  datetimeLocalToIso,
  daysInMonth,
  HOURS_24,
  MINUTES_60,
  MONTHS_PL,
  scheduleYearOptions,
  splitDateIso,
  splitDatetimeLocal,
  splitTime24,
  formatScheduleLabel,
  isPublishScheduleDue,
  todayDateParts,
  toDatetimeLocalValue,
  validateScheduleLocal,
} from "@/lib/admin/schedule-datetime";
import {
  clampSocialCardHook,
  clampSocialCardTitle,
  SOCIAL_CARD_HOOK_MAX,
  SOCIAL_CARD_TITLE_MAX,
} from "@/lib/social/share-card-copy";

const EMPTY_FORM: ArticleFormValues = {
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  socialCardTitle: "",
  socialCardHook: "",
  content: "",
  contextNote: "",
  coverImage: "",
  coverImageCredit: "",
  authorByline: "",
  bylineUserId: "",
  categoryId: "",
  featured: false,
  heroPosition: 0,
  weekTopicPosition: 0,
  weekTopic: false,
  readingTime: null,
  tagsText: "",
  sourceName: "",
  sourceUrl: "",
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
    socialCardTitle: a.socialCardTitle ?? "",
    socialCardHook: a.socialCardHook ?? "",
    content: a.content ?? "",
    contextNote: a.contextNote ?? "",
    coverImage: a.coverImage ?? "",
    coverImageCredit: a.coverImageCredit ?? "",
    authorByline: a.authorByline ?? "",
    bylineUserId: a.bylineUserId ?? "",
    categoryId: a.category.id,
    featured: a.featured,
    heroPosition: a.heroPosition ?? 0,
    weekTopicPosition:
      a.weekTopicPosition ?? (a.weekTopic ? 1 : 0),
    weekTopic: a.weekTopic ?? false,
    readingTime: a.readingTime,
    tagsText: tagsToText(a.tags),
    sourceName: a.source ?? "",
    sourceUrl: a.originalUrl ?? "",
    publishAtLocal: toDatetimeLocalValue(a.publishAt),
  };
}

function toPayload(form: ArticleFormValues): ArticleWritePayload {
  return {
    title: form.title,
    slug: form.slug,
    subtitle: form.subtitle || null,
    excerpt: form.excerpt || null,
    socialCardTitle: form.socialCardTitle.trim() || null,
    socialCardHook: form.socialCardHook.trim() || null,
    content: form.content || null,
    contextNote: form.contextNote || null,
    coverImage: form.coverImage.trim() || null,
    coverImageCredit: form.coverImageCredit.trim() || null,
    authorByline: form.bylineUserId ? null : form.authorByline.trim() || null,
    bylineUserId: form.bylineUserId.trim() || null,
    categoryId: form.categoryId,
    tags: parseTagsText(form.tagsText),
    featured: form.featured,
    heroPosition: form.heroPosition,
    weekTopicPosition: form.weekTopicPosition,
    readingTime: form.readingTime,
    source: form.sourceName.trim() || null,
    originalUrl: form.sourceUrl.trim() || null,
  };
}

function canRefineContent(form: ArticleFormValues): boolean {
  return hasCitationFields(form.sourceName, form.sourceUrl);
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

function SchedulePublishFields({
  publishAtLocal,
  onChange,
}: {
  publishAtLocal: string;
  onChange: (value: string) => void;
}) {
  const { date, time } = splitDatetimeLocal(publishAtLocal);
  const { hour, minute } = splitTime24(time);
  const dateParts = splitDateIso(date);
  const today = todayDateParts();
  const years = scheduleYearOptions();

  const dateIso = combineDateIso(
    dateParts.year,
    dateParts.month,
    dateParts.day
  );

  const applySchedule = (
    nextYear: string,
    nextMonth: string,
    nextDay: string,
    nextHour: string,
    nextMinute: string
  ) => {
    const d = combineDateIso(nextYear, nextMonth, nextDay);
    if (!d) return;
    const h = nextHour || hour || "00";
    const m = nextMinute || minute || "00";
    const t = combineTime24(h, m);
    if (!t) return;
    onChange(combineDatetimeLocal(d, t));
  };

  const dayOptions =
    dateParts.year && dateParts.month
      ? Array.from(
          {
            length: daysInMonth(
              Number(dateParts.year),
              Number(dateParts.month)
            ),
          },
          (_, i) => String(i + 1).padStart(2, "0")
        )
      : Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] leading-snug text-text-muted">
        Data i godzina w czasie lokalnym (24h). Przy otwartym CMS publikacja następuje
        automatycznie w ciągu ~30 s po terminie.
      </p>
      <Field label="Data publikacji" hint="Dzień · miesiąc · rok (po polsku)">
        <div className="grid grid-cols-3 gap-2">
          <Select
            id="publishAtDay"
            aria-label="Dzień miesiąca"
            value={dateParts.day}
            onChange={(e) =>
              applySchedule(
                dateParts.year || today.year,
                dateParts.month || today.month,
                e.target.value,
                hour,
                minute
              )
            }
          >
            <option value="">Dzień</option>
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <Select
            id="publishAtMonth"
            aria-label="Miesiąc"
            value={dateParts.month}
            onChange={(e) =>
              applySchedule(
                dateParts.year || today.year,
                e.target.value,
                dateParts.day || today.day,
                hour,
                minute
              )
            }
          >
            <option value="">Miesiąc</option>
            {MONTHS_PL.map((mo) => (
              <option key={mo.value} value={mo.value}>
                {mo.label}
              </option>
            ))}
          </Select>
          <Select
            id="publishAtYear"
            aria-label="Rok"
            value={dateParts.year}
            onChange={(e) =>
              applySchedule(
                e.target.value,
                dateParts.month || today.month,
                dateParts.day || today.day,
                hour,
                minute
              )
            }
          >
            <option value="">Rok</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
      </Field>
      <Field label="Godzina (24h)" hint="Godzina 00–23 i minuta">
        <div className="flex items-center gap-2">
          <Select
            id="publishAtHour"
            aria-label="Godzina 0–23"
            value={hour}
            disabled={!dateIso}
            onChange={(e) => {
              const nextHour = e.target.value;
              applySchedule(
                dateParts.year || today.year,
                dateParts.month || today.month,
                dateParts.day || today.day,
                nextHour,
                minute || "00"
              );
            }}
            className="min-w-0 flex-1"
          >
            <option value="">Godz.</option>
            {HOURS_24.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>
          <span className="text-body font-semibold text-text-secondary" aria-hidden>
            :
          </span>
          <Select
            id="publishAtMinute"
            aria-label="Minuta 0–59"
            value={minute}
            disabled={!dateIso}
            onChange={(e) => {
              applySchedule(
                dateParts.year || today.year,
                dateParts.month || today.month,
                dateParts.day || today.day,
                hour || "00",
                e.target.value
              );
            }}
            className="min-w-0 flex-1"
          >
            <option value="">Min.</option>
            {MINUTES_60.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
      </Field>
    </div>
  );
}

export default function ArticleEditor({ articleId }: { articleId?: string }) {
  const { role, userId } = useAdminAuth();
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
  const [reprocessing, setReprocessing] = useState(false);

  const slugTouched = useRef(Boolean(articleId));
  const dirty = useRef(false);
  const savingRef = useRef(false);
  /** Sync id for persist — avoids duplicate POST before React re-renders. */
  const articleIdRef = useRef<string | null>(articleId ?? null);
  const createInFlightRef = useRef(false);
  /** Pause save after slug conflict until user changes slug. */
  const slugConflictRef = useRef(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const contentSelectionRef = useRef({ start: 0, end: 0 });
  const pendingContentCaretRef = useRef<{ start: number; end: number } | null>(
    null
  );

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

  const showRefinePanel = Boolean(currentId) && canRefineContent(form);
  const typeLabel = cmsArticleTypeLabel(form.sourceName, form.sourceUrl);
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

  useEffect(() => {
    let active = true;
    adminApi.listBylineAuthors().then((rows) => {
      if (active) setBylineAuthors(rows);
    });
    return () => {
      active = false;
    };
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
    return () => {
      active = false;
    };
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
        setLoadedArticle(saved);
        setForm(() => {
          const next = toForm(saved);
          if (
            publishAtLocalDraft.trim() &&
            !next.publishAtLocal.trim()
          ) {
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

  const handleRefineText = async () => {
    if (!currentId || !canRefineContent(form)) return;
    if (
      !window.confirm(
        "Dopracować tekst artykułu? Zajawka i treść zostaną uzupełnione ponownie."
      )
    ) {
      return;
    }
    setReprocessing(true);
    setError(null);
    setEnhanceSuccess(null);
    try {
      const saved = await adminApi.reprocessRssArticle(currentId);
      dirty.current = false;
      setLoadedArticle(saved);
      setForm(toForm(saved));
      setStatus(saved.status);
      setPublishedSlug(saved.status === "PUBLISHED" ? saved.slug : null);
      setLastSavedAt(new Date());
      setEnhanceSuccess("Tekst artykułu został odświeżony.");
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Nie udało się dopracować tekstu."
      );
    } finally {
      setReprocessing(false);
    }
  };

  const update = <K extends keyof ArticleFormValues>(
    key: K,
    value: ArticleFormValues[K]
  ) => {
    dirty.current = true;
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
      return next;
    });
  };

  if (loading) {
    return (
      <div className="card-surface grid place-items-center px-6 py-20 text-meta text-text-tertiary">
        <Loader2 className="mb-3 h-5 w-5 animate-spin" />
        Ładowanie edytora…
      </div>
    );
  }

  const sourceLabel = form.sourceName.trim() || null;
  const previewCredit = form.coverImageCredit.trim() || null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="grid h-9 w-9 place-items-center rounded-[0.55rem] border border-hairline text-text-tertiary transition-colors hover:text-text-primary"
            aria-label="Powrót"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-title font-semibold">
              {currentId ? "Edycja artykułu" : "Nowy artykuł"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <StatusBadge status={status} />
              <span className="rounded-badge border border-hairline bg-white/5 px-2 py-0.5 text-caption text-text-muted">
                {typeLabel}
              </span>
              <span className="text-caption text-text-muted">
                {saving
                  ? savingLabel
                  : lastSavedAt
                    ? `Zapisano ${lastSavedAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`
                    : "Zapisz edycję przyciskiem Zaktualizuj lub Zapisz zmiany"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {publishedSlug ? (
            <Link
              href={`/aktualnosci/${publishedSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-badge border border-hairline bg-glass px-3.5 py-2 text-meta font-semibold text-text-secondary transition-colors hover:text-text-primary"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              Podgląd na portalu
            </Link>
          ) : currentId ? (
            <Link
              href={`/admin/articles/${currentId}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-badge border border-accent-cyan/40 bg-accent-cyan/15 px-3.5 py-2 text-meta font-semibold text-accent-cyan transition-colors hover:bg-accent-cyan/25"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              Preview publikacji
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("editor-live-preview")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-1.5 rounded-badge border border-accent-cyan/40 bg-accent-cyan/15 px-3.5 py-2 text-meta font-semibold text-accent-cyan transition-colors hover:bg-accent-cyan/25"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              Podgląd przed publikacją
            </button>
          )}
          {!currentId ? (
            <button
              type="button"
              disabled={saving || !form.title.trim()}
              onClick={async () => {
                await persist({ draft: true });
                const id = articleIdRef.current;
                if (id) {
                  window.open(
                    `/admin/articles/${id}/preview`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-badge border border-hairline bg-glass px-3.5 py-2 text-meta font-semibold text-text-secondary transition-colors hover:border-hairline-strong hover:text-text-primary disabled:opacity-50"
              title="Zapisuje szkic i otwiera pełny podgląd w nowej karcie"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              Pełny podgląd (szkic)
            </button>
          ) : null}
          {currentId && status !== "PUBLISHED" ? (
            <Button
              variant="primary"
              onClick={() => persist()}
              disabled={saving || !form.categoryId}
              title="Zapisuje wszystkie pola edytora bez zmiany statusu"
            >
              Zapisz zmiany
            </Button>
          ) : null}
          <Button
            variant="ghost"
            onClick={() => persist({ draft: true })}
            disabled={saving}
            title={
              status === "REVIEW"
                ? "Przenieś z kolejki „Do sprawdzenia” do szkiców"
                : undefined
            }
          >
            {status === "REVIEW" ? "Przenieś do szkiców" : "Zapisz szkic"}
          </Button>
          {currentId && status !== "REVIEW" && status !== "PUBLISHED" ? (
            <Button
              variant="ghost"
              onClick={() => persist({ review: true })}
              disabled={saving || !form.categoryId}
            >
              Do sprawdzenia
            </Button>
          ) : null}
        </div>
      </div>

      {status === "PUBLISHED" ? (
        <Card className="mb-5 border-emerald-500/20 bg-emerald-500/[0.04]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-meta text-text-secondary">
              Ten artykuł jest już <strong className="text-text-primary">opublikowany</strong> na
              portalu. Zaplanowanie terminu dotyczy artykułów ze statusu{" "}
              <strong className="text-text-primary">Do sprawdzenia</strong>,{" "}
              <strong className="text-text-primary">Szkic</strong> lub{" "}
              <strong className="text-text-primary">Zaplanowane</strong> — wybierz taki z listy
              CMS.
            </p>
            {mayPublish ? (
              <Button
                onClick={() => persist()}
                disabled={saving || !isFormPublishReady(form)}
                className="shrink-0"
              >
                Zaktualizuj
              </Button>
            ) : null}
          </div>
        </Card>
      ) : mayPublish ? (
        <Card className="mb-5 border-accent-blue/25 bg-accent-blue/[0.04]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-meta font-semibold text-text-primary">Publikacja</h2>
              {status === "REVIEW" ? (
                <p className="mt-1 text-caption text-text-muted">
                  Artykuł z kolejki „Do sprawdzenia” — opublikuj od razu albo ustaw termin
                  (np. +2 min). Przy otwartym CMS publikacja nastąpi automatycznie po terminie.
                </p>
              ) : status === "SCHEDULED" ? (
                <p className="mt-1 text-caption text-text-muted">
                  Artykuł czeka na zaplanowany termin. Możesz go zaktualizować poniżej.
                </p>
              ) : (
                <p className="mt-1 text-caption text-text-muted">
                  Opublikuj od razu lub wybierz datę i godzinę.
                </p>
              )}
              <fieldset className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-6">
                <legend className="sr-only">Tryb publikacji</legend>
                <label className="flex cursor-pointer items-center gap-2 text-meta text-text-secondary">
                  <input
                    type="radio"
                    name="publishMode"
                    checked={publishMode === "now"}
                    onChange={() => setPublishMode("now")}
                    className="accent-accent-blue"
                  />
                  Opublikuj teraz
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-meta text-text-secondary">
                  <input
                    type="radio"
                    name="publishMode"
                    checked={publishMode === "schedule"}
                    onChange={() => {
                      setPublishMode("schedule");
                      if (!form.publishAtLocal.trim()) {
                        update("publishAtLocal", defaultScheduleDatetimeLocal());
                      }
                    }}
                    className="accent-accent-blue"
                  />
                  Zaplanuj publikację
                </label>
              </fieldset>
              {publishMode === "schedule" ? (
                <div className="mt-3 max-w-xl">
                  <SchedulePublishFields
                    publishAtLocal={form.publishAtLocal}
                    onChange={(value) => update("publishAtLocal", value)}
                  />
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {schedulePastDue ? (
                <Button
                  onClick={() => persist({ publish: true })}
                  disabled={saving || !isFormPublishReady(form)}
                >
                  Opublikuj teraz (termin minął)
                </Button>
              ) : null}
              {publishMode === "schedule" ? (
                <Button
                  onClick={() => persist({ schedule: true })}
                  disabled={saving || !isFormPublishReady(form)}
                  title={
                    !hasPublishableBody(form)
                      ? "Treść lub zajawka jest wymagana przed zaplanowaniem publikacji"
                      : !form.categoryId
                        ? "Kategoria jest wymagana przed zaplanowaniem publikacji"
                        : undefined
                  }
                >
                  {status === "SCHEDULED" ? "Zaktualizuj plan" : "Zaplanuj"}
                </Button>
              ) : status !== "SCHEDULED" ? (
                <Button
                  onClick={() => persist({ publish: true })}
                  disabled={saving || !isFormPublishReady(form)}
                  title={
                    !hasPublishableBody(form)
                      ? "Treść lub zajawka jest wymagana przed publikacją"
                      : !form.categoryId
                        ? "Kategoria jest wymagana przed publikacją"
                        : undefined
                  }
                >
                  Opublikuj
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="mb-5 border-hairline bg-white/[0.02]">
          <p className="text-meta text-text-muted">
            Publikacja i planowanie wymagają roli <strong>Edytor</strong> lub{" "}
            <strong>Administrator</strong>.
          </p>
        </Card>
      )}

      {schedulePastDue ? (
        <div className="mb-5">
          <Banner tone="error">
            Termin publikacji minął
            {scheduleDueLabel ? ` (${scheduleDueLabel})` : ""}. Cron mógł jeszcze nie
            zadziałać (na Vercel Hobby często tylko 1× dziennie). Kliknij{" "}
            <strong>Opublikuj teraz (termin minął)</strong> albo uruchom{" "}
            <code className="rounded bg-white/10 px-1">npm run publish:scheduled</code>.
          </Banner>
        </div>
      ) : null}
      {error ? (
        <div className="mb-5">
          <Banner tone="error">{error}</Banner>
        </div>
      ) : null}
      {enhanceSuccess ? (
        <div className="mb-5">
          <Banner tone="success">{enhanceSuccess}</Banner>
        </div>
      ) : null}

      {showRefinePanel ? (
        <Card className="mb-5 border-accent-cyan/20 bg-accent-cyan/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-meta text-text-secondary">
              Uzupełnij zajawkę i treść na podstawie linku źródła.
            </p>
            <Button
              type="button"
              disabled={reprocessing || saving}
              onClick={handleRefineText}
              title="Ponownie uzupełnij zajawkę i treść artykułu"
            >
              {reprocessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Dopracowywanie…
                </>
              ) : (
                "Dopracuj tekst"
              )}
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,38%)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
            <EditorSection
              step={1}
              title="Tytuł i lead"
              description="Podtytuł to krótki dek pod nagłówkiem. Zajawka trafia na karty, SEO i social — nie duplikuj jej w pierwszym akapicie treści."
              tone="content"
            >
              <EditorFieldPanel>
                <Field label="Tytuł" htmlFor="title">
                  <TextInput
                    id="title"
                    value={form.title}
                    placeholder="Nagłówek artykułu"
                    onChange={(e) => update("title", e.target.value)}
                  />
                </Field>
              </EditorFieldPanel>

              <EditorFieldPanel>
                <Field
                  label="Podtytuł"
                  htmlFor="subtitle"
                  hint="Jedno zdanie pod tytułem na stronie artykułu. Nie zastępuje zajawki."
                >
                  <TextInput
                    id="subtitle"
                    value={form.subtitle}
                    placeholder="Krótki dek pod tytułem"
                    onChange={(e) => update("subtitle", e.target.value)}
                  />
                </Field>
              </EditorFieldPanel>

              <EditorFieldPanel>
                <Field
                  label="Slug"
                  htmlFor="slug"
                  hint="Generowany automatycznie z tytułu — można nadpisać."
                >
                  <TextInput
                    id="slug"
                    value={form.slug}
                    placeholder="slug-artykulu"
                    onChange={(e) => {
                      slugTouched.current = true;
                      update("slug", slugify(e.target.value));
                    }}
                  />
                </Field>
              </EditorFieldPanel>

              <EditorFieldPanel>
                <Field
                  label="Zajawka"
                  htmlFor="excerpt"
                  hint="Lead na kartach artykułu i w Google — nie trafia na grafikę FB (osobne pola poniżej)."
                >
                  <TextArea
                    id="excerpt"
                    rows={3}
                    value={form.excerpt}
                    placeholder="Lead na listach — 2–3 zdania."
                    onChange={(e) => update("excerpt", e.target.value)}
                  />
                </Field>
              </EditorFieldPanel>

              <EditorFieldPanel>
                <Field
                  label="Nagłówek na grafice social (FB + IG)"
                  htmlFor="socialCardTitle"
                  hint={`FB 1200×630 · IG 1080×1350 — max ${SOCIAL_CARD_TITLE_MAX} znaków (${form.socialCardTitle.length}/${SOCIAL_CARD_TITLE_MAX}). Caption posta = tytuł artykułu.`}
                >
                  <TextInput
                    id="socialCardTitle"
                    value={form.socialCardTitle}
                    maxLength={SOCIAL_CARD_TITLE_MAX}
                    placeholder="Krótki nagłówek na grafikę — np. pierwsze zdanie tytułu"
                    onChange={(e) =>
                      update(
                        "socialCardTitle",
                        clampSocialCardTitle(e.target.value),
                      )
                    }
                  />
                </Field>
              </EditorFieldPanel>

              <EditorFieldPanel>
                <Field
                  label="Linia pod nagłówkiem (grafika FB)"
                  htmlFor="socialCardHook"
                  hint={`Opcjonalnie — FB i IG. Max ${SOCIAL_CARD_HOOK_MAX} znaków (${form.socialCardHook.length}/${SOCIAL_CARD_HOOK_MAX}).`}
                >
                  <TextInput
                    id="socialCardHook"
                    value={form.socialCardHook}
                    maxLength={SOCIAL_CARD_HOOK_MAX}
                    placeholder="Hook pod nagłówkiem na obrazku"
                    onChange={(e) =>
                      update(
                        "socialCardHook",
                        clampSocialCardHook(e.target.value),
                      )
                    }
                  />
                </Field>
              </EditorFieldPanel>
            </EditorSection>

            <EditorSection
              step={2}
              title="Treść artykułu"
              description="Akapity oddziel pustą linią. Linki https:// działają w podglądzie. Nagłówki, listy, grafiki i wideo — przyciskami poniżej."
              tone="content"
            >
              <EditorFieldPanel>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-center px-2.5 py-2 text-meta sm:w-fit"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const el = contentRef.current;
                      const caretStart =
                        el?.selectionStart ?? contentSelectionRef.current.start;
                      const caretEnd =
                        el?.selectionEnd ?? contentSelectionRef.current.end;
                      const { value, selectionStart, selectionEnd } =
                        insertHeadingAtCaret(form.content, caretStart, caretEnd, 2);
                      pendingContentCaretRef.current = {
                        start: selectionStart,
                        end: selectionEnd,
                      };
                      update("content", value);
                    }}
                  >
                    <Heading2 size={14} aria-hidden />
                    Nagłówek
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-center px-2.5 py-2 text-meta sm:w-fit"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const el = contentRef.current;
                      const caretStart =
                        el?.selectionStart ?? contentSelectionRef.current.start;
                      const caretEnd =
                        el?.selectionEnd ?? contentSelectionRef.current.end;
                      const { value, selectionStart, selectionEnd } =
                        insertLinkAtCaret(form.content, caretStart, caretEnd);
                      pendingContentCaretRef.current = {
                        start: selectionStart,
                        end: selectionEnd,
                      };
                      update("content", value);
                    }}
                  >
                    <Link2 size={14} aria-hidden />
                    Link
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-center px-2.5 py-2 text-meta sm:w-fit"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const el = contentRef.current;
                      const caretStart =
                        el?.selectionStart ?? contentSelectionRef.current.start;
                      const caretEnd =
                        el?.selectionEnd ?? contentSelectionRef.current.end;
                      const { value, selectionStart, selectionEnd } =
                        insertListItemAtCaret(form.content, caretStart, caretEnd);
                      pendingContentCaretRef.current = {
                        start: selectionStart,
                        end: selectionEnd,
                      };
                      update("content", value);
                    }}
                  >
                    <ListPlus size={14} aria-hidden />
                    Dodaj punkt listy
                  </Button>
                  <ContentImageInserter
                    articleId={currentId}
                    disabled={loading}
                    onInsertImage={(src, caption) => {
                      const el = contentRef.current;
                      const caretStart =
                        el?.selectionStart ?? contentSelectionRef.current.start;
                      const caretEnd =
                        el?.selectionEnd ?? contentSelectionRef.current.end;
                      const { value, selectionStart, selectionEnd } =
                        insertContentImageAtCaret(
                          form.content,
                          caretStart,
                          caretEnd,
                          src,
                          caption
                        );
                      pendingContentCaretRef.current = {
                        start: selectionStart,
                        end: selectionEnd,
                      };
                      update("content", value);
                    }}
                  />
                  <ContentVideoInserter
                    disabled={loading}
                    onInsertVideo={(src, caption) => {
                      const el = contentRef.current;
                      const caretStart =
                        el?.selectionStart ?? contentSelectionRef.current.start;
                      const caretEnd =
                        el?.selectionEnd ?? contentSelectionRef.current.end;
                      const { value, selectionStart, selectionEnd } =
                        insertContentVideoAtCaret(
                          form.content,
                          caretStart,
                          caretEnd,
                          src,
                          caption
                        );
                      pendingContentCaretRef.current = {
                        start: selectionStart,
                        end: selectionEnd,
                      };
                      update("content", value);
                    }}
                  />
                </div>
              </EditorFieldPanel>

              <EditorFieldPanel>
                <Field
                  label="Treść"
                  htmlFor="content"
                  hint="Link: wpisz https://… lub [tekst](url). Nagłówek: linia # Tytuł (własny akapit). Wideo: ::video URL (przycisk)."
                >
                  <TextArea
                    ref={contentRef}
                    id="content"
                    rows={14}
                    value={form.content}
                    className="font-mono text-meta"
                    placeholder="Treść artykułu…"
                    onChange={(e) => update("content", e.target.value)}
                    onSelect={syncContentSelection}
                    onKeyUp={syncContentSelection}
                    onClick={syncContentSelection}
                    onFocus={syncContentSelection}
                  />
                </Field>
              </EditorFieldPanel>
            </EditorSection>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EditorSection
            step={3}
            title="Kontekst WSS"
            description="Ramowanie redakcyjne pod treścią — ogólny trend, nie cytat ze źródła."
            tone="meta"
          >
            <EditorFieldPanel>
              <Field label="Kontekst" htmlFor="contextNote">
                <TextArea
                  id="contextNote"
                  rows={4}
                  value={form.contextNote}
                  placeholder="Opcjonalny kontekst dla czytelnika."
                  onChange={(e) => update("contextNote", e.target.value)}
                />
              </Field>
            </EditorFieldPanel>
          </EditorSection>

          <EditorSection
            step={4}
            title="Kategoria i wyróżnienia"
            description="Dział na stronie, tagi oraz ustawienia na homepage."
            tone="meta"
          >
            <EditorFieldPanel>
              <Field
                label="Kategoria"
                htmlFor="category"
                hint={
                  categoryEditorHint ??
                  "Wymagana przed publikacją. Wybierz dział tematyczny (np. Nauka = tylko evergreeny)."
                }
              >
                <Select
                  id="category"
                  value={form.categoryId}
                  onChange={(e) => update("categoryId", e.target.value)}
                >
                  <option value="">Wybierz kategorię…</option>
                  {sortedCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </EditorFieldPanel>

            <EditorFieldPanel>
              <Field
                label="Tagi"
                htmlFor="tags"
                hint="Oddziel przecinkami (maks. 5). Hashtagi w poście na Facebooku — pod linkiem."
              >
                <TextInput
                  id="tags"
                  value={form.tagsText}
                  placeholder="np. Space, NASA, Starship"
                  onChange={(e) => update("tagsText", e.target.value)}
                />
              </Field>
            </EditorFieldPanel>

            <EditorFieldPanel>
              <Field label="Czas czytania (min)" htmlFor="readingTime">
                <TextInput
                  id="readingTime"
                  type="number"
                  min={0}
                  value={form.readingTime ?? ""}
                  placeholder="np. 4"
                  onChange={(e) =>
                    update(
                      "readingTime",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />
              </Field>
            </EditorFieldPanel>

            <EditorControlPanel
              title="Ważne"
              description="Tylko znaczek „Ważne” na kartach i w hero. Nie wpływa na Popularne ani pozycje w sekcjach."
            >
              <Toggle
                checked={form.featured}
                onChange={(v) => update("featured", v)}
              />
            </EditorControlPanel>

            <EditorFieldPanel>
              <Field
                label="Pozycja w hero (strona główna)"
                htmlFor="heroPosition"
                hint="0 = poza sliderem. 1–4 = kolejność slajdów we wszystkich widokach."
              >
                <Select
                  id="heroPosition"
                  value={String(form.heroPosition)}
                  onChange={(e) =>
                    update("heroPosition", Number.parseInt(e.target.value, 10) || 0)
                  }
                >
                  <option value="0">0 — nie w hero</option>
                  <option value="1">1 — pierwszy slajd</option>
                  <option value="2">2 — drugi slajd</option>
                  <option value="3">3 — trzeci slajd</option>
                  <option value="4">4 — czwarty slajd</option>
                </Select>
              </Field>
            </EditorFieldPanel>

            <EditorFieldPanel>
              <Field
                label="Pozycja w „W centrum uwagi”"
                htmlFor="weekTopicPosition"
                hint="0 = poza sekcją. 1–4 = kolejność slajdów (jak hero). Artykuł musi być opublikowany."
              >
                <Select
                  id="weekTopicPosition"
                  value={String(form.weekTopicPosition)}
                  onChange={(e) =>
                    update(
                      "weekTopicPosition",
                      Number.parseInt(e.target.value, 10) || 0
                    )
                  }
                >
                  <option value="0">0 — poza sekcją</option>
                  <option value="1">1 — pierwszy slajd</option>
                  <option value="2">2 — drugi slajd</option>
                  <option value="3">3 — trzeci slajd</option>
                  <option value="4">4 — czwarty slajd</option>
                </Select>
              </Field>
            </EditorFieldPanel>
          </EditorSection>

          <EditorSection
            step={5}
            title="Autor na stronie"
            description="Redakcja (zdjęcie z profilu) albo ręczny podpis. Użytkownicy portalu (USER) nie pojawiają się na liście."
            tone="author"
          >
            <AuthorBylineField
              key={currentId ?? "new"}
              bylineUserId={form.bylineUserId}
              authorByline={form.authorByline}
              authors={bylineAuthors}
              onChangeBylineUserId={(id) => update("bylineUserId", id)}
              onChangeAuthorByline={(text) => update("authorByline", text)}
            />
          </EditorSection>

          <EditorSection
            step={6}
            title="Źródło zewnętrzne"
            description="Dla materiałów z RSS lub cytowania wydawcy."
            tone="default"
          >
            <EditorFieldPanel>
              <Field label="Wydawca" htmlFor="sourceName">
                <TextInput
                  id="sourceName"
                  value={form.sourceName}
                  placeholder="np. SpaceNews"
                  onChange={(e) => update("sourceName", e.target.value)}
                />
              </Field>
            </EditorFieldPanel>
            <EditorFieldPanel>
              <Field label="Link do artykułu" htmlFor="sourceUrl">
                <TextInput
                  id="sourceUrl"
                  value={form.sourceUrl}
                  placeholder="https://…"
                  onChange={(e) => update("sourceUrl", e.target.value)}
                />
              </Field>
            </EditorFieldPanel>
            {form.sourceUrl.trim() ? (
              <EditorFieldPanel>
                <a
                  href={form.sourceUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 break-all text-caption text-accent-cyan hover:underline"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                  Otwórz u wydawcy
                </a>
              </EditorFieldPanel>
            ) : null}
          </EditorSection>
          </div>

          <EditorSection
            step={7}
            title="Okładka"
            description="Zdjęcie hero artykułu — upload lub link. Podpis zdjęcia osobno."
            tone="media"
          >
            <EditorFieldPanel>
              <Field label="Plik lub URL okładki" hint="Upload (WebP) lub wklej link">
                <CoverImageUploader
                  articleId={currentId}
                  coverUrl={form.coverImage.trim()}
                  onCoverUrl={(url) => update("coverImage", url)}
                  disabled={loading}
                />
              </Field>
            </EditorFieldPanel>
            <EditorFieldPanel>
              <Field label="Obraz okładki (URL)" htmlFor="coverImage">
                <TextInput
                  id="coverImage"
                  value={form.coverImage}
                  placeholder="https://… lub upload powyżej"
                  onChange={(e) => update("coverImage", e.target.value)}
                />
              </Field>
            </EditorFieldPanel>
            <EditorFieldPanel>
              <Field
                label="Podpis zdjęcia"
                htmlFor="coverImageCredit"
                hint="Autor zdjęcia, licencja, źródło ilustracji. Puste = przy RSS auto-podpis z pola Źródło."
              >
                <TextArea
                  id="coverImageCredit"
                  rows={3}
                  value={form.coverImageCredit}
                  placeholder="np. NASA / Joel Kowsky · CC BY-NC 2.0"
                  onChange={(e) => update("coverImageCredit", e.target.value)}
                />
              </Field>
            </EditorFieldPanel>
            {previewCredit ? (
              <EditorFieldPanel>
                <p className="text-[10px] text-text-muted">Podgląd podpisu pod okładką:</p>
                <CoverImageCredit variant="hero" credit={previewCredit} />
              </EditorFieldPanel>
            ) : null}
          </EditorSection>
        </div>

        <aside
          id="editor-live-preview"
          className="min-w-0 lg:sticky lg:top-4 lg:self-start"
        >
          <div className="overflow-hidden rounded-[0.75rem] border border-hairline bg-white/[0.03] p-3 sm:p-4">
            <ArticleEditorPreviewPane
              form={form}
              categories={categories}
              status={status}
              contentOrigin={loadedArticle?.contentOrigin}
              articleId={currentId}
              bylineAuthors={bylineAuthors}
              className="lg:min-h-[calc(100dvh-10rem)]"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
