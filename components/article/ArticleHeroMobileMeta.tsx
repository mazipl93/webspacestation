import { Calendar, Clock, User } from "lucide-react";
import type { NewsArticle } from "@/types";
import ArticleHeroBreadcrumb from "@/components/article/ArticleHeroBreadcrumb";
import HeroMetaChip from "@/components/article/HeroMetaChip";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import { ARTICLE_HERO_MOBILE_META_CLASS } from "@/lib/ui/article-hero-frame";

type Props = {
  article: NewsArticle;
  categoryLabel: string;
  categoryColor: string;
  showBreadcrumb?: boolean;
  /** Podgląd CMS — wymuś układ pod okładką (niezależnie od breakpointu lg). */
  forceBelowImage?: boolean;
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

/** Mobile + tablet (<lg): cały tekst pod czystą okładką (bez overlay na zdjęciu). */
export default function ArticleHeroMobileMeta({
  article,
  categoryLabel,
  categoryColor,
  showBreadcrumb = true,
  forceBelowImage = false,
}: Props) {
  const dateShort = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
  });

  return (
    <div
      className={
        forceBelowImage
          ? "block border-b border-hairline bg-[#05070d] px-4 pb-5 pt-4"
          : ARTICLE_HERO_MOBILE_META_CLASS
      }
    >
      {showBreadcrumb ? (
        <div
          className="mb-4 rounded-xl border border-hairline-faint px-3 py-2.5 sm:px-3.5"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <ArticleHeroBreadcrumb
            categorySlug={article.category}
            variant="panel"
          />
        </div>
      ) : null}

      <div className="flex max-w-[72ch] flex-col gap-2">
        {article.isBreaking ? (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-accent-live px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
            <span className="live-dot" style={{ background: "#fff" }} />
            Ważne
          </span>
        ) : null}

        <CategoryBadge label={categoryLabel} color={categoryColor} />

        <h1
          className="text-balance text-[1.35rem] font-extrabold leading-[1.15] tracking-[-0.025em] text-text-primary"
        >
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-1.5">
          <HeroMetaChip icon={Calendar} compact variant="panel">
            {dateShort}
          </HeroMetaChip>
          <HeroMetaChip icon={Clock} compact variant="panel">
            {article.readTime ?? 3} min
          </HeroMetaChip>
          {article.authorByline ? (
            <HeroMetaChip icon={User} compact variant="panel">
              {article.authorByline}
            </HeroMetaChip>
          ) : null}
        </div>

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
    </div>
  );
}
