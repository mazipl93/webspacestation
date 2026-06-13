import type { OpsIssPosition } from "@/lib/ops/types";

export type OrbitPoint = { lat: number; lon: number };

/** Jedna linia orbity (bez skoków przez dateline). */
export type OrbitSegment = OrbitPoint[];

export type IssLiveTrack = {
  iss: OpsIssPosition;
  orbitPast: OrbitSegment[];
  orbitFuture: OrbitSegment[];
};

export function unwrapLongitude(lon: number): number {
  let x = lon;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}

/** Ciągła długość geograficzna (bez skoku ±360° między kolejnymi punktami). */
export function continuousLongitude(
  rawLon: number,
  prevLon: number | null,
): number {
  let lon = unwrapLongitude(rawLon);
  if (prevLon === null) return lon;
  while (lon - prevLon > 180) lon -= 360;
  while (lon - prevLon < -180) lon += 360;
  return lon;
}

/** Ta sama kopia świata co marker ISS (Leaflet world wrap). */
export function alignTrackToReference(
  points: OrbitPoint[],
  refLon: number,
): OrbitPoint[] {
  const ref = unwrapLongitude(refLon);
  return points.map((p) => {
    let lon = p.lon;
    while (lon - ref > 180) lon -= 360;
    while (lon - ref < -180) lon += 360;
    return { lat: p.lat, lon };
  });
}

/** Dzieli ground track na segmenty przy przekroczeniu antimeridianu (Leaflet-safe). */
export function splitOrbitAtDateline(points: OrbitPoint[]): OrbitSegment[] {
  if (points.length < 2) return [];

  const segments: OrbitSegment[] = [];
  let current: OrbitPoint[] = [points[0]!];

  for (let i = 1; i < points.length; i++) {
    const prev = current[current.length - 1]!;
    const next = points[i]!;
    const delta = next.lon - prev.lon;

    if (Math.abs(delta) > 180) {
      if (current.length > 1) segments.push(current);
      current = [next];
    } else {
      current.push(next);
    }
  }

  if (current.length > 1) segments.push(current);
  return segments;
}

export function finalizeOrbitSegments(
  points: OrbitPoint[],
  refLon: number,
): OrbitSegment[] {
  const aligned = alignTrackToReference(points, refLon);
  const segments = splitOrbitAtDateline(aligned);
  return segments.length > 0 ? segments : aligned.length > 1 ? [aligned] : [];
}
