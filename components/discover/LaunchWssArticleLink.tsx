import Link from "next/link";
import { ChevronRight, Newspaper } from "lucide-react";
import { cn } from "@/lib/cn";
import type { LaunchWssArticleLink as LinkData } from "@/lib/ops/launch-article-bridge";

type Props = {
  article: LinkData;
  className?: string;
  compact?: boolean;
};

export default function LaunchWssArticleLink({
  article,
  className,
  compact = false,
}: Props) {
  return (
    <Link
      href={article.href}
      className={cn(
        "launch-wss-article-link group flex items-start gap-2.5 rounded-lg border border-accent-cyan/25 bg-accent-cyan/[0.06] p-2.5 transition-colors hover:border-accent-cyan/45 hover:bg-accent-cyan/10",
        compact && "p-2",
        className,
      )}
    >
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-hairline bg-space-card text-accent-cyan"
        aria-hidden
      >
        <Newspaper size={14} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[8px] font-bold uppercase tracking-[0.14em] text-accent-cyan/80">
          Czytaj zapowiedź
        </span>
        <span
          className={cn(
            "mt-0.5 block font-semibold leading-snug text-text-secondary transition-colors group-hover:text-accent-cyan",
            compact ? "line-clamp-1 text-[11px]" : "line-clamp-2 text-[11.5px]",
          )}
        >
          {article.title}
        </span>
      </span>
      <ChevronRight
        size={14}
        className="mt-1 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent-cyan"
        aria-hidden
      />
    </Link>
  );
}
