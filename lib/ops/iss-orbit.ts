import { fetchExternal } from "@/lib/ops/fetch-external";

const TLE_URL =
  "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE";

type OrbitPoint = { lat: number; lon: number };

function unwrapLongitude(lon: number): number {
  let x = lon;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}

/** Jedna linia orbity (bez skoków przez dateline). */
export type OrbitSegment = OrbitPoint[];

/** Ground track ISS z TLE Celestrak + SGP4 (jak w trackerach typu isstracker). */
export async function computeIssOrbitSegments(
  minutesBefore = 50,
  minutesAfter = 50,
  stepMinutes = 2
): Promise<OrbitSegment[]> {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetchExternal(TLE_URL, {
      next: { revalidate: 3600 },
    }, isDev ? 6_000 : 12_000);
    if (!res.ok) return [];
    const lines = (await res.text())
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 3) return [];

    const satellite = await import("satellite.js");
    const line1 = lines[1];
    const line2 = lines[2];
    const satrec = satellite.twoline2satrec(line1, line2);
    const now = Date.now();
    const segments: OrbitSegment[] = [];
    let current: OrbitPoint[] = [];
    let prevLon: number | null = null;

    const before = isDev ? 25 : minutesBefore;
    const after = isDev ? 25 : minutesAfter;
    const step = isDev ? 4 : stepMinutes;

    for (let m = -before; m <= after; m += step) {
      const time = new Date(now + m * 60_000);
      const pv = satellite.propagate(satrec, time);
      if (!pv || !pv.position || typeof pv.position === "boolean") continue;

      const gmst = satellite.gstime(time);
      const geo = satellite.eciToGeodetic(pv.position, gmst);
      const lat = satellite.degreesLat(geo.latitude);
      const lon = unwrapLongitude(satellite.degreesLong(geo.longitude));

      if (prevLon !== null && Math.abs(lon - prevLon) > 120) {
        if (current.length > 1) segments.push(current);
        current = [];
      }
      current.push({ lat, lon });
      prevLon = lon;
    }

    if (current.length > 1) segments.push(current);
    return segments;
  } catch {
    return [];
  }
}
