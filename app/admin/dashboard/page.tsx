"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  CheckCircle2,
  FileEdit,
  FolderTree,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import { adminApi, type AdminArticleStats } from "@/lib/admin/api";
import type { AdminArticle } from "@/lib/admin/types";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { Banner } from "@/components/admin/primitives";

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminArticleStats | null>(null);
  const [recent, setRecent] = useState<AdminArticle[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [articleStats, articles] = await Promise.all([
          adminApi.getArticleStats(),
          adminApi.listArticles({ status: "ALL" }),
        ]);
        if (!active) return;
        setStats(articleStats);
        setRecent(articles.slice(0, 5));
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Błąd ładowania.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Wszystkie artykuły", value: stats?.total, icon: Newspaper, tint: "text-text-primary" },
    { label: "Opublikowane", value: stats?.published, icon: CheckCircle2, tint: "text-emerald-300" },
    {
      label: "Do sprawdzenia",
      value: stats?.review,
      icon: ClipboardCheck,
      tint: "text-accent-amber",
      href: "/admin/articles",
    },
    { label: "Szkice", value: stats?.draft, icon: FileEdit, tint: "text-text-secondary" },
    { label: "Kategorie", value: stats?.categories, icon: FolderTree, tint: "text-accent-cyan" },
  ];

  return (
    <div>
      <PageHeader
        overline="Redakcja"
        title="Pulpit"
        description="Przegląd stanu treści w Web Space Station."
      />

      {error ? (
        <div className="mb-6">
          <Banner tone="error">{error}</Banner>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, tint, href }) => {
          const inner = (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="overline text-text-tertiary">{label}</span>
                <Icon className={`h-4 w-4 ${tint}`} />
              </div>
              <span className="tabular-nums text-headline font-semibold">
                {value ?? "—"}
              </span>
            </>
          );
          return href ? (
            <Link
              key={label}
              href={href}
              className="card-surface block p-4 transition-colors hover:bg-white/[0.03]"
            >
              {inner}
            </Link>
          ) : (
            <div key={label} className="card-surface p-4">
              {inner}
            </div>
          );
        })}
      </div>

      <section className="card-surface mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
          <h2 className="text-title-sm font-semibold">Ostatnie artykuły</h2>
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1 text-meta text-text-tertiary transition-colors hover:text-text-primary"
          >
            Zobacz wszystkie <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ul>
          {recent.length === 0 ? (
            <li className="px-5 py-6 text-meta text-text-tertiary">
              {stats ? "Brak artykułów." : "Ładowanie…"}
            </li>
          ) : (
            recent.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 border-b border-hairline-faint px-5 py-3 last:border-b-0"
              >
                <Link
                  href={`/admin/articles/${a.id}/edit`}
                  className="min-w-0 flex-1 truncate text-meta text-text-secondary transition-colors hover:text-text-primary"
                >
                  {a.title}
                </Link>
                <span className="hidden text-caption text-text-tertiary sm:block">
                  {a.category.name}
                </span>
                <StatusBadge status={a.status} />
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
