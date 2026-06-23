import "server-only";

import { POLAND_OBSERVER } from "@/lib/ops/iss-poland-passes.types";
import type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";

const ISS_NORAD_ID = 25544;
const N2YO_BASE = "https://api.n2yo.com/rest/v1/satellite";

/** N2YO visual passes raw response */
interface N2yoVisualPass {
  startAz: number;
  startAzCompass: string;
  startEl: number;
  startUTC: number; // Unix timestamp
  maxAz: number;
  maxAzCompass: string;
  maxEl: number;
  maxUTC: number;
  endAz: number;
  endAzCompass: string;
  endEl: number;
  endUTC: number;
  mag: number;
  duration: number; // seconds
}

interface N2yoResponse {
  info?: { satid: number; satname: string; transactionscount: number };
  passes?: N2yoVisualPass[];
  error?: string;
}

function n2yoPassToPolandPass(p: N2yoVisualPass, idx: number): IssPolandPass {
  return {
    id: `n2yo-${p.startUTC}-${idx}`,
    startAt: new Date(p.startUTC * 1000).toISOString(),
    endAt: new Date(p.endUTC * 1000).toISOString(),
    durationSec: p.duration,
    maxElevationDeg: p.maxEl,
    azimuthDeg: p.maxAz,
    maxAt: new Date(p.maxUTC * 1000).toISOString(),
    visible: true,
    observationKind: "visible",
  };
}

/**
 * Fetches ONLY visually observable ISS passes from N2YO API.
 * N2YO filters by: ISS in sunlight + observer in darkness + min elevation.
 * Requires N2YO_API_KEY env variable (free registration at n2yo.com).
 *
 * @returns passes array, or null if key not set / request fails
 */
export async function fetchN2yoVisualPasses(
  limit = 8,
  days = 10,
  minElevationDeg = 10,
  observer?: { lat: number; lon: number },
): Promise<IssPolandPass[] | null> {
  const apiKey = process.env.N2YO_API_KEY;
  if (!apiKey) return null;

  const { lat, lon } = observer ?? POLAND_OBSERVER;
  const altKm = 0.1; // ~100 m above sea level

  const url =
    `${N2YO_BASE}/visualpasses/${ISS_NORAD_ID}/${lat}/${lon}/${altKm}/${days}/${minElevationDeg}` +
    `&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as N2yoResponse;
    if (!data.passes?.length) return [];
    return data.passes
      .slice(0, limit)
      .map((p, i) => n2yoPassToPolandPass(p, i));
  } catch {
    return null;
  }
}
