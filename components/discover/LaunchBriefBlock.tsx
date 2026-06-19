import { cn } from "@/lib/cn";
import type { OpsLaunchBrief } from "@/lib/ops/types";

type Props = {
  brief: OpsLaunchBrief;
  className?: string;
  compact?: boolean;
  /** Wewnątrz karty startu na zdjęciu (mobile) */
  overlay?: boolean;
  /** Bez ramki i etykiety — lead pod tytułem misji */
  inline?: boolean;
  showLabel?: boolean;
  /** Ograniczenie wysokości tekstu (domyślnie bez clamp) */
  maxLines?: 3 | 4 | 5;
};

const MAX_LINES_CLASS: Record<NonNullable<Props["maxLines"]>, string> = {
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
};

export default function LaunchBriefBlock({
  brief,
  className,
  compact,
  overlay,
  inline = false,
  showLabel = true,
  maxLines,
}: Props) {
  const clampClass = maxLines ? MAX_LINES_CLASS[maxLines] : undefined;

  if (inline) {
    return (
      <p
        className={cn(
          "leading-relaxed text-text-secondary",
          compact ? "text-[12.5px] sm:text-[13px]" : "text-[11px] sm:text-[11.5px]",
          clampClass,
          className,
        )}
      >
        {brief.text}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "launch-brief rounded-lg",
        overlay
          ? "launch-brief--overlay border-0 bg-transparent px-0 py-0 shadow-none backdrop-blur-0"
          : "rounded-lg border border-hairline bg-glass/35",
        !overlay && (compact ? "px-2.5 py-2" : "px-3 py-2.5"),
        className,
      )}
    >
      {showLabel ? (
        <p
          className={cn(
            "font-bold uppercase tracking-[0.14em]",
            overlay ? "text-[7px] text-white/40" : "text-[8px] text-text-muted",
          )}
        >
          Kontekst
        </p>
      ) : null}
      <p
        className={cn(
          showLabel ? "mt-0.5" : "",
          "leading-snug",
          overlay
            ? "launch-brief--overlay__text text-[10px] text-white/68"
            : "leading-relaxed text-text-secondary",
          !overlay && (compact ? "text-[10.5px]" : "text-[11.5px]"),
          clampClass,
        )}
      >
        {brief.text}
      </p>
    </div>
  );
}
