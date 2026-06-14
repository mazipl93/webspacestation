// Aurora / Space Weather API layer
// All endpoints are free, no API key required (NOAA SWPC + Open-Meteo)

export interface KpData {
  time: string;
  kp: number;
  observed: string;
}

export interface SolarWindData {
  time_tag: string;
  speed: number;
  density: number;
  temperature: number;
  bz: number;
  bt: number;
  by: number;
  bx: number;
}

/** L1 → Earth distance used for solar-wind propagation delay (km). */
const L1_TO_EARTH_KM = 1_500_000;

/** Fallback propagation delay when speed is temporarily unknown (~typical L1→Earth). */
export const DEFAULT_PROPAGATION_DELAY_MIN = 45;

/** Minimum valid solar-wind speed for delay calculation (km/s). */
const MIN_VALID_SPEED_KMS = 100;

/** Start of the current 3-hour UTC Kp window (00, 03, 06, …). */
export function getUtc3hPeriodStart(date = new Date()): string {
  const h = Math.floor(date.getUTCHours() / 3) * 3;
  return `${date.toISOString().slice(0, 11)}${String(h).padStart(2, "0")}:00:00`;
}

/** Granice bieżącego 3-godzinnego okna Kp (UTC). */
export function getKpPeriodBounds(date = new Date()): { start: Date; end: Date } {
  const h = Math.floor(date.getUTCHours() / 3) * 3;
  const start = new Date(date);
  start.setUTCMinutes(0, 0, 0);
  start.setUTCMilliseconds(0);
  start.setUTCHours(h);
  const end = new Date(start);
  end.setUTCHours(h + 3);
  return { start, end };
}


/** NOAA 28-step Kp scale (thirds) — jak SpaceWeatherLive / GFZ. */
const KP_NOTATION_STEPS: { label: string; value: number }[] = [
  { label: "0o", value: 0 },
  { label: "0+", value: 0.33 },
  { label: "1−", value: 0.67 },
  { label: "1o", value: 1 },
  { label: "1+", value: 1.33 },
  { label: "2−", value: 1.67 },
  { label: "2o", value: 2 },
  { label: "2+", value: 2.33 },
  { label: "3−", value: 2.67 },
  { label: "3o", value: 3 },
  { label: "3+", value: 3.33 },
  { label: "4−", value: 3.67 },
  { label: "4o", value: 4 },
  { label: "4+", value: 4.33 },
  { label: "5−", value: 4.67 },
  { label: "5o", value: 5 },
  { label: "5+", value: 5.33 },
  { label: "6−", value: 5.67 },
  { label: "6o", value: 6 },
  { label: "6+", value: 6.33 },
  { label: "7−", value: 6.67 },
  { label: "7o", value: 7 },
  { label: "7+", value: 7.33 },
  { label: "8−", value: 7.67 },
  { label: "8o", value: 8 },
  { label: "8+", value: 8.33 },
  { label: "9−", value: 8.67 },
  { label: "9o", value: 9 },
];

export type KpLiveReading = {
  /** Bieżący estimated Kp (NOAA 1-min, ostatnia wartość). */
  current: number;
  /** Szczyt estimated Kp w bieżącym oknie 3h UTC. */
  periodPeak: number;
  /** Ostatni zamknięty oficjalny Kp 3h. */
  lastClosed: number;
  /** Notacja 28-stopniowa (1+, 2−, …). */
  notation: string;
};

/** Mapuje wartość Kp na notację NOAA 28-stopniową. */
export function formatKpNotation(kp: number): string {
  if (!Number.isFinite(kp)) return "—";
  let best = KP_NOTATION_STEPS[0];
  let bestDist = Math.abs(kp - best.value);
  for (const step of KP_NOTATION_STEPS) {
    const dist = Math.abs(kp - step.value);
    if (dist < bestDist) {
      best = step;
      bestDist = dist;
    }
  }
  return best.label;
}

/** Szczyt estimated Kp w bieżącym 3-godzinnym oknie UTC. */
export function getKpPeriodPeak(kp1m: KpData[], date = new Date()): number {
  const periodStart = getUtc3hPeriodStart(date);
  const inPeriod = kp1m.filter((p) => p.time >= periodStart);
  if (inPeriod.length === 0) return kp1m.at(-1)?.kp ?? 0;
  return Math.max(...inPeriod.map((p) => p.kp));
}

/** Odczyt Kp na żywo — zgodny z NOAA SWPC Estimated Planetary K-index. */
export function getKpLiveReading(kp1m: KpData[], kp3Day: KpData[]): KpLiveReading {
  const lastClosed = kp3Day.at(-1)?.kp ?? 0;
  const current = kp1m.at(-1)?.kp ?? lastClosed;
  const periodPeak = getKpPeriodPeak(kp1m);
  return {
    current,
    periodPeak,
    lastClosed,
    notation: formatKpNotation(current),
  };
}

/** Bieżący estimated Kp (NOAA 1-min). */
export function getDisplayKp(kp1m: KpData[], kp3Day: KpData[]): number {
  return getKpLiveReading(kp1m, kp3Day).current;
}

/** Czy szczyt okna 3h wyraźnie przewyższa bieżący odczyt. */
export function hasKpPeriodPeakAboveCurrent(reading: KpLiveReading, epsilon = 0.15): boolean {
  return reading.periodPeak > reading.current + epsilon;
}

/** Last non-zero solar-wind speed in the series (newest first). */
export function getLastKnownSolarWindSpeed(data: SolarWindData[]): number | null {
  for (let i = data.length - 1; i >= 0; i--) {
    const s = data[i].speed;
    if (s > MIN_VALID_SPEED_KMS) return s;
  }
  return null;
}

/**
 * L1→Earth propagation delay in minutes.
 * Uses fallback speed or ~45 min default when the latest minute lacks plasma data.
 */
export function getSolarWindPropagationDelayMin(
  speedKmS: number,
  fallbackSpeed?: number | null,
): number {
  const effective =
    speedKmS > MIN_VALID_SPEED_KMS
      ? speedKmS
      : fallbackSpeed && fallbackSpeed > MIN_VALID_SPEED_KMS
        ? fallbackSpeed
        : 0;
  if (effective > MIN_VALID_SPEED_KMS) {
    return Math.round(L1_TO_EARTH_KM / effective / 60);
  }
  return DEFAULT_PROPAGATION_DELAY_MIN;
}

/** Earth-marker index/key helpers shared by chart + header. */
export function getEarthSolarWindMarker(data: SolarWindData[]): {
  delayMin: number;
  earthIndex: number;
  earthPoint: SolarWindData | null;
} | null {
  if (data.length === 0) return null;
  const latest = data.at(-1)!;
  const fallbackSpeed = getLastKnownSolarWindSpeed(data);
  const delayMin = getSolarWindPropagationDelayMin(latest.speed, fallbackSpeed);
  const earthIndex = Math.max(0, data.length - 1 - delayMin);
  const earthPoint = data[earthIndex] ?? latest;
  return { delayMin, earthIndex, earthPoint };
}

/** Solar-wind conditions currently arriving at Earth (L1 minus propagation delay). */
export function getEarthSolarWindPoint(data: SolarWindData[]): SolarWindData | null {
  if (data.length === 0) return null;
  const window = data.slice(-360);
  const latest = window.at(-1)!;
  const fallbackSpeed = getLastKnownSolarWindSpeed(window);
  const delayMin = getSolarWindPropagationDelayMin(latest.speed, fallbackSpeed);
  const earthIndex = Math.max(0, window.length - 1 - delayMin);
  const earth = window[earthIndex] ?? latest;
  const l1Speed =
    latest.speed > MIN_VALID_SPEED_KMS ? latest.speed : (fallbackSpeed ?? latest.speed);
  // Mag and plasma can be offset by 1 min — keep L1 plasma for speed/density if earth row lacks it
  return {
    ...earth,
    speed: earth.speed > MIN_VALID_SPEED_KMS ? earth.speed : l1Speed,
    density: earth.density > 0 ? earth.density : latest.density,
    temperature: earth.temperature > 0 ? earth.temperature : latest.temperature,
  };
}

/** Minutes Bz has been continuously negative (5-min smoothing to reduce 1-min noise). */
export function getNegativeBzDurationMin(data: SolarWindData[], atIndex?: number): number | null {
  if (data.length === 0) return null;
  const idx = atIndex ?? data.length - 1;
  const earth = data[idx];
  if (!earth || earth.bz >= 0) return null;

  const smoothed = data.map((p, i, arr) => {
    const slice = arr.slice(Math.max(0, i - 2), i + 1);
    return slice.reduce((s, x) => s + x.bz, 0) / slice.length;
  });

  let minutes = 0;
  for (let i = idx; i >= 0; i--) {
    if (smoothed[i] >= 0) break;
    minutes++;
  }
  return minutes > 0 ? minutes : null;
}

/**
 * Y domain for Bz chart — golden middle between tight auto-scale and fixed ±20.
 * Data occupies ~55–65% of axis height; minimum span prevents over-zoom when calm.
 */
export function getBzChartDomain(bzValues: number[]): [number, number] {
  if (bzValues.length === 0) return [-6, 6];

  const dataMin = Math.min(...bzValues);
  const dataMax = Math.max(...bzValues);
  const dataSpan = Math.max(dataMax - dataMin, 0.5);
  const mid = (dataMax + dataMin) / 2;

  // Share of axis used by data (rest = top/bottom margin)
  const fillRatio = dataSpan > 35 ? 0.68 : dataSpan > 18 ? 0.6 : 0.55;

  // Floor span — stops the line hugging top/bottom edges
  const minDomainSpan =
    dataSpan <= 4 ? 12 :
    dataSpan <= 8 ? 14 :
    dataSpan <= 16 ? 16 :
    dataSpan * 1.3;

  let domainSpan = Math.max(dataSpan / fillRatio, minDomainSpan);

  // Calm: allow at most ~2.5× data span, but never below minDomainSpan
  if (dataSpan < 14) {
    domainSpan = Math.max(minDomainSpan, Math.min(domainSpan, dataSpan * 2.5));
  }

  let lo = mid - domainSpan / 2;
  let hi = mid + domainSpan / 2;

  // Keep Bz=0 visible when values oscillate around it
  if (dataMin <= 2.5 && dataMax >= -2.5) {
    const needLo = -2.5;
    const needHi = 2.5;
    if (lo > needLo) {
      const shift = needLo - lo;
      lo += shift;
      hi += shift;
    }
    if (hi < needHi) {
      const shift = needHi - hi;
      lo -= shift;
      hi -= shift;
    }
  }

  // Hint at −5 nT band when data goes south, without over-tightening
  if (dataMin < -4 && dataMin > -18 && lo > -8) {
    lo = Math.min(lo, -7);
    if (hi - lo < domainSpan) hi = lo + domainSpan;
  }

  // Round to clean ticks
  const totalSpan = hi - lo;
  if (totalSpan <= 18) {
    lo = Math.floor(lo);
    hi = Math.ceil(hi);
    if (hi - lo < minDomainSpan) {
      const m = (hi + lo) / 2;
      const half = Math.ceil(minDomainSpan / 2);
      lo = m - half;
      hi = m + half;
    }
  } else if (totalSpan <= 45) {
    lo = Math.floor(lo);
    hi = Math.ceil(hi);
  } else {
    lo = Math.floor(lo / 5) * 5;
    hi = Math.ceil(hi / 5) * 5;
  }

  return [lo, hi];
}

/** Y domain for speed / density / Bt mini-charts (same margin philosophy as Bz). */
export function getMetricChartDomain(values: number[]): [number, number] {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return [0, 1];

  const dataMin = Math.min(...finite);
  const dataMax = Math.max(...finite);
  const dataSpan = Math.max(dataMax - dataMin, 0.01);
  const mid = (dataMax + dataMin) / 2;
  const fillRatio = dataSpan > 50 ? 0.65 : 0.55;

  const minDomainSpan =
    dataSpan <= 1 ? Math.max(dataSpan * 4, 0.5) :
    dataSpan <= 5 ? Math.max(dataSpan * 2.5, 2) :
    dataSpan <= 20 ? Math.max(dataSpan * 1.6, 6) :
    dataSpan * 1.25;

  let domainSpan = Math.max(dataSpan / fillRatio, minDomainSpan);
  if (dataSpan < 30) {
    domainSpan = Math.max(minDomainSpan, Math.min(domainSpan, dataSpan * 2.5));
  }

  let lo = mid - domainSpan / 2;
  let hi = mid + domainSpan / 2;

  const totalSpan = hi - lo;
  if (totalSpan <= 5) {
    lo = Math.floor(lo * 10) / 10;
    hi = Math.ceil(hi * 10) / 10;
  } else if (totalSpan <= 30) {
    lo = Math.floor(lo * 2) / 2;
    hi = Math.ceil(hi * 2) / 2;
  } else {
    lo = Math.floor(lo);
    hi = Math.ceil(hi);
  }

  return [lo, hi];
}

export type BzZoneBand = { y1: number; y2: number; fill: string; opacity: number };

/** Southward zone backgrounds that intersect the current Y domain. */
export function getVisibleBzZones(domain: [number, number]): BzZoneBand[] {
  const [lo] = domain;
  const zones: BzZoneBand[] = [];
  if (lo < 0) zones.push({ y1: -5, y2: 0, fill: "#ffdd00", opacity: 0.05 });
  if (lo < -5) zones.push({ y1: -10, y2: -5, fill: "#ffaa00", opacity: 0.06 });
  if (lo < -10) zones.push({ y1: Math.min(lo, -15), y2: -10, fill: "#ff6600", opacity: 0.07 });
  return zones.filter((z) => z.y1 < z.y2);
}

/** Reference lines (−5/−10/−15 nT) visible within domain. */
export function getVisibleBzThresholds(domain: [number, number]): number[] {
  const [lo, hi] = domain;
  return [-5, -10, -15].filter((t) => t >= lo && t <= hi);
}

/** Bz trend at Earth: more southward vs ~N minutes ago. */
export function getEarthBzTrend(
  data: SolarWindData[],
  minutesAgo = 30,
): "south" | "north" | "flat" | null {
  const marker = getEarthSolarWindMarker(data);
  if (!marker) return null;
  const nowBz = marker.earthPoint?.bz;
  const agoIdx = Math.max(0, marker.earthIndex - minutesAgo);
  const agoBz = data[agoIdx]?.bz;
  if (nowBz == null || agoBz == null) return null;
  const delta = nowBz - agoBz;
  if (Math.abs(delta) < 0.4) return "flat";
  return delta < 0 ? "south" : "north";
}

export interface GeomagneticIndex {
  time_tag: string;
  value: number;
}

export interface NoaaAlert {
  productId: string;
  issueTime: string;
  message: string;
  type: string;
}

export interface KpForecast {
  time: string;
  kp: number;
  observed: string;
}

export interface XrayFlux {
  time_tag: string;
  flux: number;
  satellite: number;
}

export interface SolarFlare {
  beginTime: string;
  maxTime: string;
  classType: string;
  sourceLocation: string;
  activeRegionNum: number | null;
}

export interface SolarRegion {
  region: string;
  latitude: number;
  longitude: number;
  mag_class: string;
  num_spots: number;
  area: number;
  first_date: string;
  last_date: string;
}

export interface SpaceWeatherData {
  kpCurrent: KpData[];
  kp24h: KpData[];
  kp72h: KpData[];
  kp3DayForecast: KpForecast[];
  solarWind: SolarWindData[];
  solarWindRecent: SolarWindData[];
  dst: GeomagneticIndex[];
  ae: GeomagneticIndex[];
  symh: GeomagneticIndex[];
  hp30: GeomagneticIndex[];
  alerts: NoaaAlert[];
  xrayFlux: XrayFlux[];
  solarFlares: SolarFlare[];
  sunspotNumber: number | null;
  radioBurstStatus: string;
  timestamp: string;
}

const NOAA_BASE = "https://services.swpc.noaa.gov";

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchKpCurrent(): Promise<KpData[]> {
  const raw = await fetchJson<number[][]>(
    `${NOAA_BASE}/json/planetary_k_index_1m.json`,
    []
  );
  return raw.slice(-60).map((row) => ({
    time: row[0] ? String(row[0]) : "",
    kp: Number(row[1]) || 0,
    observed: "observed",
  }));
}

export async function fetchKp3Day(): Promise<KpData[]> {
  const raw = await fetchJson<number[][]>(
    `${NOAA_BASE}/products/noaa-planetary-k-index.json`,
    []
  );
  return raw.slice(1).map((row) => ({
    time: String(row[0]),
    kp: Number(row[1]) || 0,
    observed: String(row[2] || "observed"),
  }));
}

export async function fetchKpForecast(): Promise<KpForecast[]> {
  type RawForecast = { time_tag: string; kp: number; observed: string };
  const raw = await fetchJson<RawForecast[]>(
    `${NOAA_BASE}/products/noaa-planetary-k-index-forecast.json`,
    []
  );
  return raw.slice(0, 24).map((r) => ({
    time: r.time_tag,
    kp: r.kp,
    observed: r.observed,
  }));
}

export async function fetchSolarWind(): Promise<SolarWindData[]> {
  type RawMag = [string, string, string, string, string, string, string, string];
  type RawPlasma = [string, string, string, string];

  const [mag, plasma] = await Promise.all([
    fetchJson<RawMag[]>(
      `${NOAA_BASE}/products/solar-wind/mag-2-hour.json`,
      []
    ),
    fetchJson<RawPlasma[]>(
      `${NOAA_BASE}/products/solar-wind/plasma-2-hour.json`,
      []
    ),
  ]);

  const plasmaMap = new Map<string, RawPlasma>();
  for (const row of plasma.slice(2)) {
    plasmaMap.set(String(row[0]).slice(0, 16), row);
  }

  return mag.slice(2).map((row) => {
    const key = String(row[0]).slice(0, 16);
    const p = plasmaMap.get(key);
    return {
      time_tag: String(row[0]),
      bx: parseFloat(String(row[1])) || 0,
      by: parseFloat(String(row[2])) || 0,
      bz: parseFloat(String(row[3])) || 0,
      bt: parseFloat(String(row[6])) || 0,
      speed: p ? parseFloat(String(p[1])) || 0 : 0,
      density: p ? parseFloat(String(p[2])) || 0 : 0,
      temperature: p ? parseFloat(String(p[3])) || 0 : 0,
    };
  });
}

export async function fetchDst(): Promise<GeomagneticIndex[]> {
  type Raw = [string, string];
  const raw = await fetchJson<Raw[]>(
    `${NOAA_BASE}/json/geospace/dst_1m.json`,
    []
  );
  return raw.slice(-1440).map((r) => ({
    time_tag: String(r[0]),
    value: parseFloat(String(r[1])) || 0,
  }));
}

export async function fetchAe(): Promise<GeomagneticIndex[]> {
  type Raw = { time_tag: string; ae: number };
  const raw = await fetchJson<Raw[]>(
    `${NOAA_BASE}/json/geospace/geospace_1m.json`,
    []
  );
  return raw.slice(-1440).map((r) => ({
    time_tag: r.time_tag,
    value: r.ae || 0,
  }));
}

export async function fetchSymH(): Promise<GeomagneticIndex[]> {
  type Raw = { time_tag: string; sym_h: number };
  const raw = await fetchJson<Raw[]>(
    `${NOAA_BASE}/json/geospace/geospace_1m.json`,
    []
  );
  return raw.slice(-1440).map((r) => ({
    time_tag: r.time_tag,
    value: r.sym_h || 0,
  }));
}

export async function fetchAlerts(): Promise<NoaaAlert[]> {
  type Raw = { product_id: string; issue_datetime: string; message: string };
  const raw = await fetchJson<Raw[]>(
    `${NOAA_BASE}/products/alerts.json`,
    []
  );
  return raw.slice(0, 20).map((r) => ({
    productId: r.product_id || "",
    issueTime: r.issue_datetime || "",
    message: r.message || "",
    type: classifyAlert(r.product_id || ""),
  }));
}

function classifyAlert(productId: string): string {
  const id = productId.toUpperCase();
  if (id.includes("WATCH")) return "watch";
  if (id.includes("WARNING")) return "warning";
  if (id.includes("ALERT")) return "alert";
  if (id.includes("SUMMARY")) return "summary";
  return "info";
}

export async function fetchXrayFlux(): Promise<XrayFlux[]> {
  type Raw = [string, number, number];
  const raw = await fetchJson<Raw[]>(
    `${NOAA_BASE}/json/goes/primary/xrays-6-hour.json`,
    []
  );
  return raw.slice(-360).map((r) => ({
    time_tag: String(r[0]),
    flux: Number(r[1]) || 0,
    satellite: Number(r[2]) || 0,
  }));
}

export async function fetchSolarFlares(): Promise<SolarFlare[]> {
  type Raw = {
    begin_time: string;
    max_time: string;
    class_type: string;
    source_location: string;
    active_region_num: number | null;
  };
  const raw = await fetchJson<Raw[]>(
    `${NOAA_BASE}/json/goes/primary/solar-flares-latest.json`,
    []
  );
  return raw.slice(0, 10).map((r) => ({
    beginTime: r.begin_time,
    maxTime: r.max_time,
    classType: r.class_type,
    sourceLocation: r.source_location,
    activeRegionNum: r.active_region_num,
  }));
}

export async function fetchSunspotNumber(): Promise<number | null> {
  type Raw = { obsdate: string; ssn: number; smoothed_ssn: number };
  const raw = await fetchJson<Raw[]>(
    `${NOAA_BASE}/json/solar-cycle/observed-solar-cycle-indices.json`,
    []
  );
  if (raw.length === 0) return null;
  return raw[raw.length - 1].ssn;
}

export async function fetchWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloudcover,precipitation_probability&daily=sunrise,sunset&current_weather=true&forecast_days=1&timezone=auto`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function getKpColor(kp: number): string {
  if (kp >= 8) return "#ff2222";
  if (kp >= 6) return "#ff6600";
  if (kp >= 5) return "#ffaa00";
  if (kp >= 4) return "#ffdd00";
  if (kp >= 3) return "#88ff44";
  if (kp >= 2) return "#44ff88";
  return "#00ddff";
}

export function getKpLabel(kp: number): string {
  if (kp >= 8) return "Burza G4-G5";
  if (kp >= 7) return "Burza G3";
  if (kp >= 6) return "Burza G2";
  if (kp >= 5) return "Burza G1";
  if (kp >= 4) return "Aktywna";
  if (kp >= 3) return "Umiarkowana";
  if (kp >= 2) return "Słaba";
  return "Spokojna";
}

export function getBzColor(bz: number): string {
  if (bz <= -20) return "#ff2222";
  if (bz <= -10) return "#ff6600";
  if (bz <= -5) return "#ffaa00";
  if (bz < 0) return "#ffdd00";
  return "#44ff88";
}

export function estimateTransitTime(speed: number): string {
  if (!speed || speed <= 0) return "—";
  const distanceKm = 1.5e6;
  const minutes = Math.round(distanceKm / speed / 60);
  return `~${minutes} min`;
}

export function getFlareClass(flux: number): string {
  if (flux >= 1e-4) return "X";
  if (flux >= 1e-5) return "M";
  if (flux >= 1e-6) return "C";
  if (flux >= 1e-7) return "B";
  return "A";
}

export function getFlareColor(flux: number): string {
  if (flux >= 1e-4) return "#ff2222";
  if (flux >= 1e-5) return "#ff6600";
  if (flux >= 1e-6) return "#ffaa00";
  if (flux >= 1e-7) return "#44ff88";
  return "#00ddff";
}

export function getMoonPhase(date: Date): { name: string; emoji: string; illumination: number } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const c = Math.floor(year / 100);
  const y = year - 100 * c;
  const j = Math.floor((c - 15) / 2) + 202 - 11 * (y % 19);
  const l = 30 - (j % 30);
  const q = (day - l) % 30;
  const phase = Math.abs(q - 15) / 15;

  const illumination = Math.round((1 - phase) * 100);

  // Simple cycle based on days since known new moon
  const known = new Date(2000, 0, 6).getTime();
  const diff = date.getTime() - known;
  const cycle = 29.530588853;
  const daysSince = diff / (1000 * 60 * 60 * 24);
  const pos = ((daysSince % cycle) + cycle) % cycle;

  let name: string;
  let emoji: string;
  if (pos < 1) { name = "Nów"; emoji = "🌑"; }
  else if (pos < 7.4) { name = "Rosnący sierp"; emoji = "🌒"; }
  else if (pos < 8.4) { name = "Pierwsza kwadra"; emoji = "🌓"; }
  else if (pos < 14.8) { name = "Rosnący garbaty"; emoji = "🌔"; }
  else if (pos < 15.8) { name = "Pełnia"; emoji = "🌕"; }
  else if (pos < 22.1) { name = "Malejący garbaty"; emoji = "🌖"; }
  else if (pos < 23.1) { name = "Ostatnia kwadra"; emoji = "🌗"; }
  else { name = "Malejący sierp"; emoji = "🌘"; }

  return { name, emoji, illumination: Math.min(100, Math.max(0, illumination)) };
}

export function calculateObservingScore(params: {
  kp: number;
  cloudCover: number;
  isDark: boolean;
  moonIllumination: number;
  bz?: number;
  bt?: number;
  speed?: number;
}): number {
  const { kp, cloudCover, isDark, moonIllumination, bz = 0, bt = 0, speed = 0 } = params;
  if (!isDark) return 0;

  const kpScore = Math.min(kp / 9, 1) * 2.5;
  const cloudScore = (1 - cloudCover / 100) * 2.5;
  const moonScore = (1 - moonIllumination / 100) * 1.5;

  // IMF coupling: southward Bz + sufficient Bt and speed
  let imfScore = 0;
  if (bz < 0) {
    const bzFactor = Math.min(Math.abs(bz) / 15, 1);
    const btFactor = bt > 0 ? Math.min(bt / 15, 1) : 0.5;
    const speedFactor = speed > 0 ? Math.min(speed / 600, 1) : 0.3;
    imfScore = bzFactor * btFactor * speedFactor * 2.5;
  }

  return Math.round(Math.min(10, kpScore + cloudScore + moonScore + imfScore));
}
