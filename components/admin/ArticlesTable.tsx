"use client";

import Link from "next/link";
import {
  Pencil,
  Archive,
  CheckCircle,
  XCircle,
  ExternalLink,
  Globe2,
} from "lucide-react";
import type { AdminArticle } from "@/lib/admin/types";
import {
  formatReadingTimeLabel,
  getAdminDisplaySummary,
  getAdminDisplayTitle,
  getAdminArticleTags,
  getRssSourceHostname,
  isAiEnrichedRssArticle,
  isRawRssDraftArticle,
  isRssAggregatorArticle,
} from "@/lib/admin/rss-display";
import StatusBadge from "@/components/admin/StatusBadge";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ArticlesTable({
  articles,
  busyId,
  onPublish,
  onReject,
  onArchive,
  canDelete = false,
}: {
  articles: AdminArticle[];
  busyId: string | null;
  onPublish: (article: AdminArticle) => void;
  onReject: (article: AdminArticle) => void;
  onArchive: (article: AdminArticle) => void;
  canDelete?: boolean;
}) {
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
            <th className="px-5 py-3 text-overline font-semibold">Tytuł / streszczenie</th>
            <th className="hidden px-5 py-3 text-overline font-semibold md:table-cell">
              Źródło zewnętrzne
            </th>
            <th className="hidden px-5 py-3 text-overline font-semibold lg:table-cell">
              Kategoria / tagi
            </th>
            <th className="hidden px-5 py-3 text-overline font-semibold sm:table-cell">
              Czas
            </th>
            <th className="px-5 py-3 text-overline font-semibold">Status</th>
            <th className="hidden px-5 py-3 text-overline font-semibold md:table-cell">
              Utworzono
            </th>
            <th className="px-5 py-3 text-right text-overline font-semibold">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => {
            const canModerate =
              a.status === "REVIEW" || a.status === "DRAFT";
            const rss = isRssAggregatorArticle(a);
            const raw = isRawRssDraftArticle(a);
            const enriched = isAiEnrichedRssArticle(a);
            const summary = getAdminDisplaySummary(a);
            const tags = getAdminArticleTags(a);
            const readingLabel = formatReadingTimeLabel(a.readingTime);

            return (
              <tr
                key={a.id}
                className="border-b border-hairline-faint last:border-b-0 transition-colors hover:bg-white/[0.02]"
              >
                <td className="max-w-md px-5 py-3.5">
                  <Link
                    href={`/admin/articles/${a.id}/edit`}
                    className="line-clamp-2 text-meta font-medium text-text-primary transition-colors hover:text-accent-cyan"
                  >
                    {getAdminDisplayTitle(a)}
                  </Link>
                  {summary ? (
                    <p className="mt-1 line-clamp-2 text-caption leading-snug text-text-tertiary">
                      {summary}
                    </p>
                  ) : rss && a.status === "REVIEW" ? (
                    <p className="mt-1 text-caption italic text-amber-200/80">
                      Brak streszczenia w bazie
                    </p>
                  ) : null}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {rss ? (
                      <span className="inline-flex items-center gap-0.5 rounded-badge border border-accent-cyan/25 bg-accent-cyan/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-cyan">
                        <Globe2 className="h-2.5 w-2.5" aria-hidden />
                        Ze świata
                      </span>
                    ) : null}
                    {raw ? (
                      <span className="rounded-badge border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200">
                        Surowy RSS
                      </span>
                    ) : null}
                    {enriched && a.status === "REVIEW" ? (
                      <span className="rounded-badge border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
                        AI OK
                      </span>
                    ) : null}
                  </div>
                  {rss && a.originalUrl ? (
                    <a
                      href={a.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-caption text-accent-cyan hover:underline md:hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                      {getRssSourceHostname(a.originalUrl)}
                    </a>
                  ) : null}
                </td>
                <td className="hidden px-5 py-3.5 md:table-cell">
                  {rss ? (
                    <div className="max-w-[14rem]">
                      <p className="text-meta font-medium text-text-secondary">
                        {a.source ?? "RSS"}
                      </p>
                      {a.originalUrl ? (
                        <a
                          href={a.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-caption text-accent-cyan hover:underline"
                          title={a.originalUrl}
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                          {getRssSourceHostname(a.originalUrl)}
                        </a>
                      ) : (
                        <p className="mt-1 text-caption text-amber-200/80">
                          Brak linku w bazie
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-meta text-text-muted">Redakcja WSS</span>
                  )}
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
