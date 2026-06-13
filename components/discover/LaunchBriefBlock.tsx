import { cn } from "@/lib/cn";
import type { OpsLaunchBrief } from "@/lib/ops/types";

type Props = {
  brief: OpsLaunchBrief;
  className?: string;
  compact?: boolean;
  /** Wewnątrz karty startu na zdjęciu (mobile) */
  overlay?: boolean;
};

export default function LaunchBriefBlock({ brief, className, compact, overlay }: Props) {
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
      <p
        className={cn(
          "font-bold uppercase tracking-[0.14em]",
          overlay ? "text-[7px] text-white/40" : "text-[8px] text-text-muted",
        )}
      >
        Kontekst
      </p>
      <p
        className={cn(
          "mt-0.5 leading-snug",
          overlay
            ? "launch-brief--overlay__text text-[10px] text-white/68"
            : "leading-relaxed text-text-secondary",
          !overlay && (compact ? "text-[10.5px]" : "text-[11.5px]"),
        )}
      >
        {brief.text}
      </p>
    </div>
  );
}
