import { cn } from "@/lib/cn";
import type { WssWordmarkMetrics } from "@/lib/brand/wss-wordmark-metrics";
import WssLetterWCustom from "@/components/brand/WssLetterWCustom";

type Props = {
  metrics: WssWordmarkMetrics;
  className?: string;
};

/** B — custom W + S|S (NASA / Axios: jeden akcent na literze). */
export default function WssWordmarkApex({ metrics, className }: Props) {
  const { letterPx, subPx, gap, letterGap, barH } = metrics;
  const fg = "var(--color-nav-fg, #f8fafc)";

  return (
    <div className={cn("inline-flex min-w-0 flex-col justify-center", className)}>
      <div
        className="flex items-center uppercase leading-none"
        style={{ gap: letterGap, color: fg }}
      >
        <WssLetterWCustom height={Math.round(letterPx * 1.05)} />
        <span
          className="shrink-0 bg-accent-cyan/70"
          style={{ width: 1, height: barH }}
          aria-hidden
        />
        <span
          className="font-wss-apex inline-flex items-center"
          style={{ gap: letterGap, fontSize: letterPx, fontWeight: 900, letterSpacing: "0.05em" }}
        >
          <span>S</span>
          <span
            className="shrink-0 bg-accent-cyan/70"
            style={{ width: 1, height: barH }}
            aria-hidden
          />
          <span>S</span>
        </span>
      </div>
      <span
        className="font-wss-apex uppercase leading-none"
        style={{
          marginTop: gap,
          fontSize: subPx,
          fontWeight: 600,
          letterSpacing: "0.3em",
          color: "var(--color-nav-fg-muted, #8b9ab8)",
        }}
      >
        Web Space Station
      </span>
    </div>
  );
}
