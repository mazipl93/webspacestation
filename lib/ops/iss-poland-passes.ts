import "server-only";

import { solarElevationDeg, ISS_VISIBLE_SUN_MAX_DEG } from "@/lib/ops/solar-elevation";
import { loadIssSatrec } from "@/lib/ops/iss-orbit";
import {
  POLAND_BOUNDS,
  POLAND_OBSERVER,
  type IssPassObservationKind,
  type IssPolandPass,
} from "@/lib/ops/iss-poland-passes.types";

export type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";
export { POLAND_BOUNDS, POLAND_OBSERVER } from "@/lib/ops/iss-poland-passes.types";

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

function classifyObservation(
  maxEl: number,
  sunEl: number,
): { visible: boolean; observationKind: IssPassObservationKind } {
  if (maxEl < 0) {
    return { visible: false, observationKind: "below" };
  }
  if (maxEl >= 15 && sunEl < ISS_VISIBLE_SUN_MAX_DEG) {
    return { visible: true, observationKind: "visible" };
  }
  if (sunEl >= ISS_VISIBLE_SUN_MAX_DEG) {
    return { visible: false, observationKind: "daylight" };
  }
  return { visible: false, observationKind: "low" };
}

function scanPassMetrics(
  satrec: SatRec,
  satellite: SatelliteModule,
  startMs: number,
  endMs: number,
): {
  maxElevationDeg: number;
  azimuthDeg: number;
  maxAt: string;
  visible: boolean;
  observationKind: IssPassObservationKind;
} {
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

  const sunEl = solarElevationDeg(new Date(maxAt), lat, lon);
  const { visible, observationKind } = classifyObservation(maxEl, sunEl);

  return {
    maxElevationDeg: Math.round(maxEl * 10) / 10,
    azimuthDeg: Math.round(azimuth),
    maxAt: new Date(maxAt).toISOString(),
    visible,
    observationKind,
  };
}

/** Najbliższe przeloty ISS nad Polską (ground track + elewacja z Warszawy). */
export async function computeIssPolandPasses(
  limit = 4,
  hoursAhead = 72,
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
