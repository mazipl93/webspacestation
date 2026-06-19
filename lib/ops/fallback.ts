import { buildCalendarFromLaunches } from "@/lib/ops/calendar-from-launches";
import type { OpsCorePayload } from "@/lib/ops/payloads";
import { buildMapPins } from "@/lib/ops/map-geo";
import type { OpsLaunch, OpsSnapshot } from "@/lib/ops/types";

const MOCK_LAUNCH_ID_PREFIX = "fallback-";

/** Stare mocki zapisane w cache — nie pokazujemy ich jako prawdziwych startów. */
export function isMockFallbackLaunch(launch: Pick<OpsLaunch, "id">): boolean {
  return launch.id.startsWith(MOCK_LAUNCH_ID_PREFIX);
}

export function filterRealLaunches(launches: OpsLaunch[]): OpsLaunch[] {
  return launches.filter((l) => !isMockFallbackLaunch(l));
}

export function hasRealLaunchData(launches: OpsLaunch[]): boolean {
  return filterRealLaunches(launches).length > 0;
}

/** Usuwa mocki „(zapas)” z payloadu odczytanego z DB. */
export function sanitizeCorePayload(core: OpsCorePayload): OpsCorePayload {
  const launches = filterRealLaunches(core.launches);
  const recentLaunches = filterRealLaunches(core.recentLaunches ?? []);
  if (
    launches.length === core.launches.length &&
    recentLaunches.length === (core.recentLaunches ?? []).length
  ) {
    return core;
  }
  return {
    ...core,
    launches,
    recentLaunches,
    calendar:
      launches.length > 0
        ? buildCalendarFromLaunches(launches)
        : [],
    live: launches.length > 0 ? core.live : false,
  };
}

/** Pusty rdzeń — bez fałszywych startów. */
export function buildEmptyCoreSnapshot(
  partial: Partial<Omit<OpsCorePayload, "live" | "fetchedAt">> = {},
): Omit<OpsSnapshot, "gallery" | "videos"> {
  return {
    launches: [],
    recentLaunches: [],
    calendar: [],
    iss: null,
    issOrbit: [],
    issOrbitPast: [],
    issOrbitFuture: [],
    mapPins: buildMapPins(null, []),
    live: false,
    fetchedAt: new Date().toISOString(),
    ...partial,
  };
}

/** @deprecated alias — bez mocków, tylko pusty stan */
export function buildFallbackCoreSnapshot(): Omit<
  OpsSnapshot,
  "gallery" | "videos"
> {
  return buildEmptyCoreSnapshot();
}

export function buildFallbackOpsSnapshot(): OpsSnapshot {
  return { ...buildEmptyCoreSnapshot(), gallery: [], videos: [] };
}

/** Aktualizuj ISS/mapę bez kasowania ostatniego harmonogramu startów. */
export function mergeIssRefreshIntoCore(
  stored: OpsCorePayload,
  fresh: Pick<
    OpsCorePayload,
    "iss" | "issOrbit" | "issOrbitPast" | "issOrbitFuture" | "mapPins" | "fetchedAt"
  >,
): OpsCorePayload {
  return {
    ...stored,
    iss: fresh.iss ?? stored.iss,
    issOrbit: fresh.issOrbit.length > 0 ? fresh.issOrbit : stored.issOrbit,
    issOrbitPast:
      fresh.issOrbitPast.length > 0 ? fresh.issOrbitPast : stored.issOrbitPast,
    issOrbitFuture:
      fresh.issOrbitFuture.length > 0
        ? fresh.issOrbitFuture
        : stored.issOrbitFuture,
    mapPins: fresh.mapPins.length > 0 ? fresh.mapPins : stored.mapPins,
    fetchedAt: fresh.fetchedAt,
  };
}

/** Nie zapisuj pustego harmonogramu zamiast ostatniego live snapshotu. */
export function shouldPersistCoreSnapshot(
  incoming: OpsCorePayload,
  stored: OpsCorePayload | null,
): boolean {
  if (hasRealLaunchData(incoming.launches)) return true;
  if (!stored || !hasRealLaunchData(stored.launches)) return true;
  return false;
}
