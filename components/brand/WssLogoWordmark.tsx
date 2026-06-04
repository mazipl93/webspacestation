import { cn } from "@/lib/cn";
import { wssWordmarkMetrics } from "@/lib/brand/wss-wordmark-metrics";
import WssWordmarkControl from "@/components/brand/wordmarks/WssWordmarkControl";

type Props = {
  height?: number;
  className?: string;
};

/** Logo WSS — wariant C · Control (Oswald lockup). */
export default function WssLogoWordmark({ height = 52, className }: Props) {
  const metrics = wssWordmarkMetrics(height);

  return (
    <div
      className={cn(
        "inline-flex min-w-0 max-w-[min(280px,56vw)] flex-col justify-center",
        className,
      )}
      style={{ height: `${height}px` }}
      aria-hidden
    >
      <WssWordmarkControl metrics={metrics} />
    </div>
  );
}
