"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { fetchArticleLikeCounts } from "@/lib/likes/article-like-counts";
import { rankPopular } from "@/lib/home/rank-articles";
import type { NewsArticle } from "@/types";
import ArticleCard from "@/components/article/ArticleCard";

interface Props {
  articles: NewsArticle[];
  /** Slugs already shown above the fold — exclude from ranking. */
  excludeSlugs?: string[];
}

/**
 * Ranks articles by global like count (article_like_counts view, per-user model).
 * Falls back to legacy article_likes table, then score/readTime when unavailable.
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
      const map = await fetchArticleLikeCounts(supabase!);
      if (!active) return;
      setLikeCounts(map);
    })();

    return () => {
      active = false;
    };
  }, []);

  const popular = useMemo(() => {
    const pool = articles.filter((a) => !exclude.has(a.slug));
    const candidatePool = pool.length > 0 ? pool : articles;
    if (candidatePool.length === 0) return [];

    if (likeCounts === null) {
      return rankPopular(candidatePool, { limit: 6 });
    }

    return rankPopular(candidatePool, {
      limit: 6,
      engagementBySlug: likeCounts,
    });
  }, [articles, exclude, likeCounts]);

  if (popular.length === 0) return null;

  return (
    <section className="reveal">
      <div
        className="mb-5 flex items-center justify-between rounded-xl border border-hairline-faint px-4 py-3"
        style={{
          background:
            "linear-gradient(135deg, rgba(56,189,248,0.1) 0%, rgba(47,109,255,0.05) 50%, transparent 100%)",
          borderColor: "rgba(56,189,248,0.15)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="h-4 w-1 shrink-0 rounded-full bg-accent-cyan"
            style={{ boxShadow: "0 0 12px rgba(56,189,248,0.65)" }}
          />
          <h2 className="text-[14px] font-extrabold uppercase tracking-[0.14em] text-text-primary">
            Popularne
          </h2>
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
