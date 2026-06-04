import { Calendar, Clock, User } from "lucide-react";
import type { NewsArticle } from "@/types";
import ArticleHeroBreadcrumb from "@/components/article/ArticleHeroBreadcrumb";
import HeroMetaChip from "@/components/article/HeroMetaChip";
import ArticlePublicByline from "@/components/article/ArticlePublicByline";
import type { PublicArticleByline } from "@/lib/article/resolve-public-byline";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import { ARTICLE_HEADLINE_MAX, ARTICLE_PROSE_MAX } from "@/lib/ui/article-editorial-layout";
import { ARTICLE_HERO_MOBILE_META_CLASS } from "@/lib/ui/article-hero-frame";
import { cn } from "@/lib/cn";

type Props = {
  article: NewsArticle;
  showBreadcrumb?: boolean;
  /** Tylko ścieżka nawigacji (nad siatką tytuł + Informacje). */
  breadcrumbOnly?: boolean;
  /** Tekst pod czystą okładką (domyślnie tak na wszystkich breakpointach). */
  belowImage?: boolean;
  /** Podgląd CMS — gdy brak w article.publicByline */
  previewByline?: PublicArticleByline;
  className?: string;
};

/** Tytuł, meta i breadcrumb pod okładką — bez nakładki na zdjęciu. */
export default function ArticleHeroMobileMeta({
  article,
  showBreadcrumb = true,
  breadcrumbOnly = false,
  belowImage = true,
  previewByline,
  className,
}: Props) {
  const byline = article.publicByline ?? previewByline;
  const dateShort = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
  });
  const dateLong = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const breadcrumb = showBreadcrumb ? (
    <ArticleHeroBreadcrumb
      categorySlug={article.category}
      variant="compact"
      className={cn(!breadcrumbOnly && "mb-3")}
    />
  ) : null;

  if (breadcrumbOnly) {
    return breadcrumb ? (
      <div className={className}>{breadcrumb}</div>
    ) : null;
  }

  return (
    <div
      className={cn(
        belowImage
          ? "flex w-full min-w-0 flex-col gap-3"
          : ARTICLE_HERO_MOBILE_META_CLASS,
        className
      )}
    >
      {breadcrumb}

      <div className="flex w-fit max-w-full flex-wrap items-center gap-2">
        {article.isBreaking ? (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-accent-live px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
            <span className="live-dot" style={{ background: "#fff" }} />
            Ważne
          </span>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5">
          <HeroMetaChip icon={Calendar} compact variant="panel">
            <span className="lg:hidden">{dateShort}</span>
            <span className="hidden lg:inline">{dateLong}</span>
          </HeroMetaChip>
          <HeroMetaChip icon={Clock} compact variant="panel">
            {article.readTime ?? 3} min
          </HeroMetaChip>
          {!byline && article.authorByline ? (
            <span className="hidden sm:contents">
              <HeroMetaChip icon={User} compact variant="panel">
                {article.authorByline}
              </HeroMetaChip>
            </span>
          ) : null}
        </div>
      </div>

        <h1
          className={cn(
            ARTICLE_HEADLINE_MAX,
            "text-balance text-[1.35rem] font-extrabold leading-[1.15] tracking-[-0.025em] text-text-primary lg:text-[clamp(1.75rem,2.8vw,2.65rem)] lg:leading-[1.12]",
          )}
        >
          {article.title}
        </h1>

        {byline ? <ArticlePublicByline byline={byline} /> : null}

        {article.excerpt ? (
          <p
            className={cn(
              ARTICLE_PROSE_MAX,
              "pt-0.5 text-[14px] leading-relaxed text-text-secondary",
            )}
          >
            {article.excerpt}
          </p>
        ) : null}

        {article.imageCredit ? (
          <div className="pt-1">
            <CoverImageCredit
              credit={article.imageCredit}
              source={article.source}
              originalUrl={article.originalUrl}
              variant="compact"
            />
          </div>
        ) : null}
    </div>
  );
}
