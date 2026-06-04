"use client";

import type { AdminArticle } from "@/lib/admin/types";
import StatusBadge from "@/components/admin/StatusBadge";
import { cn } from "@/lib/cn";
import { getAdminDisplayTitle } from "@/lib/admin/rss-display";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ArchiveArticlesTable({
  articles,
  selectedIds,
  onToggle,
  onToggleAll,
}: {
  articles: AdminArticle[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
}) {
  const allSelected =
    articles.length > 0 && articles.every((a) => selectedIds.has(a.id));
  const someSelected = articles.some((a) => selectedIds.has(a.id));

  if (articles.length === 0) {
    return (
      <div className="card-surface px-6 py-12 text-center">
        <p className="text-body text-text-tertiary">Archiwum jest puste.</p>
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
            <th className="px-5 py-3 text-overline font-semibold">Tytuł</th>
            <th className="hidden px-5 py-3 text-overline font-semibold sm:table-cell">
              Kategoria
            </th>
            <th className="px-5 py-3 text-overline font-semibold">Status</th>
            <th className="hidden px-5 py-3 text-overline font-semibold md:table-cell">
              Zarchiwizowano
            </th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
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
                <span className="line-clamp-2 text-meta font-medium text-text-primary">
                  {getAdminDisplayTitle(a)}
                </span>
              </td>
              <td className="hidden px-5 py-3.5 text-meta text-text-secondary sm:table-cell">
                {a.category.name}
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={a.status} />
              </td>
              <td className="hidden px-5 py-3.5 text-meta tabular-nums text-text-tertiary md:table-cell">
                {formatDate(a.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
