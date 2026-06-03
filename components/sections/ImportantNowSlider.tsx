import Link from "next/link";
import { categoryFallbackBg, getCategoryInfo } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";
import HomepageSectionHeader from "@/components/sections/HomepageSectionHeader";
import HorizontalScrollSlider from "@/components/ui/HorizontalScrollSlider";

const ACCENT = "#ff453a";

function ImportantSliderCard({
  article,
  index,
}: {
  article: NewsArticle;
  index: number;
}) {
  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex w-[min(78vw,300px)] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-hairline bg-space-card sm:w-[280px]"
    >
      <div
        className="img-sheen relative h-[170px] overflow-hidden sm:h-[185px]"
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt=""
          fill
          sizes="300px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-bold tabular-nums text-white backdrop-blur-sm"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {(article.isTopPriority || article.isBreaking) && (
          <span className="absolute right-3 top-3 rounded-md bg-accent-live px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
            {article.isTopPriority ? "Temat dnia" : "Ważne"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="mb-2">
          <ArticleMetaChips article={article} compact />
        </div>
        <h3 className="line-clamp-3 text-[16px] font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan sm:text-[15px] sm:line-clamp-2">
          {article.title}
        </h3>
        <span className="mt-auto pt-2 text-[12px] text-text-muted">
          {article.timeLabel}
        </span>
      </div>
    </Link>
  );
}

function ImportantRailRow({
  article,
  index,
}: {
  article: NewsArticle;
  index: number;
}) {
  const cat = getCategoryInfo(article.category);

  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group relative flex gap-3 overflow-hidden rounded-lg border border-hairline-faint bg-glass/40 py-3 pl-3 pr-3 transition-colors hover:border-[#ff453a44] hover:bg-[#ff453a08]"
      style={{ borderLeftWidth: 3, borderLeftColor: ACCENT }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold tabular-nums text-white"
        style={{ background: `${ACCENT}cc`, boxShadow: `0 0 12px ${ACCENT}55` }}
        aria-hidden
      >
        {index + 1}
      </span>
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-hairline-faint">
        <CoverImage
          src={article.image}
          alt=""
          fill
          sizes="56px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <span
          className="mb-0.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em]"
          style={{ color: cat.color }}
        >
          {cat.label}
        </span>
        <p className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-[#ff6b5a]">
          {article.title}
        </p>
        <span className="mt-1 block text-[11px] text-text-muted">{article.timeLabel}</span>
      </div>
    </Link>
  );
}

/** Ważne teraz — slider na mobile, kompaktowa lista w panelu bocznym na desktop. */
export default function ImportantNowSlider({
  articles,
  variant = "slider",
}: {
  articles: NewsArticle[];
  variant?: "slider" | "rail";
}) {
  if (articles.length === 0) return null;

  if (variant === "rail") {
    return (
      <section aria-label="Ważne teraz">
        <HomepageSectionHeader
          label="Ważne teraz"
          href="/aktualnosci"
          accent={ACCENT}
          prominent
          subtitle="Tematy, które warto śledzić"
        />
        <div className="flex flex-col gap-2.5">
          {articles.map((article, i) => (
            <ImportantRailRow key={article.id} article={article} index={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-2 lg:mt-0" aria-label="Ważne teraz">
      <HomepageSectionHeader
        label="Ważne teraz"
        href="/aktualnosci"
        accent={ACCENT}
        glow="0 0 10px rgba(255,69,58,0.55)"
      />
      <HorizontalScrollSlider
        ariaLabel="Ważne teraz — przewiń w poziomie"
        trackClassName="gap-3 sm:gap-4"
        stepRatio={0.92}
      >
        {articles.map((article, i) => (
          <ImportantSliderCard key={article.id} article={article} index={i} />
        ))}
      </HorizontalScrollSlider>
    </section>
  );
}
