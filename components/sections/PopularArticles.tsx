"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { fetchArticleLikeCounts } from "@/lib/likes/article-like-counts";
import { rankPopular } from "@/lib/home/rank-articles";
import { POPULAR_THEME } from "@/lib/home/homepage-section-themes";
import type { NewsArticle } from "@/types";
import ArticleCard from "@/components/article/ArticleCard";
import DepartmentSectionFrame from "@/components/sections/DepartmentSectionFrame";
import DepartmentSectionHeader from "@/components/sections/DepartmentSectionHeader";

interface Props {
  articles: NewsArticle[];
  /** Slugs already shown above the fold — exclude from ranking. */
  excludeSlugs?: string[];
}

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
      <DepartmentSectionFrame
        theme={POPULAR_THEME.theme}
        accent={POPULAR_THEME.accent}
        accentAlt={POPULAR_THEME.accentAlt}
      >
        <DepartmentSectionHeader config={POPULAR_THEME} />

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
      </DepartmentSectionFrame>
    </section>
  );
}
