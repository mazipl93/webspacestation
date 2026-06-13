import { buildCalendarFromLaunches } from "@/lib/ops/calendar-from-launches";
import {
  buildEmptyCoreSnapshot,
  filterRealLaunches,
} from "@/lib/ops/fallback";
import {
  applyLaunchBriefPipeline,
  type FetchCoreOpsOptions,
} from "@/lib/ops/generate-launch-briefs";
import { computeIssOrbitSegments } from "@/lib/ops/iss-orbit";
import { fetchIssPosition } from "@/lib/ops/iss-tracker";
import { fetchLaunchSchedule } from "@/lib/ops/launch-library";
import { pickPrimaryLaunch } from "@/lib/ops/launch-phase";
import { buildMapPins } from "@/lib/ops/map-geo";
import type { OpsCorePayload } from "@/lib/ops/payloads";
import type { OpsIssPosition, OpsMapPin } from "@/lib/ops/types";
import { readStoredCore } from "@/lib/ops/snapshot-store";

function refreshIssOnMapPins(
  pins: OpsMapPin[],
  iss: OpsIssPosition | null,
): OpsMapPin[] {
  if (!iss) return pins;
  return pins.map((pin) =>
    pin.kind === "iss"
      ? { ...pin, lat: iss.latitude, lon: iss.longitude }
      : pin,
  );
}

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

  const [iss, issOrbit] = await Promise.all([
    fetchIssPosition().catch(() => null),
    computeIssOrbitSegments().catch(
      () => [] as { lat: number; lon: number }[][],
    ),
  ]);

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
        mapPins,
        live: false,
        fetchedAt,
      };
    }

    return {
      ...buildEmptyCoreSnapshot(),
      iss,
      issOrbit,
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
    mapPins,
    live: launchesLive,
    fetchedAt,
  };
}
