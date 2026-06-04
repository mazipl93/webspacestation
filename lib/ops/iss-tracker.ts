import type { OpsIssPosition } from "@/lib/ops/types";

type WhereIssResponse = {
  latitude?: number;
  longitude?: number;
  timestamp?: number;
};

export async function fetchIssPosition(): Promise<OpsIssPosition | null> {
  try {
    const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544", {
      next: { revalidate: 60 },
    });
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
    };
  } catch {
    return null;
  }
}
