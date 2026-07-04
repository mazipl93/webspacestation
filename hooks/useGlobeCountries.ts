"use client";

import { useEffect, useState } from "react";
import {
  GLOBE_COUNTRIES_GEOJSON_URL,
  filterGlobeCountryFeatures,
  type GlobeCountryFeature,
} from "@/lib/ops/iss-globe-countries";

let cache: GlobeCountryFeature[] | null = null;
let pending: Promise<GlobeCountryFeature[]> | null = null;

async function loadGlobeCountries(): Promise<GlobeCountryFeature[]> {
  if (cache) return cache;
  if (!pending) {
    pending = fetch(GLOBE_COUNTRIES_GEOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error("countries geojson unavailable");
        return res.json() as Promise<{ features?: GlobeCountryFeature[] }>;
      })
      .then((data) => {
        cache = filterGlobeCountryFeatures(data.features ?? []);
        return cache;
      })
      .catch(() => {
        cache = [];
        return cache;
      });
  }
  return pending;
}

/** Granice państw — lazy load z cache modułowym (jeden fetch na sesję). */
export function useGlobeCountries(enabled: boolean): GlobeCountryFeature[] {
  const [features, setFeatures] = useState<GlobeCountryFeature[]>(() => cache ?? []);

  useEffect(() => {
    if (!enabled) return;
    if (cache?.length) {
      setFeatures(cache);
      return;
    }

    let cancelled = false;
    loadGlobeCountries().then((data) => {
      if (!cancelled) setFeatures(data);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return features;
}
