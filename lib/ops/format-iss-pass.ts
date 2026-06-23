import type {
  IssPassObservationKind,
  IssPolandPass,
} from "@/lib/ops/iss-poland-passes.types";

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

export function formatPassPeak(pass: IssPolandPass): string {
  const day = fmtDayLabel(pass.maxAt);
  return `${day} ${fmtTime(pass.maxAt)}`;
}

export function formatPassDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m <= 0) return `${s} s`;
  return s > 0 ? `${m} min ${s} s` : `${m} min`;
}

export function formatPassSummary(pass: IssPolandPass): string {
  const dir = azimuthLabelPl(pass.azimuthDeg);
  return `max ${pass.maxElevationDeg.toFixed(0)}° · ${dir}`;
}

const PASS_BADGE: Record<
  IssPassObservationKind,
  { label: string; hint: string }
> = {
  visible: {
    label: "Widoczny",
    hint: "Ciemne niebo, elewacja ≥ 10° — do obserwacji gołym okiem",
  },
  daylight: {
    label: "W dzień",
    hint: "Jasne niebo — ISS niewidoczna, ale tor nad Polską (anteny, łączność)",
  },
  low: {
    label: "Nisko",
    hint: "Nad horyzontem, ale elewacja < 10° — trudna obserwacja wzrokowa",
  },
  shadow: {
    label: "W cieniu",
    hint: "Ciemne niebo, dobra elewacja — lecz ISS w cieniu Ziemi, niewidoczna gołym okiem",
  },
  below: {
    label: "Pod horyzontem",
    hint: "Tor nad terytorium PL, ale satelita poniżej horyzontu ze środka kraju",
  },
};

export function passBadgeMeta(kind: IssPassObservationKind) {
  return PASS_BADGE[kind];
}

export function passBadgeClass(kind: IssPassObservationKind): string {
  switch (kind) {
    case "visible":
      return "ops-iss-passes__badge--visible";
    case "daylight":
      return "ops-iss-passes__badge--daylight";
    case "low":
      return "ops-iss-passes__badge--low";
    case "shadow":
      return "ops-iss-passes__badge--shadow";
    default:
      return "ops-iss-passes__badge--below";
  }
}

/** Jedna linia na homepage — godzina szczytu + elewacja. */
export function formatPassCompact(pass: IssPolandPass): string {
  const day = fmtDayLabel(pass.maxAt);
  const time = fmtTime(pass.maxAt);
  const dir = azimuthLabelPl(pass.azimuthDeg);
  return `${day} ${time} · ${pass.maxElevationDeg.toFixed(0)}° · ${dir}`;
}
