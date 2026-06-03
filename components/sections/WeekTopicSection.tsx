import Link from "next/link";
import { categoryFallbackBg } from "@/lib/categories";
import type { WeekTopicConfig } from "@/lib/home/week-topic";
import { weekTopicTheme } from "@/lib/home/homepage-section-themes";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";
import DepartmentSectionFrame from "@/components/sections/DepartmentSectionFrame";
import DepartmentSectionHeader from "@/components/sections/DepartmentSectionHeader";
import HorizontalScrollSlider from "@/components/ui/HorizontalScrollSlider";
import { cn } from "@/lib/cn";

function WeekTopicCard({
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
        "surface-interactive group flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-space-card",
        featured
          ? "w-[min(92vw,400px)] border-hairline-strong sm:w-[380px] lg:w-[400px]"
          : "w-[min(82vw,300px)] border-hairline sm:w-[280px] lg:w-[300px]",
      )}
      style={
        featured
          ? {
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.09), 0 20px 48px -22px rgba(0,0,0,0.72)",
            }
          : undefined
      }
    >
      <div
        className={cn(
          "img-sheen relative overflow-hidden",
          featured ? "h-[210px] sm:h-[228px]" : "h-[168px] sm:h-[178px]",
        )}
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt=""
          fill
          sizes={featured ? "400px" : "300px"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: featured
              ? "linear-gradient(to top, rgba(5,7,9,0.82) 0%, rgba(5,7,9,0.22) 55%, transparent 100%)"
              : "linear-gradient(to top, rgba(5,7,9,0.55) 0%, transparent 52%)",
          }}
        />
        {featured ? (
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <ArticleMetaChips article={article} compact />
            <h3 className="mt-2 line-clamp-3 text-[17px] font-extrabold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan sm:text-[18px]">
              {article.title}
            </h3>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 p-3">
            <ArticleMetaChips article={article} compact />
          </div>
        )}
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col",
          featured ? "px-4 pb-4 pt-3 sm:px-5" : "px-4 pb-4 pt-3.5",
        )}
      >
        {!featured ? (
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan sm:text-[14.5px]">
            {article.title}
          </h3>
        ) : null}
        {article.excerpt ? (
          <p
            className={cn(
              "line-clamp-2 text-[13px] leading-relaxed text-text-tertiary sm:text-[14px]",
              featured ? "mt-0" : "mt-2",
            )}
          >
            {article.excerpt}
          </p>
        ) : null}
        <span className="mt-auto pt-3 text-[12px] text-text-muted">
          {article.timeLabel}
        </span>
      </div>
    </Link>
  );
}

type Props = {
  articles: NewsArticle[];
  config: WeekTopicConfig;
};

export default function WeekTopicSection({ articles, config }: Props) {
  if (articles.length === 0) return null;

  const themeConfig = weekTopicTheme(config);
  const [lead, ...rest] = articles;

  return (
    <section aria-label={config.label} className="reveal">
      <DepartmentSectionFrame
        theme={themeConfig.theme}
        accent={themeConfig.accent}
        accentAlt={themeConfig.accentAlt}
      >
        <DepartmentSectionHeader config={themeConfig} />
        <HorizontalScrollSlider
          ariaLabel={`${config.label} — przewiń w poziomie`}
          trackClassName="gap-4"
          stepRatio={0.92}
          className="sm:px-11 lg:px-12"
        >
          <WeekTopicCard article={lead} featured />
          {rest.map((article) => (
            <WeekTopicCard key={article.id} article={article} />
          ))}
        </HorizontalScrollSlider>
      </DepartmentSectionFrame>
    </section>
  );
}
