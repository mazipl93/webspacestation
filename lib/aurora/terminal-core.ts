import type { KpData, SolarWindData } from "@/lib/aurora/api";
import { parseRtswSolarWind } from "@/lib/aurora/rtsw";

const NOAA_BASE = "https://services.swpc.noaa.gov";
const FETCH_TIMEOUT_MS = 10_000;
const RETRY_BACKOFF_MS = 600;

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

export type AuroraTerminalCore = {
  kp1m: KpData[];
  kp3Day: KpData[];
  solarWind: SolarWindData[];
  lastUpdate: Date;
};

let cachedCore: AuroraTerminalCore | null = null;
const listeners = new Set<() => void>();

export function getAuroraTerminalCoreCache(): AuroraTerminalCore | null {
  return cachedCore;
}

export function setAuroraTerminalCoreCache(core: AuroraTerminalCore): void {
  cachedCore = core;
  for (const listener of listeners) listener();
}

export function subscribeAuroraTerminalCore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function fetchNoaaJson<T>(
  url: string,
  fallback: T,
  signal?: AbortSignal,
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (signal?.aborted) return fallback;
    try {
      const res = await fetch(url, {
        cache: "no-store",
        signal: signal ?? AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (res.ok) return (await res.json()) as T;
    } catch (err) {
      if (signal?.aborted) return fallback;
      if (attempt === 1) break;
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_BACKOFF_MS));
  }
  return fallback;
}

function parseKp1m(raw: Kp1mItem[]): KpData[] {
  return raw.slice(-120).map((row) => ({
    time: row.time_tag,
    kp: row.estimated_kp ?? row.kp_index ?? 0,
    observed: row.kp || "observed",
  }));
}

function parseKp3Day(raw: Kp3DayItem[]): KpData[] {
  return raw.map((row) => ({
    time: row.time_tag,
    kp: row.Kp ?? 0,
    observed: "observed",
  }));
}

/** Core NOAA metrics shared by /zorza and homepage aurora widget. */
export async function fetchAuroraTerminalCore(
  signal?: AbortSignal,
): Promise<AuroraTerminalCore> {
  const [kp1mRaw, kp3DayRaw, magRaw, windRaw] = await Promise.all([
    fetchNoaaJson<Kp1mItem[]>(
      `${NOAA_BASE}/json/planetary_k_index_1m.json`,
      [],
      signal,
    ),
    fetchNoaaJson<Kp3DayItem[]>(
      `${NOAA_BASE}/products/noaa-planetary-k-index.json`,
      [],
      signal,
    ),
    fetchNoaaJson<RtswMagItem[]>(`${NOAA_BASE}/json/rtsw/rtsw_mag_1m.json`, [], signal),
    fetchNoaaJson<RtswWindItem[]>(`${NOAA_BASE}/json/rtsw/rtsw_wind_1m.json`, [], signal),
  ]);

  return {
    kp1m: parseKp1m(kp1mRaw),
    kp3Day: parseKp3Day(kp3DayRaw),
    solarWind: parseRtswSolarWind(magRaw, windRaw),
    lastUpdate: new Date(),
  };
}

export function snapshotToTerminalCore(snapshot: {
  kp1m: KpData[];
  kp3Day: KpData[];
  solarWind: SolarWindData[];
  updatedAt: string;
}): AuroraTerminalCore {
  return {
    kp1m: snapshot.kp1m,
    kp3Day: snapshot.kp3Day,
    solarWind: snapshot.solarWind,
    lastUpdate: new Date(snapshot.updatedAt),
  };
}
