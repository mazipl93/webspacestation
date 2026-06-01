"use client";

import Link from "next/link";
import { Pencil, Archive } from "lucide-react";
import type { AdminArticle } from "@/lib/admin/types";
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
  onArchive,
  canDelete = false,
}: {
  articles: AdminArticle[];
  busyId: string | null;
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
            <th className="px-5 py-3 text-overline font-semibold">Tytuł</th>
            <th className="hidden px-5 py-3 text-overline font-semibold md:table-cell">Kategoria</th>
            <th className="px-5 py-3 text-overline font-semibold">Status</th>
            <th className="hidden px-5 py-3 text-overline font-semibold sm:table-cell">Utworzono</th>
            <th className="px-5 py-3 text-right text-overline font-semibold">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr
              key={a.id}
              className="border-b border-hairline-faint last:border-b-0 transition-colors hover:bg-white/[0.02]"
            >
              <td className="px-5 py-3.5">
                <Link
                  href={`/admin/articles/${a.id}/edit`}
                  className="line-clamp-1 text-meta font-medium text-text-primary transition-colors hover:text-accent-cyan"
                >
                  {a.title}
                </Link>
                {a.featured ? (
                  <span className="mt-1 inline-block text-caption text-accent-amber">
                    ★ Wyróżniony
                  </span>
                ) : null}
              </td>
              <td className="hidden px-5 py-3.5 md:table-cell">
                <span className="inline-flex items-center gap-1.5 text-meta text-text-secondary">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: a.category.colorTheme ?? "#6b7892" }}
                  />
                  {a.category.name}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={a.status} />
              </td>
              <td className="hidden px-5 py-3.5 text-meta text-text-tertiary tabular-nums sm:table-cell">
                {formatDate(a.createdAt)}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
