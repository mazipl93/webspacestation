import Link from "next/link";
import { categoryFallbackBg } from "@/lib/categories";
import type { WeekTopicConfig } from "@/lib/home/week-topic";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";
import HomepageSectionHeader from "@/components/sections/HomepageSectionHeader";
import HorizontalScrollSlider from "@/components/ui/HorizontalScrollSlider";

function WeekTopicCard({
  article,
  index,
}: {
  article: NewsArticle;
  index: number;
}) {
  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex w-[min(78vw,280px)] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-hairline bg-space-card sm:w-[260px] lg:w-[272px]"
      style={{ borderColor: "rgba(168,85,247,0.22)" }}
    >
      <div
        className="img-sheen relative h-[150px] overflow-hidden sm:h-[158px]"
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt=""
          fill
          sizes="280px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span
          className="absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums text-white"
          style={{ background: "rgba(168,85,247,0.85)" }}
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <ArticleMetaChips article={article} compact />
        <h3 className="mt-2 line-clamp-2 text-[14px] font-bold leading-snug text-text-primary transition-colors group-hover:text-[#c084fc] sm:text-[13.5px]">
          {article.title}
        </h3>
        <span className="mt-auto pt-2 text-[11px] text-text-muted">
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

/** Kompaktowy slider pod hero — to samo miejsce co dawne „Ważne teraz”. */
export default function WeekTopicSection({ articles, config }: Props) {
  if (articles.length === 0) return null;

  return (
    <section
      aria-label={config.label}
      className="rounded-xl border px-3 py-4 sm:px-4 sm:py-4"
      style={{
        borderColor: `${config.accent}33`,
        background: `linear-gradient(180deg, ${config.accent}10 0%, transparent 100%)`,
      }}
    >
      <HomepageSectionHeader
        label={config.label}
        href="/aktualnosci"
        accent={config.accent}
        glow={`0 0 10px ${config.accent}55`}
        subtitle={config.subtitle?.trim() || undefined}
      />
      <HorizontalScrollSlider
        ariaLabel={`${config.label} — przewiń w poziomie`}
        trackClassName="gap-3 sm:gap-3.5"
        stepRatio={0.92}
        className="sm:px-11 lg:px-12"
      >
        {articles.map((article, i) => (
          <WeekTopicCard key={article.id} article={article} index={i} />
        ))}
      </HorizontalScrollSlider>
    </section>
  );
}
