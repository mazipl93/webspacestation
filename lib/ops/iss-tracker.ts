import { fetchExternal } from "@/lib/ops/fetch-external";
import type { OpsIssPosition } from "@/lib/ops/types";

type WhereIssResponse = {
  latitude?: number;
  longitude?: number;
  timestamp?: number;
  altitude?: number;
  velocity?: number;
  visibility?: number;
};

/** Pozycja ISS — api.wheretheiss.at (satelita NORAD 25544). */
export async function fetchIssPosition(): Promise<OpsIssPosition | null> {
  try {
    const res = await fetchExternal(
      "https://api.wheretheiss.at/v1/satellites/25544",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as WhereIssResponse;
    if (
      typeof data.latitude !== "number" ||
      typeof data.longitude !== "number"
    ) {
      return null;
    }
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: data.timestamp ?? Math.floor(Date.now() / 1000),
      altitudeKm:
        typeof data.altitude === "number" ? Math.round(data.altitude * 10) / 10 : undefined,
      velocityKmh:
        typeof data.velocity === "number" ? Math.round(data.velocity) : undefined,
      visibility:
        typeof data.visibility === "number" ? data.visibility : undefined,
    };
  } catch {
    return null;
  }
}
