import { cn } from "@/lib/cn";
import { getCategoryInfo } from "@/lib/categories";
import type { NewsArticle } from "@/types";

type Props = {
  article: NewsArticle;
  /** Compact layout for sidebar rails */
  compact?: boolean;
  className?: string;
  /** Gdy kategoria jest już pokazana obok (karty homepage). */
  hideCategory?: boolean;
};

/** Category and editorial badges. */
export default function ArticleMetaChips({
  article,
  compact = false,
  className,
  hideCategory = false,
}: Props) {
  const meta = getCategoryInfo(article.category);

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {article.isTopPriority && (
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white",
            compact ? "text-[8px]" : "text-[9px]"
          )}
          style={{
            background: "linear-gradient(135deg, #ff453a 0%, #ff9500 100%)",
            boxShadow: "0 0 12px rgba(255,69,58,0.45)",
          }}
        >
          Główny temat
        </span>
      )}
      {article.isBreaking && !article.isTopPriority && (
        <span
          className={cn(
            "flex items-center gap-1 rounded-md bg-accent-live px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white",
            compact && "text-[8px]"
          )}
        >
          <span className="live-dot h-1.5 w-1.5" style={{ background: "#fff" }} />
          Ważne
        </span>
      )}
      {!hideCategory ? (
        <span
          className={cn(
            "rounded-md border border-hairline px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
            compact && "text-[8px]"
          )}
          style={{ color: meta.color, borderColor: `${meta.color}44` }}
        >
          {meta.label}
        </span>
      ) : null}
    </div>
  );
}

