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

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(local: string): string | null {
  if (!local.trim()) return null;
  const d = new Date(local);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

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

function toPayload(form: ArticleFormValues): ArticleWritePayload {
  return {
    title: form.title,
    slug: form.slug,
    subtitle: form.subtitle || null,
    excerpt: form.excerpt || null,
    content: form.content || null,
    contextNote: form.contextNote || null,
    coverImage: form.coverImage || null,
    categoryId: form.categoryId,
    featured: form.featured,
    readingTime: form.readingTime,
    tags: parseTagsText(form.tagsText),
    source: form.sourceName.trim() || null,
    originalUrl: form.sourceUrl.trim() || null,
  };
}

function canRefineContent(form: ArticleFormValues): boolean {
  return hasCitationFields(form.sourceName, form.sourceUrl);
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

  const showRefinePanel = Boolean(currentId) && canRefineContent(form);
  const typeLabel = cmsArticleTypeLabel(form.sourceName, form.sourceUrl);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cats = await adminApi.listCategories();
        if (active) setCategories(cats);
        if (articleId) {
          const article = await adminApi.getArticle(articleId);
          if (!active) return;
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

  const persist = useCallback(
    async (opts: { publish?: boolean; schedule?: boolean; silent?: boolean } = {}) => {
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

      savingRef.current = true;
      setSaving(true);
      setSavingLabel(
        opts.publish ? "Publikowanie…" : opts.schedule ? "Planowanie…" : "Zapisywanie…"
      );
      setError(null);

      try {
        const payload = toPayload(form);
        if (opts.publish) payload.status = "PUBLISHED";
        if (opts.schedule) {
          payload.status = "SCHEDULED";
          payload.publishAt = datetimeLocalToIso(form.publishAtLocal);
        }

        let saved: AdminArticle;
        if (!currentId) {
          saved = await adminApi.createArticle(payload);
          setCurrentId(saved.id);
          window.history.replaceState(null, "", `/admin/articles/${saved.id}/edit`);
        } else {
          saved = await adminApi.updateArticle(currentId, payload);
        }

        dirty.current = false;
        setLoadedArticle(saved);
        setForm(toForm(saved));
        setStatus(saved.status);
        setPublishedSlug(saved.status === "PUBLISHED" ? saved.slug : null);
        setPublishMode(saved.status === "SCHEDULED" ? "schedule" : "now");
        setLastSavedAt(new Date());
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Zapis nie powiódł się.");
      } finally {
        savingRef.current = false;
        setSaving(false);
        setSavingLabel("");
      }
    },
    [form, currentId]
  );

  useEffect(() => {
    if (!dirty.current) return;
    if (!form.categoryId) return;
    if (!form.title.trim()) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      persist({ silent: true });
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [form, persist]);

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
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugTouched.current) {
        next.slug = slugify(String(value));
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
                <Field label="Zaplanowana publikacja (publishAt)">
                  <TextInput
                    type="datetime-local"
                    value={form.publishAtLocal}
                    onChange={(e) => update("publishAtLocal", e.target.value)}
                  />
                </Field>
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
          <Button variant="ghost" onClick={() => persist()} disabled={saving}>
            Zapisz szkic
          </Button>
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
            ) : (
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
            )
          ) : null}
        </div>
      </div>

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
