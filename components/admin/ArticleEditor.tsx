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

const EMPTY_FORM: ArticleFormValues = {
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  content: "",
  coverImage: "",
  categoryId: "",
  featured: false,
  readingTime: null,
};

const AUTOSAVE_DELAY = 1500;

function toForm(a: AdminArticle): ArticleFormValues {
  return {
    title: a.title,
    slug: a.slug,
    subtitle: a.subtitle ?? "",
    excerpt: a.excerpt ?? "",
    content: a.content ?? "",
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
  const [loading, setLoading] = useState(Boolean(articleId));
  const [saving, setSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState<string>("");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slugTouched = useRef(Boolean(articleId));
  const dirty = useRef(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cats = await adminApi.listCategories();
        if (active) setCategories(cats);
        if (articleId) {
          const article = await adminApi.getArticle(articleId);
          if (!active) return;
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

  // ── Core save routine (shared by autosave, manual save, publish) ──────────
  const persist = useCallback(
    async (opts: { publish?: boolean; silent?: boolean } = {}) => {
      if (savingRef.current) return;
      if (!form.title.trim()) {
        if (!opts.silent) setError("Tytuł jest wymagany.");
        return;
      }
      if (!form.categoryId) {
        if (!opts.silent) setError("Wybierz kategorię.");
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
          // Update the URL to the canonical edit route WITHOUT a client
          // navigation, so the editor instance (and any in-flight keystrokes)
          // is preserved instead of remounting.
          window.history.replaceState(null, "", `/admin/articles/${saved.id}/edit`);
        } else {
          saved = await adminApi.updateArticle(currentId, payload);
        }

        dirty.current = false;
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

  // ── Debounced autosave on changes ─────────────────────────────────────────
  useEffect(() => {
    if (!dirty.current) return;
    if (!form.title.trim() || !form.categoryId) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      persist({ silent: true });
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [form, persist]);

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

  return (
    <div>
      {/* ── Top bar ── */}
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
                    : "Niezapisane zmiany zapisują się automatycznie"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {publishedSlug ? (
            <Link
              href={`/aktualnosci/${publishedSlug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-meta text-text-tertiary transition-colors hover:text-text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Podgląd
            </Link>
          ) : null}
          <Button variant="ghost" onClick={() => persist()} disabled={saving}>
            Zapisz szkic
          </Button>
          <Button
            onClick={() => persist({ publish: true })}
            disabled={saving || !mayPublish}
            title={mayPublish ? undefined : "Twoja rola nie pozwala na publikację"}
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

      {/* ── Layout: main + sidebar ── */}
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
                placeholder="Streszczenie wyświetlane na listach."
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
                placeholder="Treść artykułu…"
                className="font-mono text-meta"
                onChange={(e) => update("content", e.target.value)}
              />
            </Field>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-4">
            <Field label="Kategoria" htmlFor="category">
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
                alt="Podgląd okładki"
                className="aspect-video w-full rounded-[0.6rem] border border-hairline object-cover"
              />
            ) : (
              <div className="grid aspect-video w-full place-items-center rounded-[0.6rem] border border-dashed border-hairline text-caption text-text-muted">
                Brak okładki
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
