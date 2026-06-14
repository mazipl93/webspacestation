import { getKpPeriodBounds } from "@/lib/aurora/api";

export const PL_TIMEZONE = "Europe/Warsaw";

type ClockOpts = { seconds?: boolean };

export function parseNoaaTimeTag(t: string): Date | null {
  if (!t) return null;
  try {
    const normalized = t.includes("T") ? t : t.replace(" ", "T") + (t.length === 19 ? "Z" : "");
    const iso = normalized.endsWith("Z") || /[+-]\d\d:\d\d$/.test(normalized)
      ? normalized
      : `${normalized}Z`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function formatClock(date: Date, timeZone: string, opts?: ClockOpts): string {
  return date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: opts?.seconds ? "2-digit" : undefined,
    timeZone,
  });
}

export function formatTimeLocal(date: Date, seconds = false): string {
  return formatClock(date, PL_TIMEZONE, { seconds });
}

export function formatTimeUtc(date: Date, seconds = false): string {
  return `${formatClock(date, "UTC", { seconds })} UTC`;
}

/** Np. „11:00 · 09:00 UTC” */
export function formatTimeDual(date: Date, seconds = false): string {
  return `${formatTimeLocal(date, seconds)} · ${formatTimeUtc(date, seconds)}`;
}

export function formatTimeDualFromTag(t: string, seconds = false): string {
  const d = parseNoaaTimeTag(t);
  if (!d) return t.slice(11, 16) || t;
  return formatTimeDual(d, seconds);
}

/** Oś wykresu — czas polski. */
export function formatChartAxisTime(t: string): string {
  const d = parseNoaaTimeTag(t);
  if (!d) return t.slice(11, 16) || t;
  return formatTimeLocal(d);
}

/** Tooltip wykresu — PL + UTC. */
export function formatChartTooltipTime(t: string): string {
  return formatTimeDualFromTag(t);
}

/** Np. „08:00–11:00 · 06:00–09:00 UTC” */
export function formatKpPeriodDual(date = new Date()): string {
  const { start, end } = getKpPeriodBounds(date);
  const local = `${formatTimeLocal(start)}–${formatTimeLocal(end)}`;
  const utc = `${formatClock(start, "UTC")}–${formatClock(end, "UTC")} UTC`;
  return `${local} · ${utc}`;
}

export function formatForecastAxisLabel(isoTime: string): string {
  const d = parseNoaaTimeTag(isoTime);
  if (!d) return isoTime.slice(5, 16);
  return d.toLocaleString("pl-PL", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: PL_TIMEZONE,
  });
}

export function formatAlertIssueTime(isoTime: string): string {
  const raw = isoTime.includes("T") ? isoTime : isoTime.replace(" ", "T");
  const d = parseNoaaTimeTag(raw.endsWith("Z") ? raw : `${raw}Z`);
  if (!d) return isoTime.slice(0, 16).replace("T", " ");
  const local = d.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: PL_TIMEZONE,
  });
  const utc = d.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  return `${local} · ${utc} UTC`;
}
