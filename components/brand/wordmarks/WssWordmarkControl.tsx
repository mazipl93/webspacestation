import { cn } from "@/lib/cn";
import type { WssWordmarkMetrics } from "@/lib/brand/wss-wordmark-metrics";

type Props = {
  metrics: WssWordmarkMetrics;
  className?: string;
};

/** C — lockup Bloomberg / SpaceX: WSS + WEB SPACE STATION. */
export default function WssWordmarkControl({ metrics, className }: Props) {
  const { letterPx, subPx, gap } = metrics;

  return (
    <div className={cn("inline-flex min-w-0 flex-col justify-center", className)}>
      <span
        className="font-wss-control uppercase leading-none"
        style={{
          fontSize: letterPx,
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: "var(--color-nav-fg, #f8fafc)",
        }}
      >
        WSS
      </span>
      <span
        className="font-wss-control uppercase leading-none"
        style={{
          marginTop: gap,
          fontSize: subPx,
          fontWeight: 500,
          letterSpacing: "0.22em",
          color: "var(--color-nav-fg-muted, #8b9ab8)",
        }}
      >
        Web Space Station
      </span>
    </div>
  );
}
