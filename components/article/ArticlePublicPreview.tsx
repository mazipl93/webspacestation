"use client";

import type { NewsArticle } from "@/types";
import ArticlePageHero from "@/components/article/ArticlePageHero";
import ArticleHeroMobileMeta from "@/components/article/ArticleHeroMobileMeta";
import ArticlePageBodyMain from "@/components/article/ArticlePageBodyMain";
import { previewCatMeta } from "@/lib/ui/article-preview-meta";
import ArticlePreviewNavStub from "@/components/article/ArticlePreviewNavStub";
import { cn } from "@/lib/cn";

export type ArticlePreviewViewport = "desktop" | "mobile";

export type ArticlePublicPreviewProps = {
  article: NewsArticle;
  subtitle?: string | null;
  viewport?: ArticlePreviewViewport;
  embedded?: boolean;
};

/**
 * Live preview — te same komponenty co /aktualnosci/[slug].
 * Mobile / Desktop wymuszane przez previewLayout (nie szerokość okna IDE).
 */
export default function ArticlePublicPreview({
  article,
  viewport = "desktop",
  embedded = true,
}: ArticlePublicPreviewProps) {
  const isDesktop = viewport === "desktop";
  const cat = previewCatMeta(article.category);

  if (embedded) {
    return (
      <div
        className={cn(
          "bg-space-bg",
          isDesktop ? "w-full min-w-0" : "mx-auto w-full max-w-[390px]"
        )}
      >
        {isDesktop ? <ArticlePreviewNavStub compact /> : null}
        <ArticlePageHero article={article} embedded previewLayout={viewport} />
        <div className="border-b border-hairline bg-[#05070d] px-4 py-3 sm:px-5">
          <ArticleHeroMobileMeta
            article={article}
            categoryLabel={cat.label}
            categoryColor={cat.color}
            showBreadcrumb={isDesktop}
          />
        </div>
        <ArticlePageBodyMain
          article={article}
          preview
          layout="standalone"
          className="w-full max-w-none px-4 py-4 sm:px-5 [&_article]:px-0 [&_article]:py-0 sm:[&_article]:px-0"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-space-bg",
        isDesktop ? "w-[1024px] max-w-none" : "mx-auto w-full max-w-[390px]"
      )}
    >
      {isDesktop ? <ArticlePreviewNavStub /> : null}
      <ArticlePageHero article={article} embedded previewLayout={viewport} />
      <div className="border-b border-hairline bg-[#05070d]">
        <div className="container-site px-7 py-4 sm:px-10 sm:py-5">
          <ArticleHeroMobileMeta
            article={article}
            categoryLabel={cat.label}
            categoryColor={cat.color}
            showBreadcrumb={isDesktop}
          />
        </div>
      </div>
      <ArticlePageBodyMain article={article} preview layout="standalone" />
    </div>
  );
}
