import { ExternalLink } from "lucide-react";

type Props = {
  credit: string;
  source?: string;
  originalUrl?: string;
  /** compact = cards; hero = flush under article cover */
  variant?: "default" | "compact" | "overlay" | "hero";
};

export default function CoverImageCredit({
  credit,
  source,
  originalUrl,
  variant = "default",
}: Props) {
  const compact = variant === "compact";
  const overlay = variant === "overlay";
  const hero = variant === "hero";

  return (
    <figcaption
      className={
        hero
          ? "mt-2 text-left text-[11px] leading-relaxed text-text-muted"
          : overlay
            ? "text-[10px] leading-snug text-white/50"
            : compact
              ? "mt-1.5 text-[10px] leading-snug text-text-muted"
              : "text-[11px] leading-relaxed text-text-tertiary"
      }
    >
      <span className={compact ? "line-clamp-2" : undefined}>{credit}</span>
      {!hero && originalUrl && source ? (
        <a
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            compact
              ? "mt-0.5 inline-flex items-center gap-0.5 text-accent-cyan hover:underline"
              : hero
                ? "mt-1 inline-flex items-center gap-1 text-[11px] text-text-tertiary transition-colors hover:text-accent-cyan hover:underline"
                : "mt-1.5 inline-flex min-h-[36px] items-center gap-1 text-accent-cyan hover:underline"
          }
        >
          Artykuł u {source}
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
        </a>
      ) : null}
    </figcaption>
  );
}
