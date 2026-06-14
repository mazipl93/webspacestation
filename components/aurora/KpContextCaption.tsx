import { cn } from "@/lib/cn";
import type { KpLiveReading } from "@/lib/aurora/api";
import { hasKpPeriodPeakAboveCurrent } from "@/lib/aurora/api";

type Props = {
  reading: KpLiveReading;
  className?: string;
  /** compact = jedna linia bez „szac. NOAA” */
  variant?: "default" | "compact" | "hud";
};

export default function KpContextCaption({
  reading,
  className,
  variant = "default",
}: Props) {
  const showPeak = hasKpPeriodPeakAboveCurrent(reading);

  if (variant === "hud") {
    return (
      <span className={cn("aurora-desktop-hud__unit", className)}>
        {reading.notation} · szac. NOAA
        {showPeak && <> · szczyt {reading.periodPeak.toFixed(1)}</>}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span className={cn("font-mono text-slate-400", className)}>
        {reading.notation}
        {showPeak && (
          <span className="text-slate-600">
            {" "}
            · szczyt {reading.periodPeak.toFixed(1)}
          </span>
        )}
      </span>
    );
  }

  return (
    <p className={cn("text-[11px] text-slate-500 font-mono leading-snug", className)}>
      <span className="text-slate-400">{reading.notation}</span>
      <span className="text-slate-600"> · </span>
      <span>szac. NOAA · 1 min</span>
      {showPeak && (
        <>
          <span className="text-slate-600"> · </span>
          <span className="text-slate-400">szczyt okna {reading.periodPeak.toFixed(1)}</span>
        </>
      )}
    </p>
  );
}
