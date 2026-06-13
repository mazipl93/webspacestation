"use client";

import { useEffect, useRef, useState } from "react";
import type { IssLiveTrack, OrbitSegment } from "@/lib/ops/iss-orbit-geo";
import type { OpsIssPosition } from "@/lib/ops/types";

const TRACK_URL = "/api/ops/iss-track";
const TRACK_INTERVAL_MS = 5_000;
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
  initialOrbit: OrbitSegment[] = [],
): {
  iss: OpsIssPosition | null;
  orbitPast: OrbitSegment[];
  orbitFuture: OrbitSegment[];
} {
  const [iss, setIss] = useState<OpsIssPosition | null>(initialIss);
  const [orbitPast, setOrbitPast] = useState<OrbitSegment[]>(initialOrbit);
  const [orbitFuture, setOrbitFuture] = useState<OrbitSegment[]>([]);
  const sgp4OkRef = useRef(false);

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
        setOrbitPast(data.orbitPast ?? []);
        setOrbitFuture(data.orbitFuture ?? []);
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

  return { iss, orbitPast, orbitFuture };
}
