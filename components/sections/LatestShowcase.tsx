import Link from "next/link";
import { Clock } from "lucide-react";
import { categoryFallbackBg, getCategoryInfo } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";
import HomepageSectionHeader from "@/components/sections/HomepageSectionHeader";
import HorizontalScrollSlider from "@/components/ui/HorizontalScrollSlider";

const ACCENT = "#22d3ee";

function LatestSliderCard({
  article,
  isLead,
}: {
  article: NewsArticle;
  isLead?: boolean;
}) {
  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group relative flex w-[min(88vw,420px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-hairline bg-space-card sm:w-[min(72vw,440px)]"
      style={
        isLead
          ? {
              boxShadow:
                "0 0 0 1px rgba(34,211,238,0.25), 0 16px 48px -16px rgba(34,211,238,0.2)",
            }
          : undefined
      }
    >
      <div
        className="img-sheen relative h-[240px] overflow-hidden sm:h-[280px]"
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt=""
          fill
          sizes="(max-width: 640px) 88vw, 420px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.95) 0%, rgba(5,7,9,0.35) 45%, transparent 100%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="mb-2">
            <ArticleMetaChips article={article} compact />
          </div>
          <h3 className="line-clamp-3 text-balance text-[1.2rem] font-extrabold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan">
            {article.title}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-5 pt-3">
        <p className="line-clamp-2 text-[14px] leading-relaxed text-text-secondary">
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-3 text-[12px] text-text-muted">
          <span>{article.timeLabel}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} />
            {article.readTime ?? 3} min
          </span>
        </div>
      </div>
    </Link>
  );
}

function LatestRailRow({
  article,
  rank,
}: {
  article: NewsArticle;
  rank: number;
}) {
  const cat = getCategoryInfo(article.category);

  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex gap-4 border-b border-hairline-faint py-4 last:border-0"
    >
      <div className="relative h-[88px] w-[120px] shrink-0 overflow-hidden rounded-xl border border-hairline-faint sm:h-[96px] sm:w-[128px]">
        <CoverImage
          src={article.image}
          alt=""
          fill
          sizes="128px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {rank === 1 ? (
          <span
            className="absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
            style={{ background: ACCENT, boxShadow: `0 0 10px ${ACCENT}88` }}
          >
            Nowe
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <span
          className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: cat.color }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} />
          {cat.label}
        </span>
        <h3 className="line-clamp-3 text-[15px] font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan sm:text-[16px]">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-text-tertiary">
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

/** Najnowsze — slider na mobile, pionowa lista w panelu bocznym na desktop. */
export default function LatestShowcase({
  articles,
  variant = "slider",
  mobileShell = false,
}: {
  articles: NewsArticle[];
  variant?: "slider" | "rail";
  /** Wyraźna ramka na mobile — odróżnienie od Tematu tygodnia. */
  mobileShell?: boolean;
}) {
  if (articles.length === 0) return null;

  if (variant === "rail") {
    return (
      <section aria-label="Najnowsze artykuły">
        <HomepageSectionHeader
          label="Najnowsze"
          href="/aktualnosci"
          accent={ACCENT}
          prominent
        />
        <div className="card-surface divide-y divide-hairline-faint px-4 sm:px-5">
          {articles.map((article, i) => (
            <LatestRailRow key={article.id} article={article} rank={i + 1} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className={
        mobileShell
          ? "mt-2 rounded-2xl border border-[#22d3ee44] bg-[#22d3ee0c] p-4 pt-5 lg:mt-0 lg:border-0 lg:bg-transparent lg:p-0"
          : "mt-2 lg:mt-0"
      }
      aria-label="Najnowsze artykuły"
    >
      <HomepageSectionHeader
        label="Najnowsze"
        href="/aktualnosci"
        accent={ACCENT}
        prominent={mobileShell}
      />
      <HorizontalScrollSlider
        ariaLabel="Najnowsze artykuły — przewiń w poziomie"
        trackClassName="gap-4"
        className={mobileShell ? "sm:px-11" : undefined}
      >
        {articles.map((article, i) => (
          <LatestSliderCard key={article.id} article={article} isLead={i === 0} />
        ))}
      </HorizontalScrollSlider>
    </section>
  );
}
