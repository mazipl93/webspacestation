import type { KpData, SolarWindData } from "@/lib/aurora/api";

const NOAA_BASE = "https://services.swpc.noaa.gov";

/** Max RTSW points kept (~6h at 1-min cadence) — same as Aurora terminal. */
export const RTSW_MAX_POINTS = 360;

type RtswMagItem = {
  time_tag: string;
  active: boolean;
  bx_gsm: number;
  by_gsm: number;
  bz_gsm: number;
  bt: number;
};

type RtswWindItem = {
  time_tag: string;
  active: boolean;
  proton_density: number;
  proton_speed: number;
  proton_temperature: number;
};

type Kp1mItem = {
  time_tag: string;
  kp_index: number;
  estimated_kp: number;
  kp: string;
};

type Kp3DayItem = {
  time_tag: string;
  Kp: number;
};

function normTime(t: string | undefined | null): string {
  if (!t) return "";
  if (t.includes("T")) return t;
  return t.replace(" ", "T").replace(".000", "") + "Z";
}

function minuteKey(timeTag: string): string {
  return timeTag.replace(/:\d{2}$/, "");
}

function shiftMinuteKey(key: string, deltaMin: number): string {
  const d = new Date(key.includes("T") ? key : key.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return key;
  d.setUTCMinutes(d.getUTCMinutes() + deltaMin);
  return d.toISOString().slice(0, 16);
}

function findWindForMinute(
  key: string,
  windByMinute: Map<string, RtswWindItem>,
  lastWind: RtswWindItem | null,
): RtswWindItem | null {
  return (
    windByMinute.get(key) ??
    windByMinute.get(shiftMinuteKey(key, -1)) ??
    windByMinute.get(shiftMinuteKey(key, 1)) ??
    lastWind
  );
}

/** RTSW 1-min merge — identical to Aurora terminal (useAuroraData). */
export function parseRtswSolarWind(magRaw: RtswMagItem[], windRaw: RtswWindItem[]): SolarWindData[] {
  const windByMinute = new Map<string, RtswWindItem>();
  for (const row of windRaw) {
    if (!row.active) continue;
    windByMinute.set(minuteKey(row.time_tag), row);
  }

  const activeMag = magRaw.filter((r) => r.active);
  activeMag.sort((a, b) => a.time_tag.localeCompare(b.time_tag));
  const sliceMag = activeMag.slice(-RTSW_MAX_POINTS);

  let lastWind: RtswWindItem | null = null;
  const points: SolarWindData[] = [];
  for (const row of sliceMag) {
    const key = minuteKey(row.time_tag);
    const wind = findWindForMinute(key, windByMinute, lastWind);
    if (wind) lastWind = wind;

    points.push({
      time_tag: normTime(row.time_tag),
      bx: row.bx_gsm ?? 0,
      by: row.by_gsm ?? 0,
      bz: row.bz_gsm ?? 0,
      bt: row.bt ?? 0,
      speed: wind?.proton_speed ?? lastWind?.proton_speed ?? 0,
      density: wind?.proton_density ?? lastWind?.proton_density ?? 0,
      temperature: wind?.proton_temperature ?? lastWind?.proton_temperature ?? 0,
    });
  }

  return points;
}

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

/** Kp 1-min — terminal semantics (estimated_kp). */
export async function fetchTerminalKp1m(): Promise<KpData[]> {
  const raw = await fetchJson<Kp1mItem[]>(`${NOAA_BASE}/json/planetary_k_index_1m.json`, []);
  return raw.slice(-120).map((r) => ({
    time: r.time_tag,
    kp: r.estimated_kp ?? r.kp_index ?? 0,
    observed: r.kp || "observed",
  }));
}

/** Kp 3h official series — terminal semantics. */
export async function fetchTerminalKp3Day(): Promise<KpData[]> {
  const raw = await fetchJson<Kp3DayItem[]>(
    `${NOAA_BASE}/products/noaa-planetary-k-index.json`,
    [],
  );
  return raw.map((r) => ({
    time: r.time_tag,
    kp: r.Kp ?? 0,
    observed: "observed",
  }));
}

/** Solar wind RTSW 1-min — terminal semantics. */
export async function fetchTerminalSolarWind(): Promise<SolarWindData[]> {
  const [mag, wind] = await Promise.all([
    fetchJson<RtswMagItem[]>(`${NOAA_BASE}/json/rtsw/rtsw_mag_1m.json`, []),
    fetchJson<RtswWindItem[]>(`${NOAA_BASE}/json/rtsw/rtsw_wind_1m.json`, []),
  ]);
  return parseRtswSolarWind(mag, wind);
}
