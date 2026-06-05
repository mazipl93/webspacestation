"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { fetchArticleLikeCounts } from "@/lib/likes/article-like-counts";
import { LIKES_CHANGE_EVENT } from "@/lib/likes/events";
import { rankPopular } from "@/lib/home/rank-articles";
import { POPULAR_THEME } from "@/lib/home/homepage-section-themes";
import type { NewsArticle } from "@/types";
import { getCategoryInfo } from "@/lib/categories";
import ArticleCard from "@/components/article/ArticleCard";
import DepartmentSectionFrame from "@/components/sections/DepartmentSectionFrame";
import DepartmentSectionHeader from "@/components/sections/DepartmentSectionHeader";
import { HomeSectionMobileFeed } from "@/components/sections/HomeSectionArticleFeed";
import {
  HOMEPAGE_POPULAR_LIMIT,
  homepageFourCardGrid,
} from "@/lib/site-layout";

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

    const load = async () => {
      const map = await fetchArticleLikeCounts(supabase!);
      if (!active) return;
      setLikeCounts(map);
    };

    void load();
    const onLikesChange = () => void load();
    window.addEventListener(LIKES_CHANGE_EVENT, onLikesChange);

    return () => {
      active = false;
      window.removeEventListener(LIKES_CHANGE_EVENT, onLikesChange);
    };
  }, []);

  const popular = useMemo(() => {
    const pool = articles.filter((a) => !exclude.has(a.slug));
    const candidatePool = pool.length > 0 ? pool : articles;
    if (candidatePool.length === 0) return [];

    if (likeCounts === null) {
      return rankPopular(candidatePool, { limit: HOMEPAGE_POPULAR_LIMIT });
    }

    return rankPopular(candidatePool, {
      limit: HOMEPAGE_POPULAR_LIMIT,
      engagementBySlug: likeCounts,
    });
  }, [articles, exclude, likeCounts]);

  if (popular.length === 0) return null;

  const fourCardGrid = homepageFourCardGrid();

  return (
    <section className="reveal">
      <DepartmentSectionFrame
        theme={POPULAR_THEME.theme}
        accent={POPULAR_THEME.accent}
        accentAlt={POPULAR_THEME.accentAlt}
      >
        <DepartmentSectionHeader config={POPULAR_THEME} />

        {likeCounts === null ? (
          <>
            <div className="space-y-4 lg:hidden">
              <div className="h-[260px] animate-pulse rounded-xl border border-hairline bg-glass" />
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[88px] animate-pulse rounded-lg border border-hairline bg-glass"
                />
              ))}
            </div>
            <div className={fourCardGrid}>
              {Array.from({ length: HOMEPAGE_POPULAR_LIMIT }, (_, i) => (
                <div
                  key={i}
                  className="h-[320px] animate-pulse rounded-xl border border-hairline bg-glass"
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <HomeSectionMobileFeed
              articles={popular}
              accent={POPULAR_THEME.accent}
              categoryLabel={
                popular[0]
                  ? getCategoryInfo(popular[0].category).label
                  : POPULAR_THEME.label
              }
            />
            <div className={fourCardGrid}>
              {popular.map((article) => (
                <ArticleCard key={article.id} article={article} compact />
              ))}
            </div>
          </>
        )}
      </DepartmentSectionFrame>
    </section>
  );
}
