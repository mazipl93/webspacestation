"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, TrendingUp } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cn } from "@/lib/cn";
import { getCategoryInfo } from "@/lib/categories";
import { createClient } from "@/lib/supabase/client";
import type { NewsArticle } from "@/types";

function SidebarBlock({
  icon: Icon,
  label,
  accent = "#38bdf8",
  children,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon size={14} />
        </span>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
          {label}
        </h2>
      </div>
      {children}
    </section>
  );
}

function CompactArticleRow({
  article,
  rank,
  likes,
}: {
  article: NewsArticle;
  rank?: number;
  likes?: number;
}) {
  const meta = getCategoryInfo(article.category);

  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex gap-3 border-b border-hairline-faint py-3 last:border-0"
    >
      {rank != null && (
        <span
          className="mt-1 shrink-0 tabular-nums text-[13px] font-bold text-text-muted"
          aria-hidden="true"
        >
          {String(rank).padStart(2, "0")}
        </span>
      )}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-hairline-faint">
        <Image
          src={article.imageUrl}
          alt=""
          fill
          sizes="56px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <span
          className="mb-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em]"
          style={{ color: meta.color }}
        >
          <span className="h-1 w-1 rounded-full" style={{ background: meta.color }} />
          {meta.label}
        </span>
        <p className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan">
          {article.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
          <span>{article.timeLabel}</span>
          {likes != null && likes > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>{likes} {likes === 1 ? "polubienie" : likes < 5 ? "polubienia" : "polubień"}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

type FeedTab = "trending" | "recent";

interface Props {
  articles: NewsArticle[];
  excludeSlugs?: string[];
}

export default function HomeSidebar({ articles, excludeSlugs = [] }: Props) {
  const [likeCounts, setLikeCounts] = useState<Map<string, number> | null>(null);
  const [feedTab, setFeedTab] = useState<FeedTab>("trending");
  const exclude = useMemo(() => new Set(excludeSlugs), [excludeSlugs]);

  useEffect(() => {
    let active = true;
    let supabase: SupabaseClient | null = null;
    try {
      supabase = createClient();
    } catch {
      setLikeCounts(new Map());
      return;
    }

    (async () => {
      const { data, error } = await supabase!
        .from("article_likes")
        .select("slug, count");
      if (!active) return;
      if (error || !data) {
        setLikeCounts(new Map());
        return;
      }
      const map = new Map<string, number>();
      for (const row of data) {
        map.set(row.slug as string, (row.count as number) ?? 0);
      }
      setLikeCounts(map);
    })();

    return () => {
      active = false;
    };
  }, []);

  const pool = useMemo(
    () => articles.filter((a) => !exclude.has(a.slug)),
    [articles, exclude]
  );

  const popular = useMemo(() => {
    if (likeCounts === null) return pool.slice(0, 5);
    return [...pool]
      .sort((a, b) => {
        const diff = (likeCounts.get(b.slug) ?? 0) - (likeCounts.get(a.slug) ?? 0);
        if (diff !== 0) return diff;
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      })
      .slice(0, 5);
  }, [pool, likeCounts]);

  const trending = useMemo(
    () =>
      [...pool]
        .sort((a, b) => {
          if (a.isBreaking !== b.isBreaking) return a.isBreaking ? -1 : 1;
          return (
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
        })
        .slice(0, 5),
    [pool]
  );

  const recentlyAdded = useMemo(
    () =>
      [...pool]
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
        .slice(0, 5),
    [pool]
  );

  const feedItems = feedTab === "trending" ? trending : recentlyAdded;

  return (
    <aside className="sticky top-20 hidden flex-col gap-4 lg:flex">
      <SidebarBlock icon={TrendingUp} label="Popularne" accent="#38bdf8">
        {likeCounts === null ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-glass" />
            ))}
          </div>
        ) : popular.length === 0 ? (
          <p className="text-[13px] text-text-muted">Brak artykułów.</p>
        ) : (
          <div>
            {popular.map((article, i) => (
              <CompactArticleRow
                key={article.id}
                article={article}
                rank={i + 1}
                likes={likeCounts.get(article.slug)}
              />
            ))}
          </div>
        )}
      </SidebarBlock>

      <SidebarBlock icon={Flame} label="Redakcyjny feed" accent="#ff453a">
        <div
          className="mb-3 flex gap-1 rounded-lg border border-hairline-faint p-1"
          role="tablist"
          aria-label="Filtr feedu"
        >
          {(
            [
              { id: "trending" as const, label: "Na czasie" },
              { id: "recent" as const, label: "Najnowsze" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={feedTab === id}
              onClick={() => setFeedTab(id)}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors duration-200",
                feedTab === id
                  ? "bg-accent-blue text-white"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div role="tabpanel">
          {feedItems.map((article) => (
            <CompactArticleRow key={article.id} article={article} />
          ))}
        </div>
      </SidebarBlock>
    </aside>
  );
}
