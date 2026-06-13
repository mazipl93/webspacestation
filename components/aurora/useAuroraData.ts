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
} from "@/lib/aurora/api";

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
  lastUpdate: Date | null;
  loading: boolean;
  errors: Partial<Record<string, string>>;
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
  lastUpdate: null,
  loading: true,
  errors: {},
};

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
// products/solar-wind/mag-2-hour.json
//   → [["time_tag","bx_gsm","by_gsm","bz_gsm","lon_gsm","lat_gsm","bt"], ["2026-06-12 22:48:00.000","2.03",...]...]
//
// products/solar-wind/plasma-2-hour.json
//   → [["time_tag","density","speed","temperature"], ["2026-06-12 22:48:00.000","3.5","450","80000"], ...]
//
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

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// Normalize space-separated time "2026-06-12 22:48:00.000" → ISO string
function normTime(t: string | undefined | null): string {
  if (!t) return "";
  if (t.includes("T")) return t;
  return t.replace(" ", "T").replace(".000", "") + "Z";
}

type MagRow = [string, string, string, string, string, string, string];
type PlasmaRow = [string, string, string, string];
type XrayRow = [string, string, string];

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

export function useAuroraData() {
  const [state, setState] = useState<AuroraState>(initialState);
  const mountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    const [kp1m, kp3d, kpFc, swMag, swPlasma, dstRaw, alerts, xray, flares, ssn] =
      await Promise.all([
        safeFetch<Kp1mItem[]>("https://services.swpc.noaa.gov/json/planetary_k_index_1m.json", []),
        safeFetch<Kp3DayItem[]>("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json", []),
        safeFetch<KpFcItem[]>("https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json", []),
        safeFetch<MagRow[]>("https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json", []),
        safeFetch<PlasmaRow[]>("https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json", []),
        safeFetch<DstItem[]>("https://services.swpc.noaa.gov/json/geospace/geospace_dst_7_day.json", []),
        safeFetch<AlertItem[]>("https://services.swpc.noaa.gov/products/alerts.json", []),
        safeFetch<XrayRow[]>("https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json", []),
        safeFetch<FlareItem[]>("https://services.swpc.noaa.gov/json/goes/primary/solar-flares-latest.json", []),
        safeFetch<SsnItem[]>("https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json", []),
      ]);

    if (!mountedRef.current) return;

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

    // ── Solar wind mag (array of arrays, row[0]=header)
    const plasmaMap = new Map<string, PlasmaRow>();
    for (const row of swPlasma.slice(1)) {
      if (typeof row[0] === "string") plasmaMap.set(row[0].slice(0, 16), row);
    }
    const solarWindParsed: SolarWindData[] = swMag.slice(1).map((row) => {
      const key = typeof row[0] === "string" ? row[0].slice(0, 16) : "";
      const p = plasmaMap.get(key);
      return {
        time_tag: normTime(row[0]),
        bx: parseFloat(row[1]) || 0,
        by: parseFloat(row[2]) || 0,
        bz: parseFloat(row[3]) || 0,
        bt: parseFloat(row[6]) || 0,
        speed: p ? parseFloat(p[2]) || 0 : 0,
        density: p ? parseFloat(p[1]) || 0 : 0,
        temperature: p ? parseFloat(p[3]) || 0 : 0,
      };
    });

    // ── DST from geospace_dst_7_day (objects: {time_tag, dst})
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

    setState({
      kpCurrent: kpCurrentParsed,
      kp3Day: kp3DayParsed,
      kpForecast: kpForecastParsed,
      solarWind: solarWindParsed,
      dst: dstParsed,
      ae: aeParsed,
      symh: symhParsed,
      alerts: alertsParsed,
      xrayFlux: xrayParsed,
      solarFlares: flaresParsed,
      sunspotNumber: ssnValue,
      lastUpdate: new Date(),
      loading: false,
      errors: {},
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();

    // Solar wind: 60s, Kp updates every few minutes but we check at 60s
    const interval = setInterval(fetchAll, 60_000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchAll]);

  return { state, refetch: fetchAll };
}
