import { buildCalendarFromLaunches } from "@/lib/ops/calendar-from-launches";
import {
  buildEmptyCoreSnapshot,
  filterRealLaunches,
} from "@/lib/ops/fallback";
import {
  applyLaunchBriefPipeline,
  type FetchCoreOpsOptions,
} from "@/lib/ops/generate-launch-briefs";
import { computeIssLiveTrack } from "@/lib/ops/iss-orbit";
import { fetchLaunchSchedule } from "@/lib/ops/launch-library";
import { pickPrimaryLaunch } from "@/lib/ops/launch-phase";
import { buildMapPins } from "@/lib/ops/map-geo";
import { refreshIssOnMapPins } from "@/lib/ops/refresh-iss-fields";
import type { OpsCorePayload } from "@/lib/ops/payloads";
import { readStoredCore } from "@/lib/ops/snapshot-store";

/** Launch Library + ISS + pads — no NASA, no CMS articles. */
export async function fetchCoreOpsSnapshot(
  options: FetchCoreOpsOptions = {},
): Promise<OpsCorePayload> {
  let launches: OpsCorePayload["launches"] = [];
  let recentLaunches: OpsCorePayload["recentLaunches"] = [];
  let launchesLive = false;

  const stored = await readStoredCore().catch(() => null);
  const previous = filterRealLaunches(
    options.previousLaunches?.length
      ? options.previousLaunches
      : (stored?.launches ?? []),
  );

  let padCoords: Awaited<
    ReturnType<typeof fetchLaunchSchedule>
  >["padCoords"] = [];

  try {
    const schedule = await fetchLaunchSchedule(16, 4);
    launches = await applyLaunchBriefPipeline(schedule.upcoming, {
      ...options,
      previousLaunches: previous,
    });
    recentLaunches = schedule.recent;
    padCoords = schedule.padCoords;
    launchesLive = launches.length > 0 || recentLaunches.length > 0;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn("[ops] Launch Library pipeline failed:", msg);
  }

  const issTrack = await computeIssLiveTrack().catch(() => null);
  const iss = issTrack?.iss ?? null;
  const issOrbitPast = issTrack?.orbitPast ?? [];
  const issOrbitFuture = issTrack?.orbitFuture ?? [];
  const issOrbit =
    issOrbitPast.length > 0 || issOrbitFuture.length > 0
      ? [...issOrbitPast, ...issOrbitFuture]
      : [];

  const mapPins =
    padCoords.length > 0
      ? buildMapPins(iss, padCoords)
      : stored?.mapPins?.length
        ? refreshIssOnMapPins(stored.mapPins, iss)
        : buildMapPins(iss, padCoords);
  const fetchedAt = new Date().toISOString();

  if (launches.length === 0) {
    const staleRecent = filterRealLaunches(stored?.recentLaunches ?? []);

    if (previous.length > 0) {
      const calendar = buildCalendarFromLaunches(previous);
      const primary = pickPrimaryLaunch(previous);
      if (primary) {
        for (const ev of calendar) {
          ev.active = ev.id === primary.id;
        }
      }

      return {
        launches: previous,
        recentLaunches: staleRecent,
        calendar,
        iss,
        issOrbit,
        issOrbitPast,
        issOrbitFuture,
        mapPins,
        live: false,
        fetchedAt,
      };
    }

    return {
      ...buildEmptyCoreSnapshot(),
      iss,
      issOrbit,
      issOrbitPast,
      issOrbitFuture,
      mapPins,
      fetchedAt,
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
    issOrbitPast,
    issOrbitFuture,
    mapPins,
    live: launchesLive,
    fetchedAt,
  };
}
