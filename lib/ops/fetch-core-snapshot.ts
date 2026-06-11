import { buildCalendarFromLaunches } from "@/lib/ops/calendar-from-launches";
import { buildFallbackCoreSnapshot } from "@/lib/ops/fallback";
import {
  applyLaunchBriefPipeline,
  type FetchCoreOpsOptions,
} from "@/lib/ops/generate-launch-briefs";
import { computeIssOrbitSegments } from "@/lib/ops/iss-orbit";
import { fetchIssPosition } from "@/lib/ops/iss-tracker";
import { fetchLaunchSchedule } from "@/lib/ops/launch-library";
import { pickPrimaryLaunch } from "@/lib/ops/launch-phase";
import { fetchLaunchPadCoords } from "@/lib/ops/launch-pads";
import { buildMapPins } from "@/lib/ops/map-geo";
import type { OpsCorePayload } from "@/lib/ops/payloads";
import { readStoredCore } from "@/lib/ops/snapshot-store";

/** Launch Library + ISS + pads — no NASA, no CMS articles. */
export async function fetchCoreOpsSnapshot(
  options: FetchCoreOpsOptions = {},
): Promise<OpsCorePayload> {
  let launches: OpsCorePayload["launches"] = [];
  let recentLaunches: OpsCorePayload["recentLaunches"] = [];
  let live = false;

  const previous =
    options.previousLaunches ??
    (await readStoredCore().catch(() => null))?.launches ??
    [];

  try {
    const schedule = await fetchLaunchSchedule(16, 4);
    launches = await applyLaunchBriefPipeline(schedule.upcoming, {
      ...options,
      previousLaunches: previous,
    });
    recentLaunches = schedule.recent;
    live = launches.length > 0 || recentLaunches.length > 0;
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

  const calendar = buildCalendarFromLaunches(launches);
  const primary = pickPrimaryLaunch(launches);
  if (primary) {
    for (const ev of calendar) {
      ev.active = ev.id === primary.id;
    }
  }

  return {
    launches,
    recentLaunches,
    calendar,
    iss,
    issOrbit,
    mapPins: buildMapPins(iss, pads),
    live,
    fetchedAt: new Date().toISOString(),
  };
}
