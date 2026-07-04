import { unwrapLongitude, type OrbitPoint } from "@/lib/ops/iss-orbit-geo";
import type { OpsIssPosition } from "@/lib/ops/types";

/** Promień Ziemi — spójny z satellite.js geodetic height. */
export const EARTH_RADIUS_KM = 6371;

/** Wysokość w jednostkach promienia globusa (0 = powierzchnia). */
export type GlobePoint = { lat: number; lng: number; alt: number };

export function kmToGlobeAlt(altKm: number): number {
  return altKm / EARTH_RADIUS_KM;
}

export function issToGlobePoint(iss: OpsIssPosition): GlobePoint {
  return {
    lat: iss.latitude,
    lng: iss.longitude,
    alt: kmToGlobeAlt(iss.altitudeKm ?? 408),
  };
}

export function orbitPointsToGlobePath(points: OrbitPoint[]): GlobePoint[] {
  return points.map((p) => ({
    lat: p.lat,
    lng: unwrapLongitude(p.lon),
    alt: kmToGlobeAlt(p.altKm ?? 408),
  }));
}

export function surfaceShadowPath(points: GlobePoint[]): GlobePoint[] {
  return points.map((p) => ({ lat: p.lat, lng: p.lng, alt: 0.004 }));
}

/** Rzadsze punkty orbity — mniejszy koszt WebGL (mobile). */
export function decimateGlobePath(points: GlobePoint[], step: number): GlobePoint[] {
  if (step <= 1 || points.length < 3) return points;

  const out: GlobePoint[] = [];
  for (let i = 0; i < points.length; i++) {
    if (i === 0 || i === points.length - 1 || i % step === 0) {
      out.push(points[i]!);
    }
  }
  return out;
}

/** Past + future z tego samego propagatora → jedna ciągła linia (bez migania przy odświeżeniu). */
export function mergeGlobeOrbitPaths(
  past: GlobePoint[],
  future: GlobePoint[],
): GlobePoint[] {
  if (past.length === 0) return future;
  if (future.length === 0) return past;
  if (past.length === 1) return [...past, ...future.slice(1)];

  const lastPast = past[past.length - 1]!;
  const firstFuture = future[0]!;
  const sameJunction =
    Math.abs(lastPast.lat - firstFuture.lat) < 0.05 &&
    Math.abs(lastPast.lng - firstFuture.lng) < 0.05;

  return sameJunction ? [...past, ...future.slice(1)] : [...past, ...future];
}

/** Okrąg strefy widoczności na powierzchni globusa (zamknięta polyline). */
export function globeVisibilityCircle(
  centerLat: number,
  centerLng: number,
  radiusDeg: number,
  segments = 72,
  surfaceAlt = 0.004,
): GlobePoint[] {
  const points: GlobePoint[] = [];
  for (let i = 0; i <= segments; i++) {
    const bearing = (i / segments) * 360;
    const dest = destinationOnSphere(centerLat, centerLng, bearing, radiusDeg);
    points.push({ lat: dest.lat, lng: dest.lng, alt: surfaceAlt });
  }
  return points;
}

function destinationOnSphere(
  latDeg: number,
  lngDeg: number,
  bearingDeg: number,
  distanceDeg: number,
): { lat: number; lng: number } {
  const φ1 = (latDeg * Math.PI) / 180;
  const λ1 = (lngDeg * Math.PI) / 180;
  const θ = (bearingDeg * Math.PI) / 180;
  const δ = (distanceDeg * Math.PI) / 180;

  const sinφ1 = Math.sin(φ1);
  const cosφ1 = Math.cos(φ1);
  const sinδ = Math.sin(δ);
  const cosδ = Math.cos(δ);

  const φ2 = Math.asin(sinφ1 * cosδ + cosφ1 * sinδ * Math.cos(θ));
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * sinδ * cosφ1,
      cosδ - sinφ1 * Math.sin(φ2),
    );

  const lat = (φ2 * 180) / Math.PI;
  let lng = (λ2 * 180) / Math.PI;
  lng = ((lng + 540) % 360) - 180;
  return { lat, lng };
}
