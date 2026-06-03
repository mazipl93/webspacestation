import Link from "next/link";
import { categoryFallbackBg, getCategoryInfo } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import { cn } from "@/lib/cn";

/** Kompaktowa karta towarzysząca leadowi w bloku hero. */
export default function HeroSecondaryStory({
  article,
  className,
}: {
  article: NewsArticle;
  className?: string;
}) {
  const meta = getCategoryInfo(article.category);

  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className={cn(
        "surface-interactive group flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-hairline bg-space-card",
        className
      )}
    >
      <div
        className="img-sheen relative h-[120px] shrink-0 overflow-hidden sm:h-[130px] lg:min-h-[140px] lg:flex-1"
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {(article.isTopPriority || article.isBreaking) && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-accent-live px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
            {article.isTopPriority ? "Temat dnia" : "Ważne"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <span
          className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em]"
          style={{ color: meta.color }}
        >
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: meta.color }}
          />
          {meta.label}
        </span>
        <h3 className="line-clamp-3 text-[15px] font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan sm:line-clamp-2 sm:text-[14px]">
          {article.title}
        </h3>
        <span className="mt-auto pt-2 text-[11px] text-text-muted">
          {article.timeLabel}
        </span>
      </div>
    </Link>
  );
}
