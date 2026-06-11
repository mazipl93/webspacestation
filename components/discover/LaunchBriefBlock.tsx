import { cn } from "@/lib/cn";
import type { OpsLaunchBrief } from "@/lib/ops/types";

type Props = {
  brief: OpsLaunchBrief;
  className?: string;
  compact?: boolean;
};

export default function LaunchBriefBlock({ brief, className, compact }: Props) {
  return (
    <div
      className={cn(
        "launch-brief rounded-lg border border-hairline bg-glass/35",
        compact ? "px-2.5 py-2" : "px-3 py-2.5",
        className,
      )}
    >
      <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-text-muted">
        Kontekst
      </p>
      <p
        className={cn(
          "mt-1 leading-relaxed text-text-secondary",
          compact ? "text-[10.5px]" : "text-[11.5px]",
        )}
      >
        {brief.text}
      </p>
    </div>
  );
}
