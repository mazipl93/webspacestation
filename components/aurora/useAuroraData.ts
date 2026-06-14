"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  KpData,
  SolarWindData,
  GeomagneticIndex,
  NoaaAlert,
  KpForecast,
  XrayFlux,
  SolarFlare,
  SolarRegion,
} from "@/lib/aurora/api";
import { parseRtswSolarWind } from "@/lib/aurora/rtsw";

export interface AuroraFetchDiag {
  key: string;
  url: string;
  status: number | "error";
  ms: number;
  length: number;
  dataRows: number;
  sample: string;
  error?: string;
}

export interface AuroraState {
  kpCurrent: KpData[];     // 1-minute Kp, last 120 points
  kp3Day: KpData[];        // 3-hour Kp, last ~7 days
  kpForecast: KpForecast[]; // 3-hour Kp forecast
  solarWind: SolarWindData[];
  dst: GeomagneticIndex[];
  ae: GeomagneticIndex[];
  symh: GeomagneticIndex[];
  alerts: NoaaAlert[];
  xrayFlux: XrayFlux[];
  solarFlares: SolarFlare[];
  sunspotNumber: number | null;
  solarRegions: SolarRegion[];
  lastUpdate: Date | null;
  loading: boolean;
  errors: Partial<Record<string, string>>;
  /** Populated only in development — per-endpoint fetch diagnostics */
  diagnostics: AuroraFetchDiag[];
}

const initialState: AuroraState = {
  kpCurrent: [],
  kp3Day: [],
  kpForecast: [],
  solarWind: [],
  dst: [],
  ae: [],
  symh: [],
  alerts: [],
  xrayFlux: [],
  solarFlares: [],
  sunspotNumber: null,
  solarRegions: [],
  lastUpdate: null,
  loading: true,
  errors: {},
  diagnostics: [],
};

function isAuroraDebug(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (typeof window === "undefined") return false;
  return (
    new URLSearchParams(window.location.search).has("aurora-debug") ||
    window.localStorage.getItem("aurora-debug") === "1"
  );
}

function samplePayload(data: unknown): string {
  if (Array.isArray(data)) {
    const dataRows = Math.max(0, data.length - (Array.isArray(data[0]) ? 1 : 0));
    const row = data.length > 1 ? data[1] : data[0];
    return JSON.stringify({ arrayLen: data.length, dataRows, sample: row }).slice(0, 160);
  }
  return JSON.stringify(data).slice(0, 160);
}

function countDataRows(data: unknown): number {
  if (!Array.isArray(data)) return 0;
  if (data.length === 0) return 0;
  if (Array.isArray(data[0])) return Math.max(0, data.length - 1);
  return data.length;
}

const FETCH_TIMEOUT_MS = 10_000;
const RETRY_BACKOFF_MS = 600;

async function fetchWithRetry<T>(
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
    await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS));
  }
  return fallback;
}

async function diagFetch<T>(
  key: string,
  url: string,
  fallback: T,
  signal?: AbortSignal,
): Promise<{ data: T; diag: AuroraFetchDiag | null }> {
  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: signal ?? AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const ms = Math.round(performance.now() - t0);
    if (!res.ok) {
      const diag: AuroraFetchDiag = {
        key,
        url,
        status: res.status,
        ms,
        length: 0,
        dataRows: 0,
        sample: `HTTP ${res.status}`,
        error: `HTTP ${res.status}`,
      };
      console.warn("[aurora-diag]", diag);
      return { data: fallback, diag };
    }
    const data = (await res.json()) as T;
    const length = Array.isArray(data) ? data.length : 0;
    const dataRows = countDataRows(data);
    const diag: AuroraFetchDiag = {
      key,
      url,
      status: res.status,
      ms,
      length,
      dataRows,
      sample: samplePayload(data),
      ...(dataRows === 0 && length > 0 ? { error: "empty payload (header only?)" } : {}),
    };
    const level = diag.error ? "warn" : "log";
    console[level]("[aurora-diag]", diag);
    return { data, diag };
  } catch (err) {
    const ms = Math.round(performance.now() - t0);
    const message = err instanceof Error ? err.message : String(err);
    if (signal?.aborted || message.includes("abort")) {
      return { data: fallback, diag: null };
    }
    const diag: AuroraFetchDiag = {
      key,
      url,
      status: "error",
      ms,
      length: 0,
      dataRows: 0,
      sample: message,
      error: message,
    };
    console.warn("[aurora-diag]", diag);
    return { data: fallback, diag };
  }
}

async function safeFetch<T>(url: string, fallback: T, signal?: AbortSignal): Promise<T> {
  return fetchWithRetry(url, fallback, signal);
}

// ──────────────────────────────────────────────
// NOAA API known real formats (verified):
//
// products/noaa-planetary-k-index.json
//   → [{time_tag:"2026-06-06T00:00:00", Kp:4.33, a_running:32, station_count:8}, ...]
//
// json/planetary_k_index_1m.json
//   → [{time_tag:"2026-06-12T18:47:00", kp_index:1, estimated_kp:1.33, kp:"1P"}, ...]
//
// products/noaa-planetary-k-index-forecast.json
//   → [{time_tag:"2026-06-13T00:00:00", kp:3.33, observed:"estimated", noaa_scale:null}, ...]
//
// products/solar-wind/mag-2-hour.json  — DEPRECATED (Apr 2026), header-only
// products/solar-wind/plasma-2-hour.json — DEPRECATED (Apr 2026), header-only
// Replacement (SCN 26-21):
// json/rtsw/rtsw_mag_1m.json
//   → [{time_tag, active, source, bx_gsm, by_gsm, bz_gsm, bt, ...}, ...]
// json/rtsw/rtsw_wind_1m.json
//   → [{time_tag, active, source, proton_density, proton_speed, proton_temperature, ...}, ...]
// products/alerts.json
//   → [{product_id:"...", issue_datetime:"...", message:"..."}, ...]
//
// json/goes/primary/xrays-6-hour.json
//   → [["time_tag","flux","satellite"], ["2026-06-13 00:00:00.000","1.2e-8","18"], ...]
//
// json/goes/primary/solar-flares-latest.json
//   → [{begin_time:"...", max_time:"...", class_type:"B3.8", ...}, ...]
//
// json/solar-cycle/observed-solar-cycle-indices.json
//   → [{obsdate:"2026-05-01",ssn:120,...}, ...]
// ──────────────────────────────────────────────

// Normalize space-separated time "2026-06-12 22:48:00.000" → ISO string
function normTime(t: string | undefined | null): string {
  if (!t) return "";
  if (t.includes("T")) return t;
  return t.replace(" ", "T").replace(".000", "") + "Z";
}

type XrayRow = [string, string, string];

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

// Kp 3-day (objects)
type Kp3DayItem = { time_tag: string; Kp: number; a_running: number; station_count: number };
// Kp 1-min (objects)
type Kp1mItem = { time_tag: string; kp_index: number; estimated_kp: number; kp: string };
// Kp forecast (objects)
type KpFcItem = { time_tag: string; kp: number; observed: string; noaa_scale: string | null };
// Alerts
type AlertItem = { product_id: string; issue_datetime: string; message: string };
// Flare
type FlareItem = {
  begin_time: string; max_time: string; class_type: string;
  source_location: string; active_region_num: number | null;
};
// SSN
type SsnItem = { obsdate: string; ssn: number };

// DST 1-hour realtime + 7-day history
type DstItem = { time_tag: string; dst: number };

// Solar regions
type SolarRegionItem = {
  region: number | string;
  latitude: number;
  longitude: number;
  mag_class: string;
  num_spots: number;
  area: number;
  first_date: string;
  last_date: string;
};

export function useAuroraData() {
  const [state, setState] = useState<AuroraState>(initialState);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);
  const fetchGenerationRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async (opts?: { userInitiated?: boolean }) => {
    if (opts?.userInitiated) setRefreshing(true);
    try {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const generation = ++fetchGenerationRef.current;
    const { signal } = controller;

    const endpoints = [
      { key: "kp1m", url: "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json" },
      { key: "kp3d", url: "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json" },
      { key: "kpFc", url: "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json" },
      { key: "swMag", url: "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json" },
      { key: "swPlasma", url: "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json" },
      { key: "dst", url: "https://services.swpc.noaa.gov/json/geospace/geospace_dst_7_day.json" },
      { key: "alerts", url: "https://services.swpc.noaa.gov/products/alerts.json" },
      { key: "xray", url: "https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json" },
      { key: "flares", url: "https://services.swpc.noaa.gov/json/goes/primary/solar-flares-latest.json" },
      { key: "ssn", url: "https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json" },
      { key: "regions", url: "https://services.swpc.noaa.gov/json/solar_regions.json" },
    ] as const;

    const debug = isAuroraDebug();
    const results = await Promise.all(
      endpoints.map(async ({ key, url }) => {
        if (debug) {
          const r = await diagFetch<unknown>(key, url, [], signal);
          if (r.diag === null) return { data: r.data, diag: null };
          return r;
        }
        const data = await safeFetch<unknown>(url, [], signal);
        return { data, diag: null };
      }),
    );

    if (generation !== fetchGenerationRef.current || !mountedRef.current || signal.aborted) {
      return;
    }

    const diagByKey = Object.fromEntries(
      results.map((r, i) => [endpoints[i].key, r.diag]),
    ) as Record<(typeof endpoints)[number]["key"], AuroraFetchDiag | null>;

    const diagnostics = results
      .map((r) => r.diag)
      .filter((d): d is AuroraFetchDiag => d !== null);

    const kp1m = results[0].data as Kp1mItem[];
    const kp3d = results[1].data as Kp3DayItem[];
    const kpFc = results[2].data as KpFcItem[];
    const swMag = results[3].data as RtswMagItem[];
    const swPlasma = results[4].data as RtswWindItem[];
    const dstRaw = results[5].data as DstItem[];
    const alerts = results[6].data as AlertItem[];
    const xray = results[7].data as XrayRow[];
    const flares = results[8].data as FlareItem[];
    const ssn = results[9].data as SsnItem[];
    const solarRegionsRaw = results[10].data as SolarRegionItem[];

    const fetchErrors: Partial<Record<string, string>> = {};
    for (const d of diagnostics) {
      if (d.error) fetchErrors[d.key] = d.error;
    }

    if (debug) {
      const parsedCounts = {
        kpCurrent: kp1m.length,
        kp3Day: kp3d.length,
        solarWindMagRows: swMag.filter((r) => r.active).length,
        solarWindPlasmaRows: swPlasma.filter((r) => r.active).length,
        dst: dstRaw.length,
        regions: solarRegionsRaw.length,
      };
      console.log("[aurora-diag] parsed counts", parsedCounts, "endpoint diags", diagByKey);
    }

    // ── Kp 1-minute (current gauge + 24h chart)
    const kpCurrentParsed: KpData[] = kp1m.slice(-120).map((r) => ({
      time: r.time_tag,
      kp: r.estimated_kp ?? r.kp_index ?? 0,
      observed: r.kp || "observed",
    }));

    // ── Kp 3-day (72h history chart)
    const kp3DayParsed: KpData[] = kp3d.map((r) => ({
      time: r.time_tag,
      kp: r.Kp ?? 0,
      observed: "observed",
    }));

    // ── Kp forecast (array of objects)
    const kpForecastParsed: KpForecast[] = kpFc.slice(-24).map((r) => ({
      time: r.time_tag,
      kp: r.kp ?? 0,
      observed: r.observed ?? "forecast",
    }));

    // ── Solar wind (RTSW 1-min, active spacecraft only — SCN 26-21)
    const solarWindParsed = parseRtswSolarWind(swMag, swPlasma);
    const dstParsed: GeomagneticIndex[] = dstRaw.map((r) => ({
      time_tag: r.time_tag,
      value: r.dst ?? 0,
    }));
    // SYM-H: use DST as proxy (highly correlated on 1h timescale)
    const symhParsed: GeomagneticIndex[] = dstParsed;
    // AE: no reliable public 1-min endpoint available
    const aeParsed: GeomagneticIndex[] = [];

    // ── Alerts
    const alertsParsed: NoaaAlert[] = alerts.slice(0, 15).map((r) => {
      const id = (r.product_id || "").toUpperCase();
      let type = "info";
      if (id.includes("WATCH")) type = "watch";
      else if (id.includes("WARNING")) type = "warning";
      else if (id.includes("ALERT")) type = "alert";
      else if (id.includes("SUMMARY")) type = "summary";
      return {
        productId: r.product_id || "",
        issueTime: r.issue_datetime || "",
        message: r.message || "",
        type,
      };
    });

    // ── X-ray flux (array of arrays, row[0]=header)
    const xrayParsed: XrayFlux[] = xray.slice(1).map((r) => ({
      time_tag: normTime(r[0]),
      flux: parseFloat(r[1]) || 0,
      satellite: parseInt(r[2]) || 0,
    }));

    // ── Solar flares
    const flaresParsed: SolarFlare[] = flares.slice(0, 10).map((r) => ({
      beginTime: r.begin_time,
      maxTime: r.max_time,
      classType: r.class_type,
      sourceLocation: r.source_location,
      activeRegionNum: r.active_region_num,
    }));

    // ── Sunspot number
    const ssnValue = ssn.length > 0 ? ssn[ssn.length - 1].ssn : null;

    // ── Solar active regions
    const solarRegionsParsed: SolarRegion[] = solarRegionsRaw.map((r) => ({
      region: String(r.region),
      latitude: r.latitude ?? 0,
      longitude: r.longitude ?? 0,
      mag_class: r.mag_class ?? "unknown",
      num_spots: r.num_spots ?? 0,
      area: r.area ?? 0,
      first_date: r.first_date ?? "",
      last_date: r.last_date ?? "",
    }));

    setState((prev) => {
      const mergedErrors = { ...prev.errors };
      for (const d of diagnostics) {
        if (d.error) mergedErrors[d.key] = d.error;
        else delete mergedErrors[d.key];
      }

      return {
        kpCurrent: kpCurrentParsed.length > 0 ? kpCurrentParsed : prev.kpCurrent,
        kp3Day: kp3DayParsed.length > 0 ? kp3DayParsed : prev.kp3Day,
        kpForecast: kpForecastParsed.length > 0 ? kpForecastParsed : prev.kpForecast,
        solarWind: solarWindParsed.length > 0 ? solarWindParsed : prev.solarWind,
        dst: dstParsed.length > 0 ? dstParsed : prev.dst,
        ae: aeParsed,
        symh: symhParsed.length > 0 ? symhParsed : prev.symh,
        alerts: alertsParsed.length > 0 ? alertsParsed : prev.alerts,
        xrayFlux: xrayParsed.length > 0 ? xrayParsed : prev.xrayFlux,
        solarFlares: flaresParsed.length > 0 ? flaresParsed : prev.solarFlares,
        sunspotNumber: ssnValue ?? prev.sunspotNumber,
        solarRegions: solarRegionsParsed.length > 0 ? solarRegionsParsed : prev.solarRegions,
        lastUpdate: new Date(),
        loading: false,
        errors: mergedErrors,
        diagnostics: debug ? diagnostics : prev.diagnostics,
      };
    });

    if (debug && (solarWindParsed.length === 0 || Object.keys(fetchErrors).length > 0)) {
      console.warn("[aurora-diag] empty or partial state after fetch", {
        solarWindPoints: solarWindParsed.length,
        fetchErrors,
        swMagActive: swMag.filter((r) => r.active).length,
        swPlasmaActive: swPlasma.filter((r) => r.active).length,
      });
    }
    } finally {
      if (opts?.userInitiated && mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void fetchAll();

    // Solar wind: 60s, Kp updates every few minutes but we check at 60s
    const interval = setInterval(() => void fetchAll(), 60_000);

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      clearInterval(interval);
    };
  }, [fetchAll]);

  const refetch = useCallback(() => fetchAll({ userInitiated: true }), [fetchAll]);

  return { state, refetch, refreshing };
}
