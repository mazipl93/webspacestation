import { Calendar, Clock, User } from "lucide-react";
import type { NewsArticle } from "@/types";
import ArticleHeroBreadcrumb from "@/components/article/ArticleHeroBreadcrumb";
import HeroMetaChip from "@/components/article/HeroMetaChip";
import ArticlePublicByline from "@/components/article/ArticlePublicByline";
import type { PublicArticleByline } from "@/lib/article/resolve-public-byline";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import { ARTICLE_HERO_MOBILE_META_CLASS } from "@/lib/ui/article-hero-frame";
import { cn } from "@/lib/cn";

type Props = {
  article: NewsArticle;
  categoryLabel: string;
  categoryColor: string;
  showBreadcrumb?: boolean;
  /** Tylko ścieżka nawigacji (nad siatką tytuł + Informacje). */
  breadcrumbOnly?: boolean;
  /** Tekst pod czystą okładką (domyślnie tak na wszystkich breakpointach). */
  belowImage?: boolean;
  /** Podgląd CMS — gdy brak w article.publicByline */
  previewByline?: PublicArticleByline;
  className?: string;
};

function CategoryBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{
        color,
        borderColor: `${color}44`,
        background: `${color}12`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/** Tytuł, meta i breadcrumb pod okładką — bez nakładki na zdjęciu. */
export default function ArticleHeroMobileMeta({
  article,
  categoryLabel,
  categoryColor,
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
    <div
      className={cn(
        "rounded-xl border border-hairline-faint px-3 py-2.5 sm:px-3.5",
        !breadcrumbOnly && "mb-4",
      )}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      }}
    >
      <ArticleHeroBreadcrumb categorySlug={article.category} variant="panel" />
    </div>
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
          ? "flex max-w-[72ch] flex-col gap-2"
          : ARTICLE_HERO_MOBILE_META_CLASS,
        className
      )}
    >
      {breadcrumb}

      {article.isBreaking ? (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-accent-live px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
            <span className="live-dot" style={{ background: "#fff" }} />
            Ważne
          </span>
        ) : null}

        <CategoryBadge label={categoryLabel} color={categoryColor} />

        <h1 className="max-w-[820px] text-balance text-[1.35rem] font-extrabold leading-[1.15] tracking-[-0.025em] text-text-primary lg:text-[clamp(1.75rem,3vw,2.5rem)] lg:leading-[1.12]">
          {article.title}
        </h1>

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

        {byline ? <ArticlePublicByline byline={byline} /> : null}

        {article.excerpt ? (
          <p className="pt-0.5 text-[14px] leading-relaxed text-text-secondary">
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
