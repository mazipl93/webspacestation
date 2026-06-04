import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** Readable meta on photo heroes — dark glass chip, not flat gray on image. */
export default function HeroMetaChip({
  icon: Icon,
  children,
  compact = false,
  variant = "overlay",
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  compact?: boolean;
  variant?: "overlay" | "panel";
}) {
  const onPanel = variant === "panel";

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold leading-none",
        compact ? "gap-1 px-2 py-0.5 text-[10.5px]" : "gap-1.5 px-2.5 py-1 text-[13px]",
        onPanel
          ? "rounded-md border border-hairline bg-glass text-text-secondary"
          : compact
            ? "rounded-md border border-white/20 bg-black/60 text-white shadow-[0_2px_12px_rgba(0,0,0,0.5)] backdrop-blur-md"
            : "rounded-md border border-white/20 bg-black/60 text-white shadow-[0_2px_16px_rgba(0,0,0,0.55)] backdrop-blur-md",
      )}
    >
      <Icon
        size={compact ? 12 : 14}
        className={cn("shrink-0", onPanel ? "text-text-muted" : "text-white/90")}
        aria-hidden
      />
      {children}
    </span>
  );
}
