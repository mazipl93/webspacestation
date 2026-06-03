import Link from "next/link";
import { Sparkles } from "lucide-react";
import { categoryFallbackBg } from "@/lib/categories";
import type { WeekTopicConfig } from "@/lib/home/week-topic";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";
import HomepageSectionHeader from "@/components/sections/HomepageSectionHeader";
import HorizontalScrollSlider from "@/components/ui/HorizontalScrollSlider";
import { cn } from "@/lib/cn";

function WeekTopicCard({
  article,
  isLead = false,
}: {
  article: NewsArticle;
  isLead?: boolean;
}) {
  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className={cn(
        "surface-interactive group flex shrink-0 snap-start flex-col overflow-hidden rounded-xl border bg-space-card",
        isLead
          ? "w-[min(88vw,400px)] border-[#a855f766] sm:w-[min(72vw,420px)] lg:w-auto lg:min-w-0"
          : "w-[min(78vw,300px)] border-hairline sm:w-[260px] lg:w-auto lg:min-w-0"
      )}
      style={
        isLead
          ? {
              boxShadow:
                "0 0 0 1px rgba(168,85,247,0.35), 0 12px 40px -16px rgba(168,85,247,0.35)",
            }
          : undefined
      }
    >
      <div
        className={cn(
          "img-sheen relative overflow-hidden",
          isLead ? "h-[200px] sm:h-[220px] lg:h-[240px]" : "h-[150px] sm:h-[160px]"
        )}
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt=""
          fill
          sizes={isLead ? "(max-width: 1024px) 88vw, 400px" : "280px"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#050709]/95 via-[#050709]/40 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <ArticleMetaChips article={article} compact />
          <h3
            className={cn(
              "mt-2 line-clamp-3 font-bold leading-snug text-text-primary transition-colors group-hover:text-[#c084fc]",
              isLead ? "text-[17px] sm:text-[18px]" : "text-[15px] sm:text-[14px]"
            )}
          >
            {article.title}
          </h3>
        </div>
      </div>
      <p className="line-clamp-2 px-3.5 pb-3.5 pt-2 text-[13px] leading-relaxed text-text-secondary">
        {article.excerpt}
      </p>
    </Link>
  );
}

type Props = {
  articles: NewsArticle[];
  config: WeekTopicConfig;
  fromTag: boolean;
};

export default function WeekTopicSection({ articles, config, fromTag }: Props) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;
  const tagHint = `Tag w CMS: „${config.tag}”`;

  return (
    <section
      aria-label={config.label}
      className="overflow-hidden rounded-2xl border-2 px-4 py-5 sm:px-6 sm:py-6"
      style={{
        borderColor: `${config.accent}55`,
        background: `linear-gradient(145deg, ${config.accent}22 0%, ${config.accent}08 42%, rgba(5,7,9,0.92) 100%)`,
        boxShadow: `0 0 48px -20px ${config.accent}66`,
      }}
    >
      <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c084fc]">
        <Sparkles size={14} aria-hidden />
        Seria redakcyjna
      </div>

      <HomepageSectionHeader
        label={config.label}
        href="/aktualnosci"
        accent={config.accent}
        glow={`0 0 14px ${config.accent}aa`}
        prominent
        subtitle={config.subtitle}
      />

      {!fromTag ? (
        <p className="-mt-2 mb-4 rounded-lg border border-dashed border-[#a855f744] bg-[#a855f710] px-3 py-2 text-[11px] leading-snug text-text-tertiary">
          Tymczasowo: automatyczny wybór. Oznacz artykuły tagiem{" "}
          <span className="font-semibold text-[#c084fc]">{config.tag}</span>, aby
          ustawić wątek ręcznie.
        </p>
      ) : (
        <p className="-mt-2 mb-4 text-[11px] text-text-muted">{tagHint}</p>
      )}

      {/* Desktop: lead + siatka; mobile: slider ze strzałkami */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.35fr)_repeat(2,minmax(0,1fr))] lg:gap-4">
        <WeekTopicCard article={lead} isLead />
        {rest.slice(0, 2).map((article) => (
          <WeekTopicCard key={article.id} article={article} />
        ))}
      </div>

      {rest.length > 2 ? (
        <div className="mt-4 hidden lg:block">
          <HorizontalScrollSlider
            ariaLabel={`${config.label} — więcej artykułów`}
            trackClassName="gap-4"
            className="lg:px-12"
          >
            {rest.slice(2).map((article) => (
              <WeekTopicCard key={article.id} article={article} />
            ))}
          </HorizontalScrollSlider>
        </div>
      ) : null}

      <div className="lg:hidden">
        <HorizontalScrollSlider
          ariaLabel={`${config.label} — przewiń`}
          trackClassName="gap-3.5 pb-1"
          className="px-0"
          stepRatio={0.88}
        >
          {articles.map((article, i) => (
            <WeekTopicCard key={article.id} article={article} isLead={i === 0} />
          ))}
        </HorizontalScrollSlider>
      </div>
    </section>
  );
}
