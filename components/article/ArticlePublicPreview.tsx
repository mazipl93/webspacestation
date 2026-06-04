"use client";

import type { NewsArticle } from "@/types";
import ArticlePageHero from "@/components/article/ArticlePageHero";
import ArticlePageBodyMain from "@/components/article/ArticlePageBodyMain";
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

  return (
    <div
      className={cn(
        "bg-space-bg",
        isDesktop ? "w-[1024px] max-w-none" : "mx-auto w-full max-w-[390px]"
      )}
    >
      {isDesktop ? <ArticlePreviewNavStub /> : null}
      <ArticlePageHero
        article={article}
        showBreadcrumb={isDesktop}
        embedded
        animate={false}
        previewLayout={viewport}
      />
      <ArticlePageBodyMain article={article} preview layout="standalone" />
    </div>
  );
}
