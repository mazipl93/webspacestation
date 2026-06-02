import { cn } from "@/lib/cn";
import { getCategoryInfo } from "@/lib/categories";
import type { NewsArticle } from "@/types";

type Props = {
  article: NewsArticle;
  /** Compact layout for sidebar rails */
  compact?: boolean;
  className?: string;
};

/** Category, source, and editorial badges (no Breaking on RSS aggregate). */
export default function ArticleMetaChips({
  article,
  compact = false,
  className,
}: Props) {
  const meta = getCategoryInfo(article.category);
  const isExternal = Boolean(article.originalUrl && article.source);

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
      {isExternal && (
        <span
          className={cn(
            "rounded-md border border-hairline bg-glass px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-text-secondary",
            compact && "text-[8px]"
          )}
        >
          Ze świata
        </span>
      )}
      <span
        className={cn(
          "rounded-md border border-hairline px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
          compact && "text-[8px]"
        )}
        style={{ color: meta.color, borderColor: `${meta.color}44` }}
      >
        {meta.label}
      </span>
      {article.source && (
        <span
          className={cn(
            "max-w-[120px] truncate rounded-md bg-glass px-2 py-0.5 text-[9px] font-medium text-text-tertiary",
            compact && "max-w-[96px] text-[8px]"
          )}
          title={article.source}
        >
          {article.source}
        </span>
      )}
    </div>
  );
}
