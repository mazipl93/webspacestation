"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, Trash2 } from "lucide-react";
import { adminApi, ApiError } from "@/lib/admin/api";
import { traceArticleCmsRender } from "@/lib/admin/article-trace";
import type { AdminArticle } from "@/lib/admin/types";
import PageHeader from "@/components/admin/PageHeader";
import ArticlesTable from "@/components/admin/ArticlesTable";
import ArchiveArticlesTable from "@/components/admin/ArchiveArticlesTable";
import { Banner, Button } from "@/components/admin/primitives";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { canDeleteArticle } from "@/lib/auth/permissions";
import { cn } from "@/lib/cn";
import { isPublishScheduleDue } from "@/lib/admin/schedule-datetime";

const FILTERS = [
  { id: "draft", label: "Szkic", status: "DRAFT" },
  { id: "review", label: "Do sprawdzenia", status: "REVIEW" },
  { id: "published", label: "Opublikowane", status: "PUBLISHED" },
  { id: "scheduled", label: "Zaplanowane", status: "SCHEDULED" },
  { id: "all", label: "Wszystkie", status: "ALL" },
  { id: "archive", label: "Archiwum", status: "ARCHIVED" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function ArticlesListPage() {
  const { role } = useAdminAuth();
  const mayDelete = canDeleteArticle(role);

  const [filter, setFilter] = useState<FilterId>("all");
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [publishingDue, setPublishingDue] = useState(false);
  const [permanentBusy, setPermanentBusy] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isArchiveView = filter === "archive";

  const dueScheduledCount = articles.filter(
    (a) => a.status === "SCHEDULED" && isPublishScheduleDue(a.publishAt)
  ).length;

  const allIds = useMemo(() => articles.map((a) => a.id), [articles]);
  const selectedCount = selectedIds.size;

  const load = useCallback(async (current: FilterId) => {
    setLoading(true);
    setError(null);
    try {
      const status = FILTERS.find((f) => f.id === current)?.status ?? "ALL";
      const data = await adminApi.listArticles({ status });
      traceArticleCmsRender(data);
      setArticles(data);
      setSelectedIds((prev) => {
        const next = new Set<string>();
        for (const id of prev) {
          if (data.some((a) => a.id === id)) next.add(id);
        }
        return next;
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Nie udało się załadować artykułów.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  useEffect(() => {
    const onPublished = () => void load(filter);
    window.addEventListener("wss:scheduled-published", onPublished);
    return () => window.removeEventListener("wss:scheduled-published", onPublished);
  }, [filter, load]);

  const handleFilterChange = (id: FilterId) => {
    setFilter(id);
    if (id !== "archive") setSelectedIds(new Set());
  };

  const handlePublish = async (article: AdminArticle) => {
    setBusyId(article.id);
    try {
      await adminApi.updateArticle(article.id, { status: "PUBLISHED" });
      await load(filter);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Nie udało się opublikować.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (article: AdminArticle) => {
    if (!window.confirm(`Odrzucić „${article.title}” (archiwum)?`)) return;
    setBusyId(article.id);
    try {
      await adminApi.archiveArticle(article.id);
      await load(filter);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Nie udało się odrzucić.");
    } finally {
      setBusyId(null);
    }
  };

  const handlePublishAllDue = async () => {
    setPublishingDue(true);
    setError(null);
    try {
      const result = await adminApi.publishDueScheduled();
      if (result.published === 0 && result.due > 0) {
        setError(
          "Żaden zaplanowany artykuł nie został opublikowany (sprawdź treść i kategorię w edytorze)."
        );
      }
      await load(filter);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Nie udało się opublikować zaplanowanych."
      );
    } finally {
      setPublishingDue(false);
    }
  };

  const handleArchive = async (article: AdminArticle) => {
    if (!window.confirm(`Zarchiwizować „${article.title}”?`)) return;
    setBusyId(article.id);
    try {
      await adminApi.archiveArticle(article.id);
      await load(filter);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Nie udało się zarchiwizować.");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(allIds) : new Set());
  };

  const handlePermanentDelete = async () => {
    if (selectedCount === 0) return;
    const label =
      selectedCount === 1
        ? "1 artykuł zostanie trwale usunięty z bazy danych."
        : `${selectedCount} artykułów zostanie trwale usuniętych z bazy danych.`;
    if (!window.confirm(`${label}\n\nTej operacji nie można cofnąć. Kontynuować?`)) {
      return;
    }

    setPermanentBusy(true);
    setError(null);
    try {
      const result = await adminApi.permanentlyDeleteArchived([...selectedIds]);
      if (result.deleted === 0) {
        setError("Nie usunięto żadnego artykułu (mogły już nie być w archiwum).");
      }
      await load(filter);
      setSelectedIds(new Set());
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Nie udało się trwale usunąć artykułów."
      );
    } finally {
      setPermanentBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        overline="Treści"
        title="Artykuły"
        description={
          isArchiveView
            ? "Odrzucone i zarchiwizowane pozycje. Trwałe usunięcie kasuje rekord z bazy."
            : "Szkice trafiają do kolejki. Na stronę trafia tylko to, co opublikujesz."
        }
        actions={
          !isArchiveView ? (
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-2 rounded-badge bg-accent-blue px-3.5 py-2 text-meta font-semibold text-white transition-colors hover:bg-accent-blue-hover"
            >
              <PlusCircle className="h-4 w-4" />
              Nowy artykuł
            </Link>
          ) : undefined
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => handleFilterChange(f.id)}
            className={cn(
              "rounded-badge border px-3 py-1.5 text-meta font-medium transition-colors",
              filter === f.id
                ? "border-transparent bg-white/10 text-text-primary"
                : "border-hairline text-text-tertiary hover:text-text-secondary"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filter === "scheduled" && dueScheduledCount > 0 ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[0.6rem] border border-hairline bg-white/[0.02] px-4 py-3">
          <p className="text-meta text-text-secondary">
            {dueScheduledCount}{" "}
            {dueScheduledCount === 1
              ? "artykuł ma minąły termin"
              : "artykułów ma minęty termin"}{" "}
            — przy otwartym CMS publikacja następuje automatycznie (co ~30 s).
            Możesz też użyć przycisku poniżej.
          </p>
          <Button
            variant="primary"
            disabled={publishingDue || loading}
            onClick={() => void handlePublishAllDue()}
          >
            {publishingDue ? "Publikowanie…" : "Opublikuj przeterminowane"}
          </Button>
        </div>
      ) : null}

      {isArchiveView && mayDelete && articles.length > 0 ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[0.6rem] border border-hairline bg-white/[0.02] px-4 py-3">
          <p className="text-meta text-text-secondary">
            {selectedCount > 0
              ? `Zaznaczono: ${selectedCount} z ${articles.length}`
              : `W archiwum: ${articles.length}`}
          </p>
          <Button
            variant="primary"
            disabled={permanentBusy || loading || selectedCount === 0}
            onClick={() => void handlePermanentDelete()}
            className="inline-flex items-center gap-2 !bg-accent-live hover:!bg-accent-live/90"
          >
            <Trash2 className="h-4 w-4" />
            {permanentBusy ? "Usuwanie…" : "Usuń zaznaczone na stałe"}
          </Button>
        </div>
      ) : null}

      {isArchiveView && !mayDelete ? (
        <div className="mb-5">
          <Banner tone="info">
            Tylko administrator może trwale usuwać artykuły z archiwum.
          </Banner>
        </div>
      ) : null}

      {error ? (
        <div className="mb-5">
          <Banner tone="error">{error}</Banner>
        </div>
      ) : null}

      {loading ? (
        <div className="card-surface px-6 py-12 text-center text-meta text-text-tertiary">
          Ładowanie…
        </div>
      ) : isArchiveView ? (
        <ArchiveArticlesTable
          articles={articles}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
        />
      ) : (
        <ArticlesTable
          articles={articles}
          busyId={busyId}
          onPublish={handlePublish}
          onReject={handleReject}
          onArchive={handleArchive}
          canDelete={mayDelete}
        />
      )}
    </div>
  );
}

