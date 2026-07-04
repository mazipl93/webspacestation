"use client";

import { useEffect, useRef, useState } from "react";
import type { GlobePoint } from "@/lib/ops/iss-globe-geo";
import type { IssLiveTrack, OrbitSegment } from "@/lib/ops/iss-orbit-geo";
import type { OpsIssPosition } from "@/lib/ops/types";

const TRACK_URL = "/api/ops/iss-track";
const TRACK_INTERVAL_MS = 5_000;
/** Geometria orbity rzadziej niż marker — stabilna linia bez migania. */
const ORBIT_GEOMETRY_REFRESH_MS = 120_000;
const FALLBACK_POSITION_URL =
  "https://api.wheretheiss.at/v1/satellites/25544";

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

/**
 * ISS live — gęsty ground track SGP4 (/api/ops/iss-track) + fallback pozycji wheretheiss.at.
 * Marker i linia z jednego propagatora, gdy API działa.
 */
export function useLiveIssTrack(
  initialIss: OpsIssPosition | null,
  initialOrbitPast: OrbitSegment[] = [],
  initialOrbitFuture: OrbitSegment[] = [],
  initialGlobePast: GlobePoint[] = [],
  initialGlobeFuture: GlobePoint[] = [],
): {
  iss: OpsIssPosition | null;
  orbitPast: OrbitSegment[];
  orbitFuture: OrbitSegment[];
  globePast: GlobePoint[];
  globeFuture: GlobePoint[];
} {
  const [iss, setIss] = useState<OpsIssPosition | null>(initialIss);
  const [orbitPast, setOrbitPast] = useState<OrbitSegment[]>(initialOrbitPast);
  const [orbitFuture, setOrbitFuture] =
    useState<OrbitSegment[]>(initialOrbitFuture);
  const [globePast, setGlobePast] = useState<GlobePoint[]>(initialGlobePast);
  const [globeFuture, setGlobeFuture] =
    useState<GlobePoint[]>(initialGlobeFuture);
  const sgp4OkRef = useRef(false);
  const lastOrbitRefreshRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const pollTrack = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch(TRACK_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("track unavailable");
        const data = (await res.json()) as IssLiveTrack;
        if (cancelled || !data?.iss) return;
        setIss(data.iss);

        const now = Date.now();
        const shouldRefreshOrbit =
          lastOrbitRefreshRef.current === 0
          || now - lastOrbitRefreshRef.current >= ORBIT_GEOMETRY_REFRESH_MS;

        if (shouldRefreshOrbit) {
          setOrbitPast(data.orbitPast ?? []);
          setOrbitFuture(data.orbitFuture ?? []);
          setGlobePast(data.globePast ?? []);
          setGlobeFuture(data.globeFuture ?? []);
          lastOrbitRefreshRef.current = now;
        }

        sgp4OkRef.current = true;
      } catch {
        sgp4OkRef.current = false;
      }
    };

    const pollFallbackPosition = async () => {
      if (sgp4OkRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch(FALLBACK_POSITION_URL, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as RawIss;
        const next = toIssPosition(data);
        if (!cancelled && next) setIss(next);
      } catch {
        // zostaje ostatnia znana pozycja
      }
    };

    pollTrack();
    pollFallbackPosition();
    const trackTimer = setInterval(pollTrack, TRACK_INTERVAL_MS);
    const fallbackTimer = setInterval(pollFallbackPosition, 4_000);

    const onVisibility = () => {
      if (document.hidden) return;
      pollTrack();
      pollFallbackPosition();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(trackTimer);
      clearInterval(fallbackTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { iss, orbitPast, orbitFuture, globePast, globeFuture };
}
