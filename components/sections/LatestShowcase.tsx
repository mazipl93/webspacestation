import Link from "next/link";
import { Clock } from "lucide-react";
import { categoryFallbackBg } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";
import HomepageSectionHeader from "@/components/sections/HomepageSectionHeader";
import HorizontalScrollSlider from "@/components/ui/HorizontalScrollSlider";

/** Sekcja 2 — duże karty Najnowsze, przewijane w poziomie. */
export default function LatestShowcase({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-6 lg:mt-8" aria-label="Najnowsze artykuły">
      <HomepageSectionHeader label="Najnowsze" href="/aktualnosci" accent="#22d3ee" />

      <HorizontalScrollSlider
        ariaLabel="Najnowsze artykuły — przewiń w poziomie"
        trackClassName="gap-4 sm:gap-5"
      >
        {articles.map((article, i) => {
          const isLead = i === 0;

          return (
            <Link
              key={article.id}
              href={`/aktualnosci/${article.slug}`}
              className="surface-interactive group relative flex w-[min(88vw,420px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-hairline bg-space-card sm:w-[min(72vw,440px)] lg:w-[400px] xl:w-[420px]"
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
                className="img-sheen relative h-[240px] overflow-hidden sm:h-[280px] lg:h-[300px]"
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
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div className="mb-2">
                    <ArticleMetaChips article={article} compact />
                  </div>
                  <h3 className="line-clamp-3 text-balance text-[1.25rem] font-extrabold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan sm:text-[1.35rem]">
                    {article.title}
                  </h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col px-4 pb-5 pt-3 sm:px-5 sm:pb-6">
                <p className="line-clamp-2 text-[15px] leading-relaxed text-text-secondary sm:text-[14px]">
                  {article.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-3 pt-3 text-[13px] text-text-muted">
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
        })}
      </HorizontalScrollSlider>
    </section>
  );
}
