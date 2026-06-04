import { cn } from "@/lib/cn";
import type { WssWordmarkMetrics } from "@/lib/brand/wss-wordmark-metrics";

const LETTERS = ["W", "S", "S"] as const;

type Props = {
  metrics: WssWordmarkMetrics;
  className?: string;
};

/** A — ultra-heavy condensed, kropki · (The Verge / Manuka lane). */
export default function WssWordmarkStation({ metrics, className }: Props) {
  const { letterPx, subPx, gap, letterGap, dotSize } = metrics;

  return (
    <div className={cn("inline-flex min-w-0 flex-col justify-center", className)}>
      <div
        className="font-wss-station flex items-center uppercase leading-none"
        style={{ gap: letterGap, fontSize: letterPx, fontWeight: 900, letterSpacing: "0.07em" }}
      >
        {LETTERS.map((letter, i) => (
          <span key={`${letter}-${i}`} className="inline-flex items-center" style={{ gap: letterGap }}>
            <span>{letter}</span>
            {i < LETTERS.length - 1 ? (
              <span
                className="shrink-0 rounded-full bg-accent-cyan/80"
                style={{ width: dotSize, height: dotSize }}
                aria-hidden
              />
            ) : null}
          </span>
        ))}
      </div>
      <span
        className="font-wss-station uppercase leading-none"
        style={{
          marginTop: gap,
          fontSize: subPx,
          fontWeight: 600,
          letterSpacing: "0.32em",
          color: "var(--color-nav-fg-muted, #8b9ab8)",
        }}
      >
        Web Space Station
      </span>
    </div>
  );
}
