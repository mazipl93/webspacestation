import "server-only";

import { solarElevationDeg, ISS_VISIBLE_SUN_MAX_DEG } from "@/lib/ops/solar-elevation";
import { loadIssSatrec } from "@/lib/ops/iss-orbit";
import {
  POLAND_OBSERVER,
  type IssPassObservationKind,
  type IssPolandPass,
} from "@/lib/ops/iss-poland-passes.types";

export type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";
export { POLAND_BOUNDS, POLAND_OBSERVER } from "@/lib/ops/iss-poland-passes.types";

type SatRec = import("satellite.js").SatRec;
type SatelliteModule = typeof import("satellite.js");
type EciVec3 = import("satellite.js").EciVec3<number>;

/** Uproszczony model cienia Ziemi (cylindryczny). Zwraca true gdy ISS oświetlona. */
function isIssInSunlight(issEci: EciVec3, sunEci: [number, number, number]): boolean {
  const EARTH_RADIUS_KM = 6371;
  const sunDist = Math.sqrt(sunEci[0] ** 2 + sunEci[1] ** 2 + sunEci[2] ** 2);
  if (sunDist === 0) return true;
  const sunUnit: [number, number, number] = [
    sunEci[0] / sunDist,
    sunEci[1] / sunDist,
    sunEci[2] / sunDist,
  ];
  // Rzut ISS na oś Ziemia–Słońce
  const issDotSun =
    issEci.x * sunUnit[0] + issEci.y * sunUnit[1] + issEci.z * sunUnit[2];
  // ISS po stronie słońca — zawsze oświetlona
  if (issDotSun > 0) return true;
  // Perpendicular distance from shadow axis (km)
  const perpDist = Math.sqrt(
    (issEci.x - issDotSun * sunUnit[0]) ** 2 +
    (issEci.y - issDotSun * sunUnit[1]) ** 2 +
    (issEci.z - issDotSun * sunUnit[2]) ** 2,
  );
  return perpDist > EARTH_RADIUS_KM;
}

/**
 * Przybliżona pozycja Słońca w ECI (km) na podstawie daty.
 * Dokładność ±0.01 AU — wystarczająca do sprawdzenia cienia Ziemi.
 */
function sunPositionEci(time: Date): [number, number, number] {
  const AU_KM = 149_597_870.7;
  const jd = time.getTime() / 86_400_000 + 2440587.5;
  const n = jd - 2451545.0;
  const rad = Math.PI / 180;
  const meanAnomaly = (357.5291 + 0.98560028 * n) * rad;
  const meanLong = (280.459 + 0.98564736 * n) * rad;
  const eclLong =
    meanLong +
    (1.9148 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly)) * rad;
  const obliquity = (23.439 - 0.00000036 * n) * rad;
  const dist = (1.00014 - 0.01671 * Math.cos(meanAnomaly) - 0.00014 * Math.cos(2 * meanAnomaly)) * AU_KM;
  return [
    dist * Math.cos(eclLong),
    dist * Math.sin(eclLong) * Math.cos(obliquity),
    dist * Math.sin(eclLong) * Math.sin(obliquity),
  ];
}

function isAboveHorizon(
  satrec: SatRec,
  satellite: SatelliteModule,
  time: Date,
  obsLat: number,
  obsLon: number,
  minEl = 0,
): boolean {
  const el = elevationDeg(satrec, satellite, time, obsLat, obsLon);
  return el != null && el >= minEl;
}

function refineHorizonBoundary(
  satrec: SatRec,
  satellite: SatelliteModule,
  t0: number,
  t1: number,
  entering: boolean,
  obsLat: number,
  obsLon: number,
): number {
  let lo = t0;
  let hi = t1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const above = isAboveHorizon(satrec, satellite, new Date(mid), obsLat, obsLon);
    if (entering ? above : !above) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
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

function classifyObservation(
  maxEl: number,
  sunEl: number,
  issInSunlight: boolean,
): { visible: boolean; observationKind: IssPassObservationKind } {
  if (maxEl < 0) {
    return { visible: false, observationKind: "below" };
  }
  // Jasne niebo — przelot nieobserwowany wzrokowo
  if (sunEl >= ISS_VISIBLE_SUN_MAX_DEG) {
    return { visible: false, observationKind: "daylight" };
  }
  // Ciemne niebo (zmierzch nautyczny) — sprawdź elewację i oświetlenie ISS
  if (maxEl >= 10 && issInSunlight) {
    return { visible: true, observationKind: "visible" };
  }
  if (maxEl >= 10 && !issInSunlight) {
    // Dobra elewacja, ale ISS w cieniu Ziemi — nie widoczna gołym okiem
    return { visible: false, observationKind: "shadow" };
  }
  return { visible: false, observationKind: "low" };
}

function scanPassMetrics(
  satrec: SatRec,
  satellite: SatelliteModule,
  startMs: number,
  endMs: number,
  obs?: { lat: number; lon: number },
): {
  maxElevationDeg: number;
  azimuthDeg: number;
  maxAt: string;
  visible: boolean;
  observationKind: IssPassObservationKind;
} {
  const { lat, lon } = obs ?? POLAND_OBSERVER;
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

  const maxAtDate = new Date(maxAt);
  const sunEl = solarElevationDeg(maxAtDate, lat, lon);

  // Sprawdź czy ISS jest oświetlona w momencie maks. elewacji
  let issLit = true;
  const pvMax = satellite.propagate(satrec, maxAtDate);
  if (pvMax?.position && typeof pvMax.position !== "boolean") {
    const sunEci = sunPositionEci(maxAtDate);
    issLit = isIssInSunlight(pvMax.position, sunEci);
  }

  const { visible, observationKind } = classifyObservation(maxEl, sunEl, issLit);

  return {
    maxElevationDeg: Math.round(maxEl * 10) / 10,
    azimuthDeg: Math.round(azimuth),
    maxAt: maxAtDate.toISOString(),
    visible,
    observationKind,
  };
}

/**
 * Najbliższe przeloty ISS nad horyzontem obserwatora (SGP4 + elewacja słoneczna).
 * @param limit       Maks. liczba wyników
 * @param hoursAhead  Okno wyszukiwania w godzinach (domyślnie 72h; dla widocznych warto użyć 240h)
 * @param visibleOnly Zwróć tylko przeloty widoczne gołym okiem (visible=true)
 * @param observer    Lokalizacja obserwatora (domyślnie: środek Polski)
 */
export async function computeIssPolandPasses(
  limit = 4,
  hoursAhead = 72,
  visibleOnly = false,
  observer?: { lat: number; lon: number },
): Promise<IssPolandPass[]> {
  const loaded = await loadIssSatrec();
  if (!loaded) return [];

  const { satrec, satellite } = loaded;
  const { lat, lon } = observer ?? POLAND_OBSERVER;
  const now = Date.now();
  const end = now + hoursAhead * 3_600_000;
  const coarseStep = 45_000;

  const passes: IssPolandPass[] = [];
  let entryRough: number | null = null;
  let prevT = now;
  let prevAbove = isAboveHorizon(satrec, satellite, new Date(now), lat, lon);
  if (prevAbove) entryRough = now;

  for (let t = now + coarseStep; t <= end; t += coarseStep) {
    const currAbove = isAboveHorizon(satrec, satellite, new Date(t), lat, lon);

    if (!prevAbove && currAbove) {
      entryRough = refineHorizonBoundary(
        satrec,
        satellite,
        prevT,
        t,
        true,
        lat,
        lon,
      );
    } else if (prevAbove && !currAbove && entryRough != null) {
      const exitMs = refineHorizonBoundary(
        satrec,
        satellite,
        prevT,
        t,
        false,
        lat,
        lon,
      );
      const metrics = scanPassMetrics(
        satrec,
        satellite,
        entryRough,
        exitMs,
        { lat, lon },
      );
      passes.push({
        id: `pass-${Math.round(entryRough)}`,
        startAt: new Date(entryRough).toISOString(),
        endAt: new Date(exitMs).toISOString(),
        durationSec: Math.round((exitMs - entryRough) / 1000),
        ...metrics,
      });
      entryRough = null;
      if (passes.length >= limit) break;
    }

    prevAbove = currAbove;
    prevT = t;
  }

  const fresh = passes.filter((p) => new Date(p.endAt).getTime() > now);
  if (visibleOnly) return fresh.filter((p) => p.visible).slice(0, limit);
  return fresh.slice(0, limit);
}
