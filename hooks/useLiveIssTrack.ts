"use client";

import { useEffect, useState } from "react";
import type { OpsIssPosition } from "@/lib/ops/types";

type OrbitSegment = { lat: number; lon: number }[];

const POSITION_URL = "https://api.wheretheiss.at/v1/satellites/25544";
const POSITIONS_URL =
  "https://api.wheretheiss.at/v1/satellites/25544/positions";
const POSITION_INTERVAL_MS = 4_000;
const ORBIT_REFRESH_MS = 45_000;

/** Offsety (min) względem „teraz" dla linii orbity — maks. 10 punktów (limit API). */
const ORBIT_OFFSETS_MIN = [-20, -15, -10, -5, 0, 5, 10, 15, 20, 25];

type RawIss = {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  velocity?: number;
  timestamp?: number;
};

function toIssPosition(d: RawIss): OpsIssPosition | null {
  if (typeof d.latitude !== "number" || typeof d.longitude !== "number") {
    return null;
  }
  return {
    latitude: d.latitude,
    longitude: d.longitude,
    timestamp: d.timestamp ?? Math.floor(Date.now() / 1000),
    altitudeKm:
      typeof d.altitude === "number" ? Math.round(d.altitude * 10) / 10 : undefined,
    velocityKmh:
      typeof d.velocity === "number" ? Math.round(d.velocity) : undefined,
  };
}

function unwrapLongitude(lon: number): number {
  let x = lon;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}

function buildSegments(points: { lat: number; lon: number }[]): OrbitSegment[] {
  const segments: OrbitSegment[] = [];
  let current: OrbitSegment = [];
  let prevLon: number | null = null;
  for (const p of points) {
    if (prevLon !== null && Math.abs(p.lon - prevLon) > 120) {
      if (current.length > 1) segments.push(current);
      current = [];
    }
    current.push(p);
    prevLon = p.lon;
  }
  if (current.length > 1) segments.push(current);
  return segments;
}

/**
 * Żywy tracker ISS — pozycja (co 4 s) i ground track (co 45 s) z api.wheretheiss.at.
 * Marker i linia pochodzą z tego samego propagatora, więc zawsze są zsynchronizowane.
 * W całości po stronie przeglądarki (działa lokalnie i na prodzie, bez crona).
 */
export function useLiveIssTrack(
  initialIss: OpsIssPosition | null,
  initialOrbit: OrbitSegment[] = [],
): { iss: OpsIssPosition | null; orbit: OrbitSegment[] } {
  const [iss, setIss] = useState<OpsIssPosition | null>(initialIss);
  const [orbit, setOrbit] = useState<OrbitSegment[]>(initialOrbit);

  useEffect(() => {
    let cancelled = false;

    const pollPosition = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch(POSITION_URL, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as RawIss;
        const next = toIssPosition(data);
        if (!cancelled && next) setIss(next);
      } catch {
        // sieć padła — zostaje ostatnia znana pozycja
      }
    };

    const pollOrbit = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const now = Math.floor(Date.now() / 1000);
        const timestamps = ORBIT_OFFSETS_MIN.map((m) => now + m * 60).join(",");
        const url = `${POSITIONS_URL}?timestamps=${timestamps}&units=kilometers`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const arr = (await res.json()) as RawIss[];
        if (!Array.isArray(arr)) return;
        const points = arr
          .filter(
            (p): p is RawIss & { latitude: number; longitude: number } =>
              typeof p.latitude === "number" && typeof p.longitude === "number",
          )
          .map((p) => ({ lat: p.latitude, lon: unwrapLongitude(p.longitude) }));
        const segments = buildSegments(points);
        if (!cancelled && segments.length > 0) setOrbit(segments);
      } catch {
        // zostaje ostatnia znana orbita
      }
    };

    pollPosition();
    pollOrbit();
    const posTimer = setInterval(pollPosition, POSITION_INTERVAL_MS);
    const orbitTimer = setInterval(pollOrbit, ORBIT_REFRESH_MS);

    const onVisibility = () => {
      if (document.hidden) return;
      pollPosition();
      pollOrbit();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(posTimer);
      clearInterval(orbitTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { iss, orbit };
}
