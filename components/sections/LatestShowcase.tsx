import type { ReactNode } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { categoryFallbackBg, getCategoryInfo } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";
import DepartmentSectionFrame from "@/components/sections/DepartmentSectionFrame";
import DepartmentSectionHeader from "@/components/sections/DepartmentSectionHeader";
import HorizontalScrollSlider from "@/components/ui/HorizontalScrollSlider";
import { cn } from "@/lib/cn";
import { LATEST_THEME } from "@/lib/home/homepage-section-themes";

function LatestSliderCard({
  article,
  featured = false,
}: {
  article: NewsArticle;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className={cn(
        "surface-interactive group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-space-card",
        featured
          ? "w-[min(92vw,440px)] border-hairline-strong sm:w-[min(78vw,460px)]"
          : "w-[min(88vw,400px)] border-hairline sm:w-[min(72vw,420px)]",
      )}
      style={
        featured
          ? {
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 44px -22px rgba(0,0,0,0.7)",
            }
          : undefined
      }
    >
      <div
        className={cn(
          "img-sheen relative overflow-hidden",
          featured ? "h-[248px] sm:h-[280px]" : "h-[220px] sm:h-[252px]",
        )}
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt={article.title}
          fallbackSeed={article.slug}
          fallbackCategory={article.category}
          fill
          loading="lazy"
          quality={80}
          sizes={
            featured
              ? "(max-width: 640px) 92vw, (max-width: 1024px) 78vw, 520px"
              : "(max-width: 640px) 88vw, (max-width: 1024px) 72vw, 480px"
          }
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.94) 0%, rgba(5,7,9,0.35) 50%, transparent 100%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <div className="mb-2">
            <ArticleMetaChips article={article} compact />
          </div>
          <h3
            className={cn(
              "line-clamp-3 text-balance font-extrabold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan",
              featured
                ? "text-[1.25rem] sm:text-[1.35rem]"
                : "text-[1.15rem] sm:text-[1.2rem]",
            )}
          >
            {article.title}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-5 pt-3 sm:px-5">
        <p className="line-clamp-2 text-[14px] leading-relaxed text-text-secondary">
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-3 text-[12px] text-text-muted">
          <span>{article.timeLabel}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} aria-hidden />
            {article.readTime ?? 3} min
          </span>
        </div>
      </div>
    </Link>
  );
}

function LatestRailLead({ article }: { article: NewsArticle }) {
  const cat = getCategoryInfo(article.category);

  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group mb-4 block overflow-hidden rounded-xl border border-hairline-faint"
    >
      <div
        className="img-sheen relative h-[148px] overflow-hidden sm:h-[156px]"
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt={article.title}
          fallbackSeed={article.slug}
          fallbackCategory={article.category}
          fill
          loading="lazy"
          quality={80}
          sizes="(max-width: 1024px) 88vw, 480px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.92) 0%, rgba(5,7,9,0.25) 55%, transparent 100%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <span
            className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: cat.color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: cat.color }}
            />
            {cat.label}
          </span>
          <h3 className="line-clamp-2 text-[16px] font-extrabold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan">
            {article.title}
          </h3>
        </div>
      </div>
      <div className="border-t border-hairline-faint px-3.5 py-3">
        <p className="line-clamp-2 text-[13px] leading-relaxed text-text-tertiary">
          {article.excerpt}
        </p>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-text-muted">
          <span>{article.timeLabel}</span>
          <span aria-hidden>·</span>
          <span>{article.readTime ?? 3} min</span>
        </div>
      </div>
    </Link>
  );
}

/** Kompaktowa karta w rzędzie 5-up pod hero (desktop v2). */
function LatestStripCard({ article }: { article: NewsArticle }) {
  const cat = getCategoryInfo(article.category);

  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex min-w-0 flex-col overflow-hidden rounded-xl border border-hairline bg-space-card"
    >
      <div
        className="img-sheen relative aspect-[16/10] w-full overflow-hidden"
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt={article.title}
          fill
          loading="lazy"
          quality={80}
          sizes="(max-width: 1320px) 22vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.75) 0%, transparent 55%)",
          }}
        />
      </div>
      <div className="flex flex-1 flex-col px-3 py-3 sm:px-3.5 sm:py-3.5">
        <span
          className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: cat.color }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: cat.color }}
          />
          {cat.label}
        </span>
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan sm:text-[14.5px]">
          {article.title}
        </h3>
        <div className="mt-auto flex items-center gap-2 pt-2 text-[11px] text-text-muted">
          <span>{article.timeLabel}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} aria-hidden />
            {article.readTime ?? 3} min
          </span>
        </div>
      </div>
    </Link>
  );
}

function LatestRailRow({ article }: { article: NewsArticle }) {
  const cat = getCategoryInfo(article.category);

  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex gap-3.5 border-b border-hairline-faint py-3.5 last:border-0"
    >
      <div className="relative h-[76px] w-[104px] shrink-0 overflow-hidden rounded-lg border border-hairline-faint sm:h-[80px] sm:w-[108px]">
        <CoverImage
          src={article.image}
          alt={article.title}
          fill
          loading="lazy"
          quality={76}
          sizes="120px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <span
          className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: cat.color }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: cat.color }}
          />
          {cat.label}
        </span>
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan sm:text-[15px]">
          {article.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-text-muted">
          <span>{article.timeLabel}</span>
          <span aria-hidden>·</span>
          <span>{article.readTime ?? 3} min</span>
        </div>
      </div>
    </Link>
  );
}

function LatestPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <DepartmentSectionFrame
      theme={LATEST_THEME.theme}
      accent={LATEST_THEME.accent}
      accentAlt={LATEST_THEME.accentAlt}
      className={className}
    >
      {children}
    </DepartmentSectionFrame>
  );
}

/** Najnowsze — pionowa lista (mobile), slider opcjonalny, rail na desktop. */
export default function LatestShowcase({
  articles,
  variant = "slider",
  mobileShell = false,
  peekBelowHero = false,
}: {
  articles: NewsArticle[];
  variant?: "slider" | "rail" | "list" | "strip";
  mobileShell?: boolean;
  /** Tighter top spacing when stacked under mobile hero (peek next section). */
  peekBelowHero?: boolean;
}) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;

  const header = <DepartmentSectionHeader config={LATEST_THEME} />;

  if (variant === "list") {
    return (
      <section
        className={cn(
          "reveal",
          mobileShell
            ? peekBelowHero
              ? "mt-0 lg:mt-0"
              : "mt-10 lg:mt-0"
            : "mt-2 lg:mt-0",
        )}
        aria-label="Najnowsze artykuły"
      >
        <LatestPanel>
          {header}
          <div className="divide-y divide-hairline-faint border-t border-hairline-faint">
            {articles.map((article) => (
              <LatestRailRow key={article.id} article={article} />
            ))}
          </div>
        </LatestPanel>
      </section>
    );
  }

  if (variant === "strip") {
    return (
      <section aria-label="Najnowsze artykuły" className="reveal">
        <LatestPanel>
          {header}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {articles.map((article) => (
              <LatestStripCard key={article.id} article={article} />
            ))}
          </div>
        </LatestPanel>
      </section>
    );
  }

  if (variant === "rail") {
    return (
      <section aria-label="Najnowsze artykuły" className="reveal">
        <LatestPanel>
          {header}
          <LatestRailLead article={lead} />
          <div className="divide-y divide-hairline-faint border-t border-hairline-faint pt-1">
            {rest.map((article) => (
              <LatestRailRow key={article.id} article={article} />
            ))}
          </div>
        </LatestPanel>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "reveal",
        mobileShell
          ? peekBelowHero
            ? "mt-0 lg:mt-0"
            : "mt-10 lg:mt-0"
          : "mt-2 lg:mt-0",
      )}
      aria-label="Najnowsze artykuły"
    >
      <LatestPanel>
        {header}
        <HorizontalScrollSlider
          ariaLabel="Najnowsze artykuły — przewiń w poziomie"
          trackClassName="gap-4"
          className="-mx-1 sm:px-10"
        >
          <LatestSliderCard article={lead} featured />
          {rest.map((article) => (
            <LatestSliderCard key={article.id} article={article} />
          ))}
        </HorizontalScrollSlider>
      </LatestPanel>
    </section>
  );
}
