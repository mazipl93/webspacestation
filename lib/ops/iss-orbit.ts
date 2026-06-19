import "server-only";

import { fetchExternal } from "@/lib/ops/fetch-external";
import {
  continuousLongitude,
  finalizeOrbitSegments,
  unwrapLongitude,
  type IssLiveTrack,
  type OrbitPoint,
  type OrbitSegment,
} from "@/lib/ops/iss-orbit-geo";
import type { OpsIssPosition } from "@/lib/ops/types";

export type { IssLiveTrack, OrbitPoint, OrbitSegment } from "@/lib/ops/iss-orbit-geo";

const TLE_URL =
  "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE";

const TLE_CACHE_MS = 3_600_000;

type SatRec = import("satellite.js").SatRec;
type SatelliteModule = typeof import("satellite.js");

let tleCache: { satrec: SatRec; satellite: SatelliteModule; at: number } | null =
  null;

/** ISO timestamp ostatniego pobrania TLE (wspólne dla mapy, orbity i przelotów). */
export function getIssTleCachedAt(): string | null {
  return tleCache ? new Date(tleCache.at).toISOString() : null;
}

export async function loadIssSatrec(): Promise<{
  satrec: SatRec;
  satellite: SatelliteModule;
} | null> {
  const now = Date.now();
  if (tleCache && now - tleCache.at < TLE_CACHE_MS) {
    return { satrec: tleCache.satrec, satellite: tleCache.satellite };
  }

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetchExternal(
      TLE_URL,
      { next: { revalidate: 3600 } },
      isDev ? 6_000 : 12_000,
    );
    if (!res.ok) {
      return tleCache
        ? { satrec: tleCache.satrec, satellite: tleCache.satellite }
        : null;
    }

    const lines = (await res.text())
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 3) return null;

    const satellite = await import("satellite.js");
    const satrec = satellite.twoline2satrec(lines[1]!, lines[2]!);
    tleCache = { satrec, satellite, at: now };
    return { satrec, satellite };
  } catch {
    return tleCache
      ? { satrec: tleCache.satrec, satellite: tleCache.satellite }
      : null;
  }
}

function propagatePoint(
  satrec: SatRec,
  satellite: SatelliteModule,
  time: Date,
  prevLon: number | null,
): OrbitPoint | null {
  const pv = satellite.propagate(satrec, time);
  if (!pv || !pv.position || typeof pv.position === "boolean") return null;

  const gmst = satellite.gstime(time);
  const geo = satellite.eciToGeodetic(pv.position, gmst);
  const rawLon = satellite.degreesLong(geo.longitude);
  return {
    lat: satellite.degreesLat(geo.latitude),
    lon: continuousLongitude(rawLon, prevLon),
  };
}

function propagateIss(
  satrec: SatRec,
  satellite: SatelliteModule,
  time: Date,
): OpsIssPosition | null {
  const pv = satellite.propagate(satrec, time);
  if (!pv || !pv.position || typeof pv.position === "boolean") return null;

  const gmst = satellite.gstime(time);
  const geo = satellite.eciToGeodetic(pv.position, gmst);
  const point = propagatePoint(satrec, satellite, time, null);
  if (!point) return null;

  let velocityKmh: number | undefined;
  if (pv.velocity && typeof pv.velocity !== "boolean") {
    const { x, y, z } = pv.velocity;
    velocityKmh = Math.round(Math.hypot(x, y, z) * 3600);
  }

  return {
    latitude: point.lat,
    longitude: unwrapLongitude(point.lon),
    timestamp: Math.floor(time.getTime() / 1000),
    altitudeKm:
      typeof geo.height === "number"
        ? Math.round(geo.height * 10) / 10
        : undefined,
    velocityKmh,
  };
}

type OrbitWindow = {
  minutesBefore?: number;
  minutesAfter?: number;
  stepSeconds?: number;
};

/** Ground track ISS z TLE Celestrak + SGP4 (tylko serwer). */
export async function computeIssOrbitSegments(
  minutesBefore = 52,
  minutesAfter = 52,
  stepSeconds = 45,
): Promise<OrbitSegment[]> {
  const track = await computeIssLiveTrack({
    minutesBefore,
    minutesAfter,
    stepSeconds,
  });
  if (!track) return [];
  return [...track.orbitPast, ...track.orbitFuture];
}

/** Pozycja + ground track z tego samego propagatora (marker leży na linii). */
export async function computeIssLiveTrack(
  window: OrbitWindow = {},
): Promise<IssLiveTrack | null> {
  const loaded = await loadIssSatrec();
  if (!loaded) return null;

  const { satrec, satellite } = loaded;
  const isDev = process.env.NODE_ENV === "development";
  const minutesBefore = window.minutesBefore ?? (isDev ? 40 : 52);
  const minutesAfter = window.minutesAfter ?? (isDev ? 40 : 52);
  const stepSeconds = window.stepSeconds ?? 45;
  const stepMs = stepSeconds * 1000;
  const now = Date.now();
  const nowDate = new Date(now);

  const iss = propagateIss(satrec, satellite, nowDate);
  if (!iss) return null;

  const start = now - minutesBefore * 60_000;
  const end = now + minutesAfter * 60_000;
  const allPoints: { point: OrbitPoint; t: number }[] = [];
  let prevLon: number | null = null;

  for (let t = start; t <= end; t += stepMs) {
    const p = propagatePoint(satrec, satellite, new Date(t), prevLon);
    if (!p) continue;
    allPoints.push({ point: p, t });
    prevLon = p.lon;
  }

  if (allPoints.length < 2) return null;

  let nowIdx = 0;
  let bestDt = Infinity;
  for (let i = 0; i < allPoints.length; i++) {
    const dt = Math.abs(allPoints[i]!.t - now);
    if (dt < bestDt) {
      bestDt = dt;
      nowIdx = i;
    }
  }

  const prevLonBeforeNow =
    nowIdx > 0 ? allPoints[nowIdx - 1]!.point.lon : null;
  const issPoint: OrbitPoint = {
    lat: iss.latitude,
    lon: continuousLongitude(iss.longitude, prevLonBeforeNow),
  };

  const pastPoints = [
    ...allPoints.slice(0, nowIdx).map((x) => x.point),
    issPoint,
  ];
  const futurePoints = [
    issPoint,
    ...allPoints.slice(nowIdx + 1).map((x) => x.point),
  ];

  return {
    iss,
    orbitPast: finalizeOrbitSegments(pastPoints, iss.longitude),
    orbitFuture: finalizeOrbitSegments(futurePoints, iss.longitude),
  };
}
