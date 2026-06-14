import type { IssPolandPass } from "@/lib/ops/iss-poland-passes";

const TZ = "Europe/Warsaw";

const COMPASS_PL: [number, string][] = [
  [22.5, "północ"],
  [67.5, "półn.-wsch."],
  [112.5, "wschód"],
  [157.5, "poł.-wsch."],
  [202.5, "południe"],
  [247.5, "poł.-zach."],
  [292.5, "zachód"],
  [337.5, "półn.-zach."],
  [360, "północ"],
];

export function azimuthLabelPl(deg: number): string {
  const d = ((deg % 360) + 360) % 360;
  for (const [max, label] of COMPASS_PL) {
    if (d < max) return label;
  }
  return "północ";
}

function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function fmtDayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const today = new Intl.DateTimeFormat("pl-PL", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const day = new Intl.DateTimeFormat("pl-PL", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);

  if (day === today) return "dziś";
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = new Intl.DateTimeFormat("pl-PL", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(tomorrow);
  if (day === tomorrowStr) return "jutro";

  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

export function formatPassWindow(pass: IssPolandPass): string {
  const day = fmtDayLabel(pass.startAt);
  return `${day} ${fmtTime(pass.startAt)}–${fmtTime(pass.endAt)}`;
}

export function formatPassDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m <= 0) return `${s} s`;
  return s > 0 ? `${m} min ${s} s` : `${m} min`;
}

export function formatPassSummary(pass: IssPolandPass): string {
  const dir = azimuthLabelPl(pass.azimuthDeg);
  const vis = pass.visible ? " · widoczny" : "";
  return `max ${pass.maxElevationDeg.toFixed(0)}° · ${dir}${vis}`;
}
