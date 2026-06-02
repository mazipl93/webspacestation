import { ExternalLink } from "lucide-react";

type Props = {
  credit: string;
  source?: string;
  originalUrl?: string;
  /** compact = cards / list; default = article hero */
  variant?: "default" | "compact";
};

export default function CoverImageCredit({
  credit,
  source,
  originalUrl,
  variant = "default",
}: Props) {
  const compact = variant === "compact";

  return (
    <figcaption
      className={
        compact
          ? "mt-1.5 text-[10px] leading-snug text-text-muted"
          : "text-[11px] leading-relaxed text-text-tertiary"
      }
    >
      <span className={compact ? "line-clamp-2" : undefined}>{credit}</span>
      {originalUrl && source ? (
        <a
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            compact
              ? "mt-0.5 inline-flex items-center gap-0.5 text-accent-cyan hover:underline"
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
