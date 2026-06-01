import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { NewsArticle } from "@/types";
import BookmarkButton from "@/components/article/BookmarkButton";

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  misje:              { label: "Misje",            color: "#2f6dff" },
  astronomia:         { label: "Astronomia",        color: "#a855f7" },
  technologie:        { label: "Technologie",       color: "#38bdf8" },
  "ziemia-z-kosmosu": { label: "Ziemia z kosmosu", color: "#22c55e" },
  iss:                { label: "ISS",               color: "#ffb830" },
};

const CATEGORY_FALLBACK: Record<string, string> = {
  misje: `
    radial-gradient(ellipse at 50% 92%, rgba(255,130,30,0.72) 0%, rgba(225,70,0,0.34) 15%, transparent 40%),
    linear-gradient(180deg, #060c16 0%, #0a1320 52%, #07090c 100%)`,
  astronomia: `
    radial-gradient(ellipse at 56% 46%, rgba(168,20,240,0.46) 0%, rgba(90,10,205,0.22) 28%, transparent 56%),
    linear-gradient(135deg, #05070f 0%, #0b0514 100%)`,
  technologie: `
    radial-gradient(ellipse at 50% 94%, rgba(90,140,255,0.34) 0%, transparent 36%),
    linear-gradient(160deg, #050a13 0%, #070e1a 100%)`,
  "ziemia-z-kosmosu": `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)`,
  iss: `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)`,
};

function catMeta(c: string) {
  return CATEGORY_META[c] ?? { label: c, color: "#2f6dff" };
}
function catFallback(c: string) {
  return CATEGORY_FALLBACK[c] ?? CATEGORY_FALLBACK.technologie;
}

export default function ArticleCard({ article }: { article: NewsArticle }) {
  const meta = catMeta(article.category);

  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group relative flex flex-col overflow-hidden rounded-xl border border-hairline"
    >
      {/* Image */}
      <div
        className="img-sheen relative h-[176px] shrink-0 overflow-hidden"
        style={{ background: catFallback(article.category) }}
      >
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
        />

        {article.isBreaking && (
          <div className="absolute left-3 top-3 z-10">
            <span className="flex items-center gap-1.5 rounded-md bg-accent-live px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
              <span className="live-dot" style={{ background: "#fff" }} />
              Najważniejsze
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

      {/* Content */}
      <div className="-mt-px flex flex-1 flex-col border-t border-hairline bg-space-card px-4 pb-4 pt-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span
            className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: meta.color }}
          >
            <span className="h-1 w-1 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </span>
          <span className="text-[10px] text-text-muted">{article.timeLabel}</span>
        </div>

        <h3
          className="mb-2 line-clamp-2 font-bold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan"
          style={{ fontSize: "var(--text-title-sm)" }}
        >
          {article.title}
        </h3>

        <p className="mb-auto line-clamp-2 text-[12px] leading-relaxed text-text-tertiary">
          {article.excerpt}
        </p>

        <div className="mt-3 flex items-center gap-1 text-[10px] text-text-muted">
          <Clock size={10} />
          {article.readTime ?? 3} min czytania
        </div>
      </div>
    </Link>
  );
}
