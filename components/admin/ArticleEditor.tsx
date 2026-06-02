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
  getAdminArticleTags,
  inferRssSource,
  isRssAggregatorArticle,
} from "@/lib/admin/rss-display";
import {
  buildRssImageCredit,
  getRssImageCreditForArticle,
} from "@/lib/rss/image-credit";
import CoverImageCredit from "@/components/article/CoverImageCredit";

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
};

const AUTOSAVE_DELAY = 1500;
const READONLY_FIELD =
  "cursor-default opacity-90 read-only:border-hairline-faint read-only:bg-white/[0.02]";

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
  };
}

export default function ArticleEditor({ articleId }: { articleId?: string }) {
  const { role } = useAdminAuth();
  const mayPublish = canPublishArticle(role);

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<ArticleFormValues>(EMPTY_FORM);
  const [status, setStatus] = useState<ArticleStatus>("DRAFT");
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const [currentId, setCurrentId] = useState<string | null>(articleId ?? null);
  const [loadedArticle, setLoadedArticle] = useState<AdminArticle | null>(null);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [saving, setSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState<string>("");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState(false);

  const slugTouched = useRef(Boolean(articleId));
  const dirty = useRef(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

  const isRss =
    loadedArticle !== null && isRssAggregatorArticle(loadedArticle);

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
    async (opts: { publish?: boolean; silent?: boolean } = {}) => {
      if (savingRef.current) return;
      if (!form.title.trim()) {
        if (!opts.silent) setError("Tytuł jest wymagany.");
        return;
      }
      if (!form.categoryId) {
        if (!opts.silent) setError("Wybierz kategorię przed zapisem lub publikacją.");
        return;
      }

      savingRef.current = true;
      setSaving(true);
      setSavingLabel(opts.publish ? "Publikowanie…" : "Zapisywanie…");
      setError(null);

      try {
        const payload = toPayload(form);
        if (opts.publish) payload.status = "PUBLISHED";

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
    if (!isRss && !form.title.trim()) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      persist({ silent: true });
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [form, persist, isRss]);

  const handleReprocessAi = async () => {
    if (!currentId || !loadedArticle || !isRss) return;
    if (
      !window.confirm(
        "Ponownie uruchomić OpenAI (gpt-5.4-mini)? Lead, treść, kontekst WSS i tagi zostaną nadpisane."
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
    setAiSuccess(null);
    try {
      const saved = await adminApi.reprocessRssArticle(currentId);
      dirty.current = false;
      setLoadedArticle(saved);
      setForm(toForm(saved));
      setStatus(saved.status);
      setPublishedSlug(saved.status === "PUBLISHED" ? saved.slug : null);
      setLastSavedAt(new Date());
      setAiSuccess("AI zaktualizowało lead, treść, kontekst WSS i tagi.");
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Nie udało się ponowić przetwarzania AI."
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
      if (key === "title" && !slugTouched.current && !isRss) {
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

  const rssTags = loadedArticle ? getAdminArticleTags(loadedArticle) : [];

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
            <div className="mt-1 flex items-center gap-2.5">
              <StatusBadge status={status} />
              <span className="text-caption text-text-muted">
                {saving
                  ? savingLabel
                  : lastSavedAt
                    ? `Zapisano ${lastSavedAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`
                    : isRss
                      ? "Artykuł RSS — edytujesz kategorię; treść z AI"
                      : "Niezapisane zmiany zapisują się automatycznie"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          {!isRss ? (
            <Button variant="ghost" onClick={() => persist()} disabled={saving}>
              Zapisz szkic
            </Button>
          ) : null}
          <Button
            onClick={() => persist({ publish: true })}
            disabled={saving || !mayPublish || !form.categoryId}
            title={
              !form.categoryId
                ? "Wybierz kategorię przed publikacją"
                : mayPublish
                  ? undefined
                  : "Twoja rola nie pozwala na publikację"
            }
          >
            {status === "PUBLISHED" ? "Zaktualizuj" : "Opublikuj"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-5">
          <Banner tone="error">{error}</Banner>
        </div>
      ) : null}
      {aiSuccess ? (
        <div className="mb-5">
          <Banner tone="success">{aiSuccess}</Banner>
        </div>
      ) : null}

      {isRss && loadedArticle ? (
        <Card className="mb-5 border-accent-cyan/20 bg-accent-cyan/[0.04]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-overline font-semibold uppercase tracking-wide text-accent-cyan">
              Źródło RSS
              {(() => {
                const label = inferRssSource(loadedArticle);
                return label ? ` · ${label}` : null;
              })()}
            </p>
            <Button
              type="button"
              disabled={reprocessing || saving}
              onClick={handleReprocessAi}
              title="OpenAI: lead, treść, kontekst WSS, tagi"
            >
              {reprocessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Poprawianie…
                </>
              ) : (
                "Popraw z AI"
              )}
            </Button>
          </div>
          {loadedArticle.originalUrl ? (
            <a
              href={loadedArticle.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 break-all text-meta font-medium text-accent-cyan hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {loadedArticle.originalUrl}
            </a>
          ) : (
            <Banner tone="error">
              Brak linku do oryginału — uruchom ingest RSS lub uzupełnij URL.
            </Banner>
          )}
          {rssTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {rssTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-badge border border-hairline bg-white/[0.04] px-2 py-0.5 text-caption text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-4">
            <Field label="Tytuł" htmlFor="title">
              <TextInput
                id="title"
                value={form.title}
                placeholder="Nagłówek artykułu"
                readOnly={isRss}
                className={isRss ? READONLY_FIELD : undefined}
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>

            {!isRss ? (
              <Field label="Podtytuł" htmlFor="subtitle">
                <TextInput
                  id="subtitle"
                  value={form.subtitle}
                  placeholder="Krótki dek pod tytułem"
                  onChange={(e) => update("subtitle", e.target.value)}
                />
              </Field>
            ) : null}

            {!isRss ? (
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
            ) : null}

            <Field
              label={isRss ? "Lead (publiczny)" : "Zajawka"}
              htmlFor="excerpt"
              hint={
                isRss
                  ? "1–2 zdania w hero. Bez wzmianki o wydawcy — źródło jest w stopce."
                  : undefined
              }
            >
              <TextArea
                id="excerpt"
                rows={isRss ? 2 : 3}
                value={form.excerpt}
                readOnly={isRss}
                className={isRss ? READONLY_FIELD : undefined}
                placeholder="Lead wyświetlany pod tytułem."
                onChange={(e) => update("excerpt", e.target.value)}
              />
            </Field>
          </Card>

          <Card className="flex flex-col gap-2">
            <Field
              label={isRss ? "Treść (AI)" : "Treść"}
              htmlFor="content"
              hint={
                isRss
                  ? "2–4 akapity na stronie artykułu. Generowane przez AI z RSS."
                  : "Markdown lub zwykły tekst. Akapity oddzielaj pustą linią."
              }
            >
              <TextArea
                id="content"
                rows={isRss ? 10 : 16}
                value={form.content}
                readOnly={isRss}
                className={isRss ? READONLY_FIELD : "font-mono text-meta"}
                placeholder={isRss ? "Brak treści — uruchom Popraw z AI." : "Treść artykułu…"}
                onChange={(e) => update("content", e.target.value)}
              />
            </Field>
          </Card>

          {isRss ? (
            <Card className="flex flex-col gap-2">
              <Field
                label="Kontekst WSS (AI)"
                htmlFor="contextNote"
                hint="Ramowanie redakcyjne — ogólny trend, nie cytat ze źródła."
              >
                <TextArea
                  id="contextNote"
                  rows={3}
                  value={form.contextNote}
                  readOnly
                  className={READONLY_FIELD}
                  placeholder="Brak kontekstu — uruchom Popraw z AI."
                  onChange={(e) => update("contextNote", e.target.value)}
                />
              </Field>
            </Card>
          ) : null}
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

            <Field label="Czas czytania (min)" htmlFor="readingTime">
              <TextInput
                id="readingTime"
                type="number"
                min={0}
                value={form.readingTime ?? ""}
                readOnly={isRss}
                className={isRss ? READONLY_FIELD : undefined}
                placeholder="np. 4"
                onChange={(e) =>
                  update(
                    "readingTime",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </Field>

            {!isRss ? (
              <div className="flex items-center justify-between border-t border-hairline-faint pt-4">
                <span className="text-meta text-text-secondary">Wyróżniony</span>
                <Toggle
                  checked={form.featured}
                  onChange={(v) => update("featured", v)}
                />
              </div>
            ) : null}
          </Card>

          <Card className="flex flex-col gap-4">
            <Field label="Obraz okładki (URL)" htmlFor="coverImage">
              <TextInput
                id="coverImage"
                value={form.coverImage}
                readOnly={isRss}
                className={isRss ? READONLY_FIELD : undefined}
                placeholder="https://…"
                onChange={(e) => update("coverImage", e.target.value)}
              />
            </Field>
            {form.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.coverImage}
                alt={
                  isRss
                    ? getRssImageCreditForArticle(loadedArticle!) ?? "Okładka RSS"
                    : "Podgląd okładki"
                }
                className="aspect-video w-full rounded-[0.6rem] border border-hairline object-cover"
              />
            ) : (
              <div className="grid aspect-video w-full place-items-center rounded-[0.6rem] border border-dashed border-hairline text-caption text-text-muted">
                Brak okładki
              </div>
            )}
            {isRss && loadedArticle ? (
              <CoverImageCredit
                variant="compact"
                credit={
                  getRssImageCreditForArticle(loadedArticle) ??
                  buildRssImageCredit(loadedArticle.source ?? "")
                }
                source={inferRssSource(loadedArticle) ?? undefined}
                originalUrl={loadedArticle.originalUrl ?? undefined}
              />
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
