"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { adminApi, ApiError, type ArticleWritePayload } from "@/lib/admin/api";
import type {
  AdminArticle,
  AdminCategory,
  ArticleFormValues,
  ArticleStatus,
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
  buildRssImageCredit,
  getRssImageCreditForArticle,
} from "@/lib/rss/image-credit";
import { normalizeArticleTags } from "@/lib/rss/article-tags";
import { cmsArticleTypeLabel, hasCitationFields } from "@/lib/ui/article-kind";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import ArticleEditorPreviewPane from "@/components/admin/ArticleEditorPreviewPane";
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

const EMPTY_FORM: ArticleFormValues = {
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  content: "",
  contextNote: "",
  coverImage: "",
  categoryId: "",
  featured: false,
  readingTime: null,
  tagsText: "",
  sourceName: "",
  sourceUrl: "",
  publishAtLocal: "",
};

const AUTOSAVE_DELAY = 1500;

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
    contextNote: a.contextNote ?? "",
    coverImage: a.coverImage ?? "",
    categoryId: a.category.id,
    featured: a.featured,
    readingTime: a.readingTime,
    tagsText: tagsToText(a.tags),
    sourceName: a.source ?? "",
    sourceUrl: a.originalUrl ?? "",
    publishAtLocal: toDatetimeLocalValue(a.publishAt),
  };
}

/** Autosave — content fields only; never status. */
function toAutosavePayload(form: ArticleFormValues): ArticleWritePayload {
  return {
    title: form.title,
    content: form.content || null,
    coverImage: form.coverImage.trim() || null,
    categoryId: form.categoryId,
    tags: parseTagsText(form.tagsText),
  };
}

function toPayload(form: ArticleFormValues): ArticleWritePayload {
  return {
    ...toAutosavePayload(form),
    slug: form.slug,
    subtitle: form.subtitle || null,
    excerpt: form.excerpt || null,
    contextNote: form.contextNote || null,
    featured: form.featured,
    readingTime: form.readingTime,
    source: form.sourceName.trim() || null,
    originalUrl: form.sourceUrl.trim() || null,
  };
}

function canRefineContent(form: ArticleFormValues): boolean {
  return hasCitationFields(form.sourceName, form.sourceUrl);
}

function defaultScheduleTimeLocal(): string {
  const d = new Date(Date.now() + 120_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
        Data i godzina w czasie lokalnym (24h). Po „Zaplanuj” artykuł czeka na cron
        serwera (ok. raz na godzinę, w :00) — nie w dokładnej minucie. Lokalnie:
        <code className="mx-0.5 rounded bg-white/10 px-1">npm run publish:scheduled</code>.
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
  const { role } = useAdminAuth();
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
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  /** Sync id for persist/autosave — avoids duplicate POST before React re-renders. */
  const articleIdRef = useRef<string | null>(articleId ?? null);
  const createInFlightRef = useRef(false);
  /** Pause autosave after slug conflict until user changes slug. */
  const autosaveBlockedRef = useRef(false);

  const showRefinePanel = Boolean(currentId) && canRefineContent(form);
  const typeLabel = cmsArticleTypeLabel(form.sourceName, form.sourceUrl);
  const schedulePastDue =
    status === "SCHEDULED" &&
    isPublishScheduleDue(loadedArticle?.publishAt ?? null);
  const scheduleDueLabel = loadedArticle?.publishAt
    ? formatScheduleLabel(new Date(loadedArticle.publishAt))
    : null;

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
          setForm(toForm(article));
          setStatus(article.status);
          setPublishedSlug(article.status === "PUBLISHED" ? article.slug : null);
          setPublishMode(article.status === "SCHEDULED" ? "schedule" : "now");
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
      setPublishMode(article.status === "SCHEDULED" ? "schedule" : "now");
    } catch {
      // ignore — poller / user retry
    }
  }, []);

  useEffect(() => {
    const onPublished = () => void reloadArticle();
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
        silent?: boolean;
      } = {}
    ) => {
      if (savingRef.current) return;
      if (!form.title.trim()) {
        if (!opts.silent) setError("Tytuł jest wymagany.");
        return;
      }
      if (!form.categoryId) {
        if (!opts.silent) setError("Wybierz kategorię przed zapisem lub publikacją.");
        return;
      }
      if (opts.schedule && !form.publishAtLocal.trim()) {
        if (!opts.silent) setError("Podaj datę zaplanowanej publikacji.");
        return;
      }
      if (opts.schedule) {
        const scheduleCheck = validateScheduleLocal(form.publishAtLocal);
        if (!scheduleCheck.ok) {
          if (!opts.silent) setError(scheduleCheck.message);
          return;
        }
      }
      if (!articleIdRef.current && createInFlightRef.current) return;

      savingRef.current = true;
      setSaving(true);
      setSavingLabel(
        opts.publish ? "Publikowanie…" : opts.schedule ? "Planowanie…" : "Zapisywanie…"
      );
      setError(null);

      const publishAtLocalDraft = form.publishAtLocal;

      try {
        let saved: AdminArticle;
        const activeId = articleIdRef.current;

        if (!activeId) {
          createInFlightRef.current = true;
          const createPayload: ArticleWritePayload = {
            ...toPayload(form),
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
          autosaveBlockedRef.current = false;
          setCurrentId(saved.id);
          window.history.replaceState(null, "", `/admin/articles/${saved.id}/edit`);
        } else if (opts.publish) {
          await adminApi.updateArticle(activeId, toPayload(form));
          saved = await adminApi.updateArticle(activeId, { status: "PUBLISHED" });
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
          saved = await adminApi.updateArticle(activeId, toPayload(form));
          if (saved.status !== "DRAFT" && saved.status !== "PUBLISHED") {
            saved = await adminApi.updateArticle(activeId, { status: "DRAFT" });
          }
        } else if (opts.silent) {
          saved = await adminApi.updateArticle(activeId, toAutosavePayload(form));
        } else {
          saved = await adminApi.updateArticle(activeId, toPayload(form));
        }

        dirty.current = false;
        setLoadedArticle(saved);
        setForm(() => {
          const next = toForm(saved);
          if (
            opts.silent &&
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
      } catch (e) {
        if (e instanceof ApiError && e.status === 409 && !articleIdRef.current) {
          autosaveBlockedRef.current = true;
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
    [form]
  );

  useEffect(() => {
    if (!dirty.current) return;
    if (loading) return;
    if (articleId && !loadedArticle) return;
    if (!form.categoryId) return;
    if (!form.title.trim()) return;
    if (autosaveBlockedRef.current) return;
    if (createInFlightRef.current) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      persist({ silent: true });
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [form, persist, loading, articleId, loadedArticle]);

  const handleRefineText = async () => {
    if (!currentId || !canRefineContent(form)) return;
    if (
      !window.confirm(
        "Dopracować tekst artykułu? Zajawka i treść zostaną uzupełnione ponownie."
      )
    ) {
      return;
    }
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
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
    if (key === "slug") {
      autosaveBlockedRef.current = false;
    }
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugTouched.current) {
        next.slug = slugify(String(value));
        autosaveBlockedRef.current = false;
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
                    : "Niezapisane zmiany zapisują się automatycznie"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {mayPublish && status !== "PUBLISHED" ? (
            <div className="flex min-w-[220px] flex-col gap-2 rounded-[0.55rem] border border-hairline bg-white/[0.02] px-3 py-2.5">
              <fieldset className="flex flex-col gap-1.5">
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
                    onChange={() => setPublishMode("schedule")}
                    className="accent-accent-blue"
                  />
                  Zaplanuj publikację
                </label>
              </fieldset>
              {publishMode === "schedule" ? (
                <SchedulePublishFields
                  publishAtLocal={form.publishAtLocal}
                  onChange={(value) => update("publishAtLocal", value)}
                />
              ) : null}
            </div>
          ) : null}

          {currentId ? (
            <Link
              href={
                publishedSlug
                  ? `/aktualnosci/${publishedSlug}`
                  : `/admin/articles/${currentId}/preview`
              }
              target="_blank"
              rel="noopener noreferrer"
              className={
                publishedSlug
                  ? "inline-flex items-center gap-1.5 rounded-badge border border-hairline bg-glass px-3.5 py-2 text-meta font-semibold text-text-secondary transition-colors hover:text-text-primary"
                  : "inline-flex items-center gap-1.5 rounded-badge border border-accent-cyan/40 bg-accent-cyan/15 px-3.5 py-2 text-meta font-semibold text-accent-cyan transition-colors hover:bg-accent-cyan/25"
              }
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              {publishedSlug ? "Podgląd na portalu" : "Preview publikacji"}
            </Link>
          ) : null}
          <Button variant="ghost" onClick={() => persist({ draft: true })} disabled={saving}>
            Zapisz szkic
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
          {mayPublish && schedulePastDue ? (
            <Button
              onClick={() => persist({ publish: true })}
              disabled={saving || !form.categoryId || !form.content.trim()}
            >
              Opublikuj teraz (termin minął)
            </Button>
          ) : null}
          {mayPublish ? (
            publishMode === "schedule" && status !== "PUBLISHED" ? (
              <Button
                onClick={() => persist({ schedule: true })}
                disabled={saving || !form.categoryId || !form.content.trim()}
                title={
                  !form.content.trim()
                    ? "Treść jest wymagana przed zaplanowaniem publikacji"
                    : undefined
                }
              >
                {status === "SCHEDULED" ? "Zaktualizuj plan" : "Zaplanuj"}
              </Button>
            ) : status !== "SCHEDULED" ? (
              <Button
                onClick={() => persist({ publish: true })}
                disabled={saving || !form.categoryId || !form.content.trim()}
                title={
                  !form.content.trim()
                    ? "Treść jest wymagana przed publikacją"
                    : undefined
                }
              >
                {status === "PUBLISHED" ? "Zaktualizuj" : "Opublikuj"}
              </Button>
            ) : null
          ) : null}
        </div>
      </div>

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

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto xl:pr-1">
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-4">
            <Field label="Tytuł" htmlFor="title">
              <TextInput
                id="title"
                value={form.title}
                placeholder="Nagłówek artykułu"
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>

            <Field label="Podtytuł" htmlFor="subtitle">
              <TextInput
                id="subtitle"
                value={form.subtitle}
                placeholder="Krótki dek pod tytułem"
                onChange={(e) => update("subtitle", e.target.value)}
              />
            </Field>

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

            <Field label="Zajawka" htmlFor="excerpt">
              <TextArea
                id="excerpt"
                rows={3}
                value={form.excerpt}
                placeholder="Lead wyświetlany pod tytułem."
                onChange={(e) => update("excerpt", e.target.value)}
              />
            </Field>
          </Card>

          <Card className="flex flex-col gap-2">
            <Field
              label="Treść"
              htmlFor="content"
              hint="Markdown lub zwykły tekst. Akapity oddzielaj pustą linią."
            >
              <TextArea
                id="content"
                rows={16}
                value={form.content}
                className="font-mono text-meta"
                placeholder="Treść artykułu…"
                onChange={(e) => update("content", e.target.value)}
              />
            </Field>
          </Card>

          <Card className="flex flex-col gap-2">
            <Field
              label="Kontekst WSS"
              htmlFor="contextNote"
              hint="Ramowanie redakcyjne — ogólny trend, nie cytat ze źródła."
            >
              <TextArea
                id="contextNote"
                rows={3}
                value={form.contextNote}
                placeholder="Opcjonalny kontekst dla czytelnika."
                onChange={(e) => update("contextNote", e.target.value)}
              />
            </Field>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-4">
            <Field label="Kategoria" htmlFor="category" hint="Wymagana przed publikacją.">
              <Select
                id="category"
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
              >
                <option value="">Wybierz kategorię…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Tagi"
              htmlFor="tags"
              hint="Oddziel przecinkami (maks. 5)."
            >
              <TextInput
                id="tags"
                value={form.tagsText}
                placeholder="np. Space, NASA, Starship"
                onChange={(e) => update("tagsText", e.target.value)}
              />
            </Field>

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

            <div className="flex items-center justify-between border-t border-hairline-faint pt-4">
              <span className="text-meta text-text-secondary">Wyróżniony</span>
              <Toggle
                checked={form.featured}
                onChange={(v) => update("featured", v)}
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <p className="text-meta font-semibold text-text-primary">
              Źródło (opcjonalne)
            </p>
            <Field label="Wydawca" htmlFor="sourceName">
              <TextInput
                id="sourceName"
                value={form.sourceName}
                placeholder="np. SpaceNews"
                onChange={(e) => update("sourceName", e.target.value)}
              />
            </Field>
            <Field label="Link do artykułu" htmlFor="sourceUrl">
              <TextInput
                id="sourceUrl"
                value={form.sourceUrl}
                placeholder="https://…"
                onChange={(e) => update("sourceUrl", e.target.value)}
              />
            </Field>
            {form.sourceUrl.trim() ? (
              <a
                href={form.sourceUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 break-all text-caption text-accent-cyan hover:underline"
              >
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                Otwórz u wydawcy
              </a>
            ) : null}
          </Card>

          <Card className="flex flex-col gap-4">
            <Field label="Obraz okładki (URL)" htmlFor="coverImage">
              <TextInput
                id="coverImage"
                value={form.coverImage}
                placeholder="https://…"
                onChange={(e) => update("coverImage", e.target.value)}
              />
            </Field>
            {form.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.coverImage}
                alt={
                  loadedArticle && getRssImageCreditForArticle(loadedArticle)
                    ? getRssImageCreditForArticle(loadedArticle)!
                    : "Podgląd okładki"
                }
                className="aspect-video w-full rounded-[0.6rem] border border-hairline object-cover"
              />
            ) : (
              <div className="grid aspect-video w-full place-items-center rounded-[0.6rem] border border-dashed border-hairline text-caption text-text-muted">
                Brak okładki
              </div>
            )}
            {loadedArticle &&
            (form.sourceUrl.trim() || form.sourceName.trim()) ? (
              <CoverImageCredit
                variant="compact"
                credit={
                  getRssImageCreditForArticle({
                    ...loadedArticle,
                    source: form.sourceName.trim() || loadedArticle.source,
                    originalUrl: form.sourceUrl.trim() || loadedArticle.originalUrl,
                  }) ?? buildRssImageCredit(form.sourceName.trim() || "źródło")
                }
                source={sourceLabel ?? undefined}
                originalUrl={form.sourceUrl.trim() || undefined}
              />
            ) : null}
          </Card>
        </div>
      </div>
        </div>

        <div className="w-full shrink-0 xl:sticky xl:top-4 xl:w-[min(48%,520px)] xl:max-w-[520px]">
          <ArticleEditorPreviewPane
            form={form}
            categories={categories}
            status={status}
            contentOrigin={loadedArticle?.contentOrigin}
            articleId={currentId}
            className="h-[min(72vh,900px)] xl:h-[calc(100dvh-8rem)]"
          />
        </div>
      </div>
    </div>
  );
}
