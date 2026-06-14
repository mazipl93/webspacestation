import { loadIssSatrec } from "@/lib/ops/iss-orbit";

/** Granice Polski (prostokąt) — wystarczające do przelotów ground track. */
export const POLAND_BOUNDS = {
  latMin: 49.0,
  latMax: 54.9,
  lonMin: 14.12,
  lonMax: 24.15,
} as const;

export const POLAND_OBSERVER = {
  city: "Warszawa",
  lat: 52.2297,
  lon: 21.0122,
} as const;

export type IssPolandPass = {
  id: string;
  /** ISO — wejście nad terytorium PL */
  startAt: string;
  /** ISO — wyjście z terytorium PL */
  endAt: string;
  durationSec: number;
  maxElevationDeg: number;
  /** Azymut przy maks. elewacji (°) */
  azimuthDeg: number;
  /** true = możliwa obserwacja (ciemno + elewacja ≥ 15°) */
  visible: boolean;
  /** ISO — moment maks. elewacji nad obserwatorem */
  maxAt: string;
};

type SatRec = import("satellite.js").SatRec;
type SatelliteModule = typeof import("satellite.js");

function isOverPoland(lat: number, lon: number): boolean {
  const { latMin, latMax, lonMin, lonMax } = POLAND_BOUNDS;
  return lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax;
}

function propagateLatLon(
  satrec: SatRec,
  satellite: SatelliteModule,
  time: Date,
): { lat: number; lon: number } | null {
  const pv = satellite.propagate(satrec, time);
  if (!pv?.position || typeof pv.position === "boolean") return null;
  const gmst = satellite.gstime(time);
  const geo = satellite.eciToGeodetic(pv.position, gmst);
  return {
    lat: satellite.degreesLat(geo.latitude),
    lon: satellite.degreesLong(geo.longitude),
  };
}

function elevationDeg(
  satrec: SatRec,
  satellite: SatelliteModule,
  time: Date,
  obsLat: number,
  obsLon: number,
): number | null {
  const pv = satellite.propagate(satrec, time);
  if (!pv?.position || typeof pv.position === "boolean") return null;
  const gmst = satellite.gstime(time);
  const posEcf = satellite.eciToEcf(pv.position, gmst);
  const observer = {
    latitude: satellite.degreesToRadians(obsLat),
    longitude: satellite.degreesToRadians(obsLon),
    height: 0.05,
  };
  const look = satellite.ecfToLookAngles(observer, posEcf);
  return satellite.radiansToDegrees(look.elevation);
}

/** Prosta elewacja Słońca — wystarczy do flagi „widoczny”. */
function sunElevationDeg(time: Date, lat: number, lon: number): number {
  const rad = Math.PI / 180;
  const d = (time.getTime() / 86_400_000 - 10957.5) * 2 * Math.PI;
  const decl = 0.4093 * Math.sin(d);
  const hour =
    time.getUTCHours() +
    time.getUTCMinutes() / 60 +
    lon / 15;
  const ha = (hour - 12) * 15 * rad;
  const latR = lat * rad;
  const sinAlt =
    Math.sin(latR) * Math.sin(decl) +
    Math.cos(latR) * Math.cos(decl) * Math.cos(ha);
  return Math.asin(Math.max(-1, Math.min(1, sinAlt))) / rad;
}

function refineBoundary(
  satrec: SatRec,
  satellite: SatelliteModule,
  t0: number,
  t1: number,
  entering: boolean,
): number {
  let lo = t0;
  let hi = t1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const pos = propagateLatLon(satrec, satellite, new Date(mid));
    const inside = pos ? isOverPoland(pos.lat, pos.lon) : false;
    if (entering ? inside : !inside) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

function scanPassMetrics(
  satrec: SatRec,
  satellite: SatelliteModule,
  startMs: number,
  endMs: number,
): { maxElevationDeg: number; azimuthDeg: number; maxAt: string; visible: boolean } {
  const { lat, lon } = POLAND_OBSERVER;
  let maxEl = -90;
  let maxAt = startMs;
  let azimuth = 0;

  for (let t = startMs; t <= endMs; t += 5_000) {
    const el = elevationDeg(satrec, satellite, new Date(t), lat, lon);
    if (el == null) continue;
    if (el > maxEl) {
      maxEl = el;
      maxAt = t;
      const pv = satellite.propagate(satrec, new Date(t));
      if (pv?.position && typeof pv.position !== "boolean") {
        const gmst = satellite.gstime(new Date(t));
        const posEcf = satellite.eciToEcf(pv.position, gmst);
        const observer = {
          latitude: satellite.degreesToRadians(lat),
          longitude: satellite.degreesToRadians(lon),
          height: 0.05,
        };
        const look = satellite.ecfToLookAngles(observer, posEcf);
        azimuth = ((satellite.radiansToDegrees(look.azimuth) % 360) + 360) % 360;
      }
    }
  }

  const sunEl = sunElevationDeg(new Date(maxAt), lat, lon);
  const visible = maxEl >= 15 && sunEl < -4;

  return {
    maxElevationDeg: Math.round(maxEl * 10) / 10,
    azimuthDeg: Math.round(azimuth),
    maxAt: new Date(maxAt).toISOString(),
    visible,
  };
}

/** Najbliższe przeloty ISS nad Polską (ground track + elewacja z Warszawy). */
export async function computeIssPolandPasses(
  limit = 4,
  hoursAhead = 48,
): Promise<IssPolandPass[]> {
  const loaded = await loadIssSatrec();
  if (!loaded) return [];

  const { satrec, satellite } = loaded;
  const now = Date.now();
  const end = now + hoursAhead * 3_600_000;
  const coarseStep = 45_000;

  const passes: IssPolandPass[] = [];
  let inside = false;
  let entryRough: number | null = null;
  let prevT = now;
  let prevInside = false;

  const init = propagateLatLon(satrec, satellite, new Date(now));
  if (init) {
    prevInside = isOverPoland(init.lat, init.lon);
    inside = prevInside;
    if (inside) entryRough = now;
  }

  for (let t = now + coarseStep; t <= end; t += coarseStep) {
    const pos = propagateLatLon(satrec, satellite, new Date(t));
    if (!pos) continue;
    const currInside = isOverPoland(pos.lat, pos.lon);

    if (!prevInside && currInside) {
      entryRough = refineBoundary(satrec, satellite, prevT, t, true);
      inside = true;
    } else if (prevInside && !currInside && entryRough != null) {
      const exitMs = refineBoundary(satrec, satellite, prevT, t, false);
      const metrics = scanPassMetrics(satrec, satellite, entryRough, exitMs);
      passes.push({
        id: `pass-${Math.round(entryRough)}`,
        startAt: new Date(entryRough).toISOString(),
        endAt: new Date(exitMs).toISOString(),
        durationSec: Math.round((exitMs - entryRough) / 1000),
        ...metrics,
      });
      inside = false;
      entryRough = null;
      if (passes.length >= limit) break;
    }

    prevInside = currInside;
    prevT = t;
  }

  return passes.filter((p) => new Date(p.endAt).getTime() > now).slice(0, limit);
}
