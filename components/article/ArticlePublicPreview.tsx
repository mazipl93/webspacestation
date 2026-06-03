"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import type { NewsArticle } from "@/types";
import SourceAttribution from "@/components/article/SourceAttribution";
import WssContextBox from "@/components/article/WssContextBox";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import { getArticleBodyParagraphs } from "@/lib/articles/display-content";
import {
  previewCatFallback,
  previewCatMeta,
} from "@/lib/ui/article-preview-meta";
import { resolveImage } from "@/lib/articles/resolve-image";
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
  const heroImage = resolveImage(article);

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
      {/* Hero — mirrors app/aktualnosci/[slug] ArticleHero */}
      <section className={`relative flex ${heroMinH} items-end overflow-hidden`}>
        <div
          className="absolute inset-0 -z-40"
          style={{
            background:
              "linear-gradient(160deg, #04080f 0%, #060c18 35%, #050a16 60%, #04080d 100%)",
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-30"
          style={{ background: previewCatFallback(article.category) }}
        >
          {heroImage ? (
            <Image
              src={heroImage}
              alt={
                article.imageCredit ??
                (article.source
                  ? `Ilustracja — materiał ${article.source}`
                  : article.title)
              }
              fill
              priority
              sizes={viewport === "mobile" ? "390px" : "100vw"}
              className="object-cover"
              unoptimized={embedded}
            />
          ) : null}
          {article.imageCredit ? (
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[rgba(5,7,9,0.92)] to-transparent px-4 pb-3 pt-10 sm:px-6">
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
          className="pointer-events-none absolute inset-0 -z-20"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.97) 0%, rgba(5,7,9,0.82) 26%, rgba(5,7,9,0.46) 52%, rgba(5,7,9,0.16) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 -z-20 w-4/5"
          style={{
            background:
              "linear-gradient(to right, rgba(4,7,12,0.72) 0%, transparent 100%)",
          }}
        />

        <div
          className={`relative w-full ${embedded ? "px-4 pb-8 pt-14" : "container-site pb-12 pt-28"}`}
        >
          {!embedded ? (
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-1.5 text-[11px] text-text-tertiary"
            >
              <Link
                href="/"
                className="transition-colors duration-200 hover:text-text-primary"
              >
                WSS
              </Link>
              <ChevronRight size={11} className="opacity-40" />
              <Link
                href="/aktualnosci"
                className="transition-colors duration-200 hover:text-text-primary"
              >
                Aktualności
              </Link>
              <ChevronRight size={11} className="opacity-40" />
              <span style={{ color: meta.color }}>{meta.label}</span>
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

          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em]"
              style={{ color: meta.color }}
            >
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: meta.color }}
              />
              {meta.label}
            </span>

            <span
              aria-hidden="true"
              className="h-3 w-px"
              style={{ background: "var(--hairline-strong)" }}
            />

            <span className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
              <Calendar size={11} />
              {date}
            </span>

            {article.readTime ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-3 w-px"
                  style={{ background: "var(--hairline-strong)" }}
                />
                <span className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
                  <Clock size={11} />
                  {article.readTime} min czytania
                </span>
              </>
            ) : null}
          </div>

          {article.tags && article.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-hairline bg-white/5 px-2 py-0.5 text-[10px] text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Body — mirrors ArticleBody main column */}
      <div className={`${embedded ? "px-3 py-6" : "container-site py-10"}`}>
        <article className="card-surface p-5 sm:p-8 md:p-10">
          <div className="max-w-[72ch]">
            {!isRss && lead ? (
              <p
                className="mb-7 border-l-[3px] pl-5 font-medium text-text-primary"
                style={{
                  fontSize: "var(--text-body)",
                  lineHeight: 1.78,
                  borderColor: meta.color,
                }}
              >
                {lead}
              </p>
            ) : null}

            {rest.map((paragraph, i) => (
              <p
                key={i}
                className="mb-6 text-text-secondary"
                style={{ fontSize: "var(--text-body)", lineHeight: 1.8 }}
              >
                {paragraph}
              </p>
            ))}

            {!lead && !rest.length && !article.contextNote ? (
              <p className="text-body italic text-text-muted">
                Treść artykułu pojawi się tutaj…
              </p>
            ) : null}

            {isRss && article.contextNote ? (
              <WssContextBox text={article.contextNote} />
            ) : null}

            {!isRss && article.contextNote ? (
              <WssContextBox text={article.contextNote} />
            ) : null}

            {hasSourceAttribution(article.originalUrl) ? (
              <SourceAttribution article={article} />
            ) : null}
          </div>

          <div className="mt-10 flex items-center gap-4">
            <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
            <span className="overline text-text-muted">Web Space Station</span>
            <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
          </div>
        </article>
      </div>
    </div>
  );
}
