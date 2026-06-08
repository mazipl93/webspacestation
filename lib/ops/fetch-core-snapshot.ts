import { buildCalendarFromLaunches } from "@/lib/ops/calendar-from-launches";
import { buildFallbackCoreSnapshot } from "@/lib/ops/fallback";
import { computeIssOrbitSegments } from "@/lib/ops/iss-orbit";
import { fetchIssPosition } from "@/lib/ops/iss-tracker";
import { fetchUpcomingLaunches } from "@/lib/ops/launch-library";
import { fetchLaunchPadCoords } from "@/lib/ops/launch-pads";
import { buildMapPins } from "@/lib/ops/map-geo";
import type { OpsCorePayload } from "@/lib/ops/payloads";

/** Launch Library + ISS + pads — no NASA, no CMS articles. */
export async function fetchCoreOpsSnapshot(): Promise<OpsCorePayload> {
  let launches: OpsCorePayload["launches"] = [];
  let live = false;

  try {
    launches = await fetchUpcomingLaunches(12);
    live = launches.length > 0;
  } catch (error) {
    console.error("[ops] Launch Library failed", error);
  }

  const [iss, issOrbit, pads] = await Promise.all([
    fetchIssPosition().catch(() => null),
    computeIssOrbitSegments().catch(
      () => [] as { lat: number; lon: number }[][]
    ),
    fetchLaunchPadCoords(12).catch(() => []),
  ]);

  if (iss != null || pads.length > 0) {
    live = true;
  }

  if (launches.length === 0) {
    const fallback = buildFallbackCoreSnapshot();
    return {
      ...fallback,
      iss: iss ?? fallback.iss,
      issOrbit: issOrbit.length > 0 ? issOrbit : fallback.issOrbit,
      mapPins: buildMapPins(iss, pads),
      live,
      fetchedAt: new Date().toISOString(),
    };
  }

  return {
    launches,
    calendar: buildCalendarFromLaunches(launches),
    iss,
    issOrbit,
    mapPins: buildMapPins(iss, pads),
    live,
    fetchedAt: new Date().toISOString(),
  };
}
