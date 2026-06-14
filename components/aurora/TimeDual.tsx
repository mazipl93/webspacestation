import {
  formatKpPeriodDual,
  formatTimeDual,
  formatClock,
  formatTimeLocal,
  formatTimeUtc,
  parseNoaaTimeTag,
  PL_TIMEZONE,
} from "@/lib/aurora/time-display";
import { getKpPeriodBounds } from "@/lib/aurora/api";

type TimeDualProps = {
  date: Date;
  seconds?: boolean;
  className?: string;
};

/** Czas polski · UTC w jednej linii (desktop / szerokie kolumny). */
export function TimeDual({ date, seconds = false, className = "" }: TimeDualProps) {
  return (
    <span className={`font-mono ${className}`.trim()}>{formatTimeDual(date, seconds)}</span>
  );
}

/** Czas PL i UTC w dwóch wierszach — bez overflow w wąskich rubrykach. */
export function TimeDualSplit({ date, seconds = false, className = "" }: TimeDualProps) {
  return (
    <span className={`block font-mono leading-snug ${className}`.trim()}>
      <span className="text-slate-300">{formatTimeLocal(date, seconds)}</span>
      <span className="text-slate-500 block text-[0.88em] mt-0.5">{formatTimeUtc(date, seconds)}</span>
    </span>
  );
}

type TimestampTagProps = {
  tag: string;
  seconds?: boolean;
  className?: string;
};

/** NOAA time_tag → dwa wiersze PL / UTC. */
export function TimestampTagDual({ tag, seconds = false, className = "" }: TimestampTagProps) {
  const d = parseNoaaTimeTag(tag);
  if (!d) {
    return <span className={`font-mono text-slate-500 ${className}`.trim()}>{tag}</span>;
  }
  return <TimeDualSplit date={d} seconds={seconds} className={className} />;
}

type TimeRangeDualProps = {
  date?: Date;
  className?: string;
};

/** Okres Kp: lokalny · UTC. */
export function KpPeriodDual({ date = new Date(), className = "" }: TimeRangeDualProps) {
  return (
    <span className={`font-mono text-[11px] text-slate-500 leading-snug ${className}`.trim()}>
      {formatKpPeriodDual(date)}
    </span>
  );
}

type TimeRangeSplitProps = {
  date?: Date;
  className?: string;
};

/** Okres Kp w dwóch wierszach — czytelniej na wąskim ekranie. */
export function KpPeriodSplit({ date = new Date(), className = "" }: TimeRangeSplitProps) {
  const { start, end } = getKpPeriodBounds(date);
  return (
    <span className={`block font-mono leading-snug ${className}`.trim()}>
      <span className="text-slate-300 text-[13px]">
        {formatTimeLocal(start)}–{formatTimeLocal(end)}
      </span>
      <span className="text-slate-500 block text-[12px] mt-1">
        {formatClock(start, "UTC")}–{formatClock(end, "UTC")} UTC
      </span>
    </span>
  );
}

export { PL_TIMEZONE };
