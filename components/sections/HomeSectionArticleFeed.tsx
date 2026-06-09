import Link from "next/link";
import { getCategoryInfo, categoryFallbackBg } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import { cn } from "@/lib/cn";

const LEAD_IMAGE_HEIGHT = {
  default: "h-[188px] sm:h-[204px]",
  prominent: "h-[212px] sm:h-[228px]",
} as const;

/** Duży lead sekcji działu / Popularne — mobile & tablet (<lg). Tekst w flow (nie absolute). */
export function HomeSectionLeadCard({
  article,
  accent,
  categoryLabel,
  prominent = false,
}: {
  article: NewsArticle;
  accent: string;
  categoryLabel: string;
  prominent?: boolean;
}) {
  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex flex-col overflow-hidden rounded-xl border border-hairline bg-space-card"
    >
      <div
        className={cn(
          "img-sheen relative w-full shrink-0 overflow-hidden",
          prominent ? LEAD_IMAGE_HEIGHT.prominent : LEAD_IMAGE_HEIGHT.default,
        )}
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt={article.title}
          fill
          quality={74}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 560px"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.55) 0%, transparent 48%)",
          }}
        />
      </div>
      <div className="relative z-[1] border-t border-hairline-faint px-4 py-4 sm:px-5 sm:py-5">
        <span
          className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: accent }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: accent }}
          />
          {categoryLabel}
        </span>
        <p
          className={cn(
            "line-clamp-3 font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-cyan",
            prominent ? "text-[20px] sm:text-[21px]" : "text-[18px] sm:text-[19px]",
          )}
        >
          {article.title}
        </p>
        <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-text-tertiary sm:text-[15px]">
          {article.excerpt}
        </p>
      </div>
    </Link>
  );
}

/** Wiersz listy pod leadem — ten sam wzorzec co Najnowsze (rail). */
export function HomeSectionListRow({ article }: { article: NewsArticle }) {
  const cat = getCategoryInfo(article.category);

  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex gap-3.5 border-b border-hairline-faint py-3.5 last:border-0"
    >
      <div
        className="relative h-[76px] w-[104px] shrink-0 overflow-hidden rounded-lg border border-hairline-faint sm:h-[80px] sm:w-[108px]"
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt={article.title}
          fill
          quality={68}
          sizes="120px"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
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

/** Lead + pionowa lista — widoczne tylko <lg. */
export function HomeSectionMobileFeed({
  articles,
  accent,
  categoryLabel,
  prominent = false,
}: {
  articles: NewsArticle[];
  accent: string;
  categoryLabel: string;
  prominent?: boolean;
}) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;

  return (
    <div className="isolate mt-1 space-y-4 lg:hidden">
      {lead ? (
        <HomeSectionLeadCard
          article={lead}
          accent={accent}
          categoryLabel={categoryLabel}
          prominent={prominent}
        />
      ) : null}
      {rest.length > 0 ? (
        <div className="divide-y divide-hairline-faint border-t border-hairline-faint">
          {rest.map((article) => (
            <HomeSectionListRow key={article.id} article={article} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
