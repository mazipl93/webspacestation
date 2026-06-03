import Link from "next/link";
import { categoryFallbackBg } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";
import HomepageSectionHeader from "@/components/sections/HomepageSectionHeader";

/** Sekcja 3 — Ważne teraz, slider poziomy (score + featured + recency). */
export default function ImportantNowSlider({
  articles,
}: {
  articles: NewsArticle[];
}) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-8 lg:mt-10" aria-label="Ważne teraz">
      <HomepageSectionHeader
        label="Ważne teraz"
        href="/aktualnosci"
        accent="#ff453a"
        glow="0 0 10px rgba(255,69,58,0.55)"
      />

      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-none sm:gap-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {articles.map((article, i) => (
          <Link
            key={article.id}
            href={`/aktualnosci/${article.slug}`}
            className="surface-interactive group flex w-[min(78vw,300px)] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-hairline bg-space-card sm:w-[280px] lg:w-[300px]"
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
                {String(i + 1).padStart(2, "0")}
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
        ))}
      </div>
    </section>
  );
}
