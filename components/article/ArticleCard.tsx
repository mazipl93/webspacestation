import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { categoryFallbackBg } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import BookmarkButton from "@/components/article/BookmarkButton";
import CoverImage from "@/components/article/CoverImage";
import ArticleMetaChips from "@/components/article/ArticleMetaChips";

export default function ArticleCard({
  article,
  compact = false,
  featured = false,
  className,
}: {
  article: NewsArticle;
  compact?: boolean;
  featured?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className={cn(
        "surface-interactive group relative flex flex-col overflow-hidden rounded-xl border border-hairline",
        article.isTopPriority &&
          "ring-1 ring-[rgba(255,69,58,0.45)] shadow-[0_8px_32px_-8px_rgba(255,69,58,0.35)]",
        featured && "sm:flex-row sm:items-stretch",
        className
      )}
    >
      <div
        className={cn(
          "img-sheen relative shrink-0 overflow-hidden",
          featured
            ? "h-[240px] sm:h-auto sm:min-h-[240px] sm:w-[44%] lg:min-h-[260px]"
            : compact
              ? "h-[168px] sm:h-[150px]"
              : "h-[220px] sm:h-[200px] lg:h-[190px]"
        )}
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt={article.title}
          fallbackSeed={article.slug}
          fallbackCategory={article.category}
          fill
          quality={featured ? 76 : compact ? 72 : 74}
          sizes={
            featured
              ? "(max-width: 640px) 100vw, (max-width: 1280px) 44vw, 600px"
              : compact
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
          }
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{ background: "linear-gradient(to top, #0c1018 6%, transparent 100%)" }}
        />

        <BookmarkButton slug={article.slug} />
      </div>

      <div
        className={cn(
          "-mt-px flex flex-1 flex-col border-t border-hairline bg-space-card px-4 pb-5 pt-4 sm:px-4 sm:pb-4 sm:pt-3.5",
          featured && "sm:mt-0 sm:border-l sm:border-t-0 sm:justify-center sm:py-6 sm:pl-6 sm:pr-5"
        )}
      >
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <ArticleMetaChips article={article} />
          <span className="shrink-0 text-[12px] text-text-muted sm:text-[11px]">
            {article.timeLabel}
          </span>
        </div>

        <h3
          className={cn(
            "mb-2.5 line-clamp-2 font-bold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan",
            featured
              ? "text-[21px] sm:text-[22px] sm:line-clamp-3 lg:text-[21px]"
              : compact
                ? "text-[18px] sm:text-[16px]"
                : "text-[20px] sm:text-[18px] lg:text-[17px]"
          )}
        >
          {article.title}
        </h3>

        <p
          className={cn(
            "mb-auto line-clamp-3 leading-relaxed text-text-tertiary sm:line-clamp-2",
            featured
              ? "text-[16px] sm:text-[15px] sm:line-clamp-3"
              : compact
                ? "text-[15px] sm:text-[14px]"
                : "text-[16px] sm:text-[14px] lg:text-[13px]"
          )}
        >
          {article.excerpt}
        </p>

        <div className="mt-3.5 flex items-center gap-1.5 text-[13px] text-text-muted sm:mt-3 sm:text-[11px]">
          <Clock size={12} className="sm:h-[10px] sm:w-[10px]" />
          {article.readTime ?? 3} min czytania
        </div>
      </div>
    </Link>
  );
}
