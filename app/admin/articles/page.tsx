"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { adminApi, ApiError } from "@/lib/admin/api";
import type { AdminArticle } from "@/lib/admin/types";
import PageHeader from "@/components/admin/PageHeader";
import ArticlesTable from "@/components/admin/ArticlesTable";
import { Banner } from "@/components/admin/primitives";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { canDeleteArticle } from "@/lib/auth/permissions";
import { cn } from "@/lib/cn";

const FILTERS = [
  { id: "draft", label: "Szkic", status: "DRAFT" },
  { id: "review", label: "Do sprawdzenia", status: "REVIEW" },
  { id: "published", label: "Opublikowane", status: "PUBLISHED" },
  { id: "scheduled", label: "Zaplanowane", status: "SCHEDULED" },
  { id: "all", label: "Wszystkie", status: "ALL" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function ArticlesListPage() {
  const { role } = useAdminAuth();
  const mayDelete = canDeleteArticle(role);

  const [filter, setFilter] = useState<FilterId>("review");
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (current: FilterId) => {
    setLoading(true);
    setError(null);
    try {
      const status = FILTERS.find((f) => f.id === current)?.status ?? "ALL";
      const data = await adminApi.listArticles({ status });
      setArticles(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Nie udało się załadować artykułów.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

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

  return (
    <div>
      <PageHeader
        overline="Treści"
        title="Artykuły"
        description="Szkice trafiają do kolejki. Na stronę trafia tylko to, co opublikujesz."
        actions={
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-badge bg-accent-blue px-3.5 py-2 text-meta font-semibold text-white transition-colors hover:bg-accent-blue-hover"
          >
            <PlusCircle className="h-4 w-4" />
            Nowy artykuł
          </Link>
        }
      />

      <div className="mb-5 flex items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
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

      {error ? (
        <div className="mb-5">
          <Banner tone="error">{error}</Banner>
        </div>
      ) : null}

      {loading ? (
        <div className="card-surface px-6 py-12 text-center text-meta text-text-tertiary">
          Ładowanie…
        </div>
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
