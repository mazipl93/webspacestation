"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { NewsArticle } from "@/types";
import ArticleCard from "@/components/article/ArticleCard";

interface Props {
  articles: NewsArticle[];
  /** Slugs already shown above the fold — exclude from ranking. */
  excludeSlugs?: string[];
}

/**
 * Ranks articles by global Supabase like count. Falls back to featured-then-recent
 * order when Supabase is unconfigured or the fetch fails.
 */
export default function PopularArticles({ articles, excludeSlugs = [] }: Props) {
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

  const popular = useMemo(() => {
    const pool = articles.filter((a) => !exclude.has(a.slug));
    if (likeCounts === null) return pool.slice(0, 6);

    return [...pool]
      .sort((a, b) => {
        const diff = (likeCounts.get(b.slug) ?? 0) - (likeCounts.get(a.slug) ?? 0);
        if (diff !== 0) return diff;
        if (a.isBreaking !== b.isBreaking) return a.isBreaking ? -1 : 1;
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      })
      .slice(0, 6);
  }, [articles, exclude, likeCounts]);

  if (popular.length === 0) return null;

  return (
    <section className="reveal">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="h-3.5 w-[3px] shrink-0 rounded-full bg-accent-cyan"
            style={{ boxShadow: "0 0 10px rgba(56,189,248,0.45)" }}
          />
          <h2 className="overline text-text-secondary">Popularne</h2>
        </div>
      </div>

      {likeCounts === null ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[320px] animate-pulse rounded-xl border border-hairline bg-glass"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
