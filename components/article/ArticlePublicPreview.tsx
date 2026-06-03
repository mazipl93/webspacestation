"use client";

import { Calendar, ChevronRight, Clock, User } from "lucide-react";
import type { NewsArticle } from "@/types";
import SourceAttribution from "@/components/article/SourceAttribution";
import WssContextBox from "@/components/article/WssContextBox";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import HeroMetaChip from "@/components/article/HeroMetaChip";
import HeroBreadcrumbChip from "@/components/article/HeroBreadcrumbChip";
import { getCategoryInfo } from "@/lib/categories";
import { getArticleBodyParagraphs } from "@/lib/articles/display-content";
import { resolveHeroDisplayUrl } from "@/lib/articles/resolve-image";
import {
  previewCatFallback,
  previewCatMeta,
} from "@/lib/ui/article-preview-meta";
import { hasSourceAttribution, isRssArticle } from "@/lib/ui/article-kind";

export type ArticlePreviewViewport = "desktop" | "mobile";

export type ArticlePublicPreviewProps = {
  article: NewsArticle;
  /** Optional form subtitle — shown under title in hero. */
  subtitle?: string | null;
  viewport?: ArticlePreviewViewport;
  /** Embedded in CMS split pane — compact chrome, no portal nav. */
  embedded?: boolean;
};

export default function ArticlePublicPreview({
  article,
  subtitle,
  viewport = "desktop",
  embedded = false,
}: ArticlePublicPreviewProps) {
  const heroImage = resolveHeroDisplayUrl(article);

  const meta = previewCatMeta(article.category);
  const bodyParagraphs = getArticleBodyParagraphs(article);
  const isRss = isRssArticle(article.contentOrigin);
  const lead = isRss ? null : bodyParagraphs[0] ?? null;
  const rest = isRss ? bodyParagraphs : bodyParagraphs.slice(lead ? 1 : 0);

  const date = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const heroMinH = embedded
    ? viewport === "mobile"
      ? "min-h-[42vh]"
      : "min-h-[52vh]"
    : viewport === "mobile"
      ? "min-h-[55vh]"
      : "min-h-[68vh]";

  const frameClass =
    viewport === "mobile"
      ? "mx-auto w-full max-w-[390px] border-x border-hairline shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
      : "w-full";

  return (
    <div className={frameClass}>
      <section className={`relative flex ${heroMinH} items-end overflow-hidden`}>
        <div
          className="absolute inset-0 z-0"
          style={{
            background: heroImage
              ? previewCatFallback(article.category)
              : "linear-gradient(160deg, #04080f 0%, #060c18 35%, #050a16 60%, #04080d 100%)",
          }}
        >
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={heroImage}
              src={heroImage}
              alt={
                article.imageCredit ??
                (article.source
                  ? `Ilustracja — materiał ${article.source}`
                  : article.title)
              }
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          {article.imageCredit ? (
            <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-[rgba(5,7,9,0.92)] to-transparent px-4 pb-3 pt-10 sm:px-6">
              <CoverImageCredit
                credit={article.imageCredit}
                source={article.source}
                originalUrl={article.originalUrl}
              />
            </div>
          ) : null}
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.97) 0%, rgba(5,7,9,0.82) 26%, rgba(5,7,9,0.46) 52%, rgba(5,7,9,0.16) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-4/5"
          style={{
            background:
              "linear-gradient(to right, rgba(4,7,12,0.72) 0%, transparent 100%)",
          }}
        />

        <div
          className={`relative z-10 w-full ${embedded ? "px-4 pb-8 pt-14" : "container-site pb-12 pt-28"}`}
        >
          {!embedded ? (
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex flex-wrap items-center gap-2"
            >
              <HeroBreadcrumbChip href="/">WSS</HeroBreadcrumbChip>
              <ChevronRight size={12} className="shrink-0 text-white/35" aria-hidden />
              <HeroBreadcrumbChip href="/aktualnosci">Aktualności</HeroBreadcrumbChip>
              <ChevronRight size={12} className="shrink-0 text-white/35" aria-hidden />
              <HeroBreadcrumbChip href={getCategoryInfo(article.category).href} accent={meta.color}>
                {meta.label}
              </HeroBreadcrumbChip>
            </nav>
          ) : (
            <p
              className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: meta.color }}
            >
              {meta.label}
            </p>
          )}

          <h1
            className="mb-3 max-w-[820px] break-words text-balance font-extrabold text-text-primary"
            style={{
              fontSize:
                viewport === "mobile"
                  ? "clamp(1.25rem, 4vw, 1.75rem)"
                  : "clamp(1.375rem, 3.5vw, 2.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              textShadow: "0 2px 40px rgba(0,0,0,0.6)",
            }}
          >
            {article.title}
          </h1>

          {subtitle ? (
            <p
              className="mb-4 max-w-[620px] text-[15px] font-medium leading-snug text-text-primary/90"
              style={{ textShadow: "0 1px 16px rgba(0,0,0,0.5)" }}
            >
              {subtitle}
            </p>
          ) : null}

          {article.excerpt ? (
            <p
              className="mb-6 max-w-[620px] leading-relaxed text-text-secondary"
              style={{
                fontSize: "var(--text-title-sm)",
                lineHeight: 1.55,
                textShadow: "0 1px 20px rgba(0,0,0,0.5)",
              }}
            >
              {article.excerpt}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-[0_2px_12px_rgba(0,0,0,0.45)] backdrop-blur-md"
              style={{
                color: meta.color,
                borderColor: `${meta.color}55`,
                background: "rgba(0,0,0,0.55)",
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: meta.color }}
              />
              {meta.label}
            </span>
            <HeroMetaChip icon={Calendar}>{date}</HeroMetaChip>
            {article.readTime ? (
              <HeroMetaChip icon={Clock}>{article.readTime} min czytania</HeroMetaChip>
            ) : null}
            {article.authorByline ? (
              <HeroMetaChip icon={User}>{article.authorByline}</HeroMetaChip>
            ) : null}
          </div>
        </div>
      </section>

      <div
        className={
          embedded
            ? "px-4 py-6"
            : "container-site py-10 md:py-12"
        }
      >
        {lead ? (
          <p className="mb-6 text-[17px] font-medium leading-relaxed text-text-primary md:text-[18px]">
            {lead}
          </p>
        ) : null}

        {rest.map((paragraph, i) => (
          <p
            key={i}
            className="mb-5 text-[15px] leading-[1.75] text-text-secondary md:text-[16px]"
          >
            {paragraph}
          </p>
        ))}

        {article.contextNote ? (
          <div className="my-8">
            <WssContextBox text={article.contextNote} />
          </div>
        ) : null}

        {hasSourceAttribution(article.originalUrl) ? (
          <div className="mt-10 border-t border-hairline pt-6">
            <SourceAttribution article={article} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
