"use client";

import Link from "next/link";
import {
  Pencil,
  Archive,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Clock,
} from "lucide-react";
import type { AdminArticle } from "@/lib/admin/types";
import {
  formatReadingTimeLabel,
  getAdminDisplaySummary,
  getAdminDisplayTitle,
  getAdminArticleTags,
  getRssSourceHostname,
} from "@/lib/admin/rss-display";
import {
  cmsArticleTypeLabel,
  hasCitationFields,
  hasSourceAttribution,
} from "@/lib/ui/article-kind";
import { CONTENT_KIND_LABELS } from "@/lib/articles/content-kind";
import StatusBadge from "@/components/admin/StatusBadge";
import { cn } from "@/lib/cn";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() > 24 * 60 * 60 * 1000;
}

export type ArticleSortKey = "title" | "createdAt" | "updatedAt" | "status";
export type ArticleSortDir = "asc" | "desc";

function canModerateStatus(status: AdminArticle["status"]): boolean {
  return status === "REVIEW" || status === "DRAFT" || status === "SCHEDULED";
}

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: ArticleSortKey;
  sortKey: ArticleSortKey;
  sortDir: ArticleSortDir;
}) {
  if (sortKey !== col) return <ChevronsUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
  return sortDir === "asc"
    ? <ChevronUp className="ml-1 inline h-3 w-3 text-accent-blue" />
    : <ChevronDown className="ml-1 inline h-3 w-3 text-accent-blue" />;
}

export default function ArticlesTable({
  articles,
  busyId,
  selectedIds,
  onToggle,
  onToggleAll,
  onPublish,
  onReject,
  onArchive,
  canDelete = false,
  sortKey = "createdAt",
  sortDir = "desc",
  onSort,
}: {
  articles: AdminArticle[];
  busyId: string | null;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onPublish: (article: AdminArticle) => void;
  onReject: (article: AdminArticle) => void;
  onArchive: (article: AdminArticle) => void;
  canDelete?: boolean;
  sortKey?: ArticleSortKey;
  sortDir?: ArticleSortDir;
  onSort?: (key: ArticleSortKey) => void;
}) {
  const allSelected =
    articles.length > 0 && articles.every((a) => selectedIds.has(a.id));
  const someSelected = articles.some((a) => selectedIds.has(a.id));

  if (articles.length === 0) {
    return (
      <div className="card-surface px-6 py-12 text-center">
        <p className="text-body text-text-tertiary">Brak artykułów do wyświetlenia.</p>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline text-text-tertiary">
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-hairline accent-accent-blue"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={(e) => onToggleAll(e.target.checked)}
                aria-label="Zaznacz wszystkie"
              />
            </th>
            <th className="px-5 py-3 text-overline font-semibold">
              {onSort ? (
                <button
                  type="button"
                  onClick={() => onSort("title")}
                  className="inline-flex items-center hover:text-text-primary"
                >
                  Tytuł / streszczenie
                  <SortIcon col="title" sortKey={sortKey} sortDir={sortDir} />
                </button>
              ) : (
                "Tytuł / streszczenie"
              )}
            </th>
            <th className="hidden px-5 py-3 text-overline font-semibold md:table-cell">
              Typ
            </th>
            <th className="hidden px-5 py-3 text-overline font-semibold lg:table-cell">
              Kategoria / tagi
            </th>
            <th className="hidden px-5 py-3 text-overline font-semibold sm:table-cell">
              Czas
            </th>
            <th className="px-5 py-3 text-overline font-semibold">
              {onSort ? (
                <button
                  type="button"
                  onClick={() => onSort("status")}
                  className="inline-flex items-center hover:text-text-primary"
                >
                  Status
                  <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
                </button>
              ) : (
                "Status"
              )}
            </th>
            <th className="hidden px-5 py-3 text-overline font-semibold md:table-cell">
              {onSort ? (
                <button
                  type="button"
                  onClick={() => onSort("createdAt")}
                  className="inline-flex items-center hover:text-text-primary"
                >
                  Utworzono
                  <SortIcon col="createdAt" sortKey={sortKey} sortDir={sortDir} />
                </button>
              ) : (
                "Utworzono"
              )}
            </th>
            <th className="px-5 py-3 text-right text-overline font-semibold">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => {
            const canModerate = canModerateStatus(a.status);
            const overdueReview = a.status === "REVIEW" && isOverdue(a.createdAt);
            const typeLabel = cmsArticleTypeLabel(a.source, a.originalUrl);
            const sourceLabel = a.source?.trim();
            const showAttribution = hasSourceAttribution(a.originalUrl);
            const summary = getAdminDisplaySummary(a);
            const tags = getAdminArticleTags(a);
            const readingLabel = formatReadingTimeLabel(a.readingTime);

            return (
              <tr
                key={a.id}
                className={cn(
                  "border-b border-hairline-faint last:border-b-0 transition-colors hover:bg-white/[0.02]",
                  selectedIds.has(a.id) && "bg-accent-blue/[0.04]"
                )}
              >
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-hairline accent-accent-blue"
                    checked={selectedIds.has(a.id)}
                    onChange={() => onToggle(a.id)}
                    aria-label={`Zaznacz ${getAdminDisplayTitle(a)}`}
                  />
                </td>
                <td className="max-w-md px-5 py-3.5">
                  <div className="flex items-start gap-1.5">
                    {overdueReview && (
                      <span title="Czeka na review ponad 24h" className="mt-0.5 shrink-0">
                        <Clock className="h-3.5 w-3.5 text-red-400" aria-hidden />
                      </span>
                    )}
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="line-clamp-2 text-meta font-medium text-text-primary transition-colors hover:text-accent-cyan"
                    >
                      {getAdminDisplayTitle(a)}
                    </Link>
                  </div>
                  {summary ? (
                    <p className="mt-1 line-clamp-2 text-caption leading-snug text-text-tertiary">
                      {summary}
                    </p>
                  ) : a.status === "REVIEW" ? (
                    <p className="mt-1 text-caption italic text-text-muted">
                      Brak streszczenia — uzupełnij w edytorze
                    </p>
                  ) : null}
                  {showAttribution && a.originalUrl ? (
                    <a
                      href={a.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-caption text-accent-cyan hover:underline md:hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                      {sourceLabel ?? getRssSourceHostname(a.originalUrl)}
                    </a>
                  ) : null}
                </td>
                <td className="hidden px-5 py-3.5 md:table-cell">
                  <p className="text-meta font-medium text-text-secondary">{typeLabel}</p>
                  <p className="mt-1 text-caption text-text-muted">
                    {CONTENT_KIND_LABELS[a.contentKind]}
                  </p>
                  {hasCitationFields(a.source, a.originalUrl) && a.originalUrl ? (
                    <a
                      href={a.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-caption text-accent-cyan hover:underline"
                      title={a.originalUrl}
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                      {sourceLabel ?? getRssSourceHostname(a.originalUrl)}
                    </a>
                  ) : null}
                </td>
                <td className="hidden px-5 py-3.5 lg:table-cell">
                  <span className="inline-flex items-center gap-1.5 text-meta text-text-secondary">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: a.category.colorTheme ?? "#6b7892",
                      }}
                    />
                    {a.category.name}
                  </span>
                  {tags.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-badge border border-hairline bg-white/5 px-1.5 py-0.5 text-[10px] text-text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </td>
                <td className="hidden px-5 py-3.5 text-meta tabular-nums text-text-tertiary sm:table-cell">
                  {readingLabel ?? "—"}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={a.status} />
                </td>
                <td className="hidden px-5 py-3.5 text-meta text-text-tertiary tabular-nums md:table-cell">
                  {formatDate(a.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    {canModerate ? (
                      <>
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => onPublish(a)}
                          className="grid h-8 w-8 place-items-center rounded-[0.5rem] text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:opacity-40"
                          aria-label="Opublikuj"
                          title="Opublikuj na stronie"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => onReject(a)}
                          className="grid h-8 w-8 place-items-center rounded-[0.5rem] text-text-tertiary transition-colors hover:bg-accent-live/10 hover:text-accent-live disabled:opacity-40"
                          aria-label="Odrzuć"
                          title="Odrzuć (archiwum)"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    ) : null}
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="grid h-8 w-8 place-items-center rounded-[0.5rem] text-text-tertiary transition-colors hover:bg-white/8 hover:text-text-primary"
                      aria-label="Edytuj"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {canDelete ? (
                      <button
                        type="button"
                        disabled={busyId === a.id || a.status === "ARCHIVED"}
                        onClick={() => onArchive(a)}
                        className="grid h-8 w-8 place-items-center rounded-[0.5rem] text-text-tertiary transition-colors hover:bg-accent-live/10 hover:text-accent-live disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Archiwizuj"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
