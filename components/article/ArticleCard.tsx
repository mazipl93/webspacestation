import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { categoryFallbackBg, getCategoryInfo } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import BookmarkButton from "@/components/article/BookmarkButton";
import CoverImage from "@/components/article/CoverImage";

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
  const meta = getCategoryInfo(article.category);

  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className={cn(
        "surface-interactive group relative flex flex-col overflow-hidden rounded-xl border border-hairline",
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
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes={
            featured
              ? "(max-width: 640px) 100vw, 44vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          }
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
        />

        {article.isBreaking && (
          <div className="absolute left-3 top-3 z-10">
            <span className="flex items-center gap-1.5 rounded-md bg-accent-live px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white sm:text-[9px]">
              <span className="live-dot" style={{ background: "#fff" }} />
              Ważne
            </span>
          </div>
        )}

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
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] sm:text-[10px]"
            style={{ color: meta.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </span>
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
