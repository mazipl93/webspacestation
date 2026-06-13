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
}): number {
  const { kp, cloudCover, isDark, moonIllumination } = params;
  if (!isDark) return 0;
  const kpScore = Math.min(kp / 9, 1) * 4;
  const cloudScore = (1 - cloudCover / 100) * 3;
  const moonScore = (1 - moonIllumination / 100) * 2;
  const darknessBonus = isDark ? 1 : 0;
  return Math.round(Math.min(10, kpScore + cloudScore + moonScore + darknessBonus));
}
