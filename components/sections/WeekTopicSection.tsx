import type { ReactNode } from "react";
import Link from "next/link";
import { categoryFallbackBg, getCategoryInfo } from "@/lib/categories";
import type { WeekTopicConfig } from "@/lib/home/week-topic";
import { weekTopicTheme } from "@/lib/home/homepage-section-themes";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";
import DepartmentSectionFrame from "@/components/sections/DepartmentSectionFrame";
import DepartmentSectionHeader from "@/components/sections/DepartmentSectionHeader";
import HorizontalScrollSlider from "@/components/ui/HorizontalScrollSlider";

function WeekTopicCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex w-[min(82vw,300px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-hairline bg-space-card sm:w-[280px] lg:w-[300px]"
    >
      <div
        className="img-sheen relative h-[168px] overflow-hidden sm:h-[178px]"
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt={article.title}
          fill
          sizes="300px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.55) 0%, transparent 52%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <ArticleMetaChips article={article} compact />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan sm:text-[14.5px]">
          {article.title}
        </h3>
        {article.excerpt ? (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-text-tertiary sm:text-[14px]">
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

function WeekTopicRailLead({ article }: { article: NewsArticle }) {
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
          fill
          sizes="340px"
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

function WeekTopicRailRow({ article }: { article: NewsArticle }) {
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
          sizes="108px"
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

function WeekTopicPanel({
  children,
  themeConfig,
}: {
  children: ReactNode;
  themeConfig: ReturnType<typeof weekTopicTheme>;
}) {
  return (
    <DepartmentSectionFrame
      theme={themeConfig.theme}
      accent={themeConfig.accent}
      accentAlt={themeConfig.accentAlt}
    >
      {children}
    </DepartmentSectionFrame>
  );
}

type Props = {
  articles: NewsArticle[];
  config: WeekTopicConfig;
  variant?: "slider" | "rail";
};

export default function WeekTopicSection({
  articles,
  config,
  variant = "slider",
}: Props) {
  if (articles.length === 0) return null;

  const themeConfig = weekTopicTheme(config);
  const [lead, ...rest] = articles;
  const header = <DepartmentSectionHeader config={themeConfig} />;

  if (variant === "rail") {
    return (
      <section aria-label={config.label} className="reveal">
        <WeekTopicPanel themeConfig={themeConfig}>
          {header}
          <WeekTopicRailLead article={lead} />
          <div className="divide-y divide-hairline-faint border-t border-hairline-faint pt-1">
            {rest.map((article) => (
              <WeekTopicRailRow key={article.id} article={article} />
            ))}
          </div>
        </WeekTopicPanel>
      </section>
    );
  }

  return (
    <section aria-label={config.label} className="reveal">
      <WeekTopicPanel themeConfig={themeConfig}>
        {header}
        <HorizontalScrollSlider
          ariaLabel={`${config.label} — przewiń w poziomie`}
          trackClassName="gap-4"
          stepRatio={0.92}
          className="sm:px-11 lg:px-12"
        >
          {articles.map((article) => (
            <WeekTopicCard key={article.id} article={article} />
          ))}
        </HorizontalScrollSlider>
      </WeekTopicPanel>
    </section>
  );
}
