"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, MessageCircle, Sparkles, TrendingUp } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { NewsArticle } from "@/types";

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  misje: { label: "Misje", color: "#2f6dff" },
  astronomia: { label: "Astronomia", color: "#a855f7" },
  technologie: { label: "Technologie", color: "#38bdf8" },
  "ziemia-z-kosmosu": { label: "Ziemia z kosmosu", color: "#22c55e" },
  iss: { label: "ISS", color: "#ffb830" },
};

function catMeta(c: string) {
  return CATEGORY_META[c] ?? { label: c, color: "#2f6dff" };
}

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
}: {
  article: NewsArticle;
  rank?: number;
}) {
  const meta = catMeta(article.category);

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
        <span className="mt-1 block text-[11px] text-text-muted">{article.timeLabel}</span>
      </div>
    </Link>
  );
}

interface Props {
  articles: NewsArticle[];
  excludeSlugs?: string[];
}

export default function HomeSidebar({ articles, excludeSlugs = [] }: Props) {
  const [likeCounts, setLikeCounts] = useState<Map<string, number> | null>(null);
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
              <CompactArticleRow key={article.id} article={article} rank={i + 1} />
            ))}
          </div>
        )}
      </SidebarBlock>

      <SidebarBlock icon={MessageCircle} label="Najnowsze komentarze" accent="#a855f7">
        <p className="text-[13px] leading-relaxed text-text-tertiary">
          Komentarze pod artykułami pojawią się tutaj, gdy czytelnicy zaczną dyskusję.
        </p>
        <Link
          href="/aktualnosci"
          className="mt-3 inline-flex min-h-[44px] items-center text-[13px] font-medium text-accent-cyan transition-colors hover:text-accent-cyan/80"
        >
          Przejdź do artykułów →
        </Link>
      </SidebarBlock>

      <SidebarBlock icon={Flame} label="Trending" accent="#ff453a">
        <div>
          {trending.map((article) => (
            <CompactArticleRow key={article.id} article={article} />
          ))}
        </div>
      </SidebarBlock>

      <SidebarBlock icon={Sparkles} label="Ostatnio dodane" accent="#22c55e">
        <div>
          {recentlyAdded.map((article) => (
            <CompactArticleRow key={article.id} article={article} />
          ))}
        </div>
      </SidebarBlock>
    </aside>
  );
}
