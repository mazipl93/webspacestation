import type { OpsLaunch } from "@/lib/ops/types";

/** LL2 status.id — https://ll.thespacedevs.com/docs */
const STATUS = {
  GO: 1,
  TBD: 2,
  SUCCESS: 3,
  FAILURE: 4,
  HOLD: 5,
  IN_PROGRESS: 6,
  PARTIAL_FAILURE: 7,
  TBC: 8,
} as const;

const DEFAULT_WINDOW_MS = 2 * 60 * 60 * 1000;
/** Po zamknięciu okna — ile czekamy zanim uznajemy wpis za nieaktualny. */
export const LAUNCH_STALE_AFTER_WINDOW_MS = 45 * 60 * 1000;

export function computeLaunchPhase(
  launch: Pick<
    OpsLaunch,
    "net" | "windowEnd" | "statusId" | "statusAbbrev" | "phase"
  >,
  nowMs = Date.now(),
): OpsLaunch["phase"] {
  const statusId = launch.statusId;
  const abbrev = launch.statusAbbrev?.toLowerCase() ?? "";

  if (
    statusId === STATUS.SUCCESS ||
    abbrev === "success" ||
    launch.statusAbbrev === "Success"
  ) {
    return "success";
  }
  if (
    statusId === STATUS.FAILURE ||
    statusId === STATUS.PARTIAL_FAILURE ||
    abbrev === "failure" ||
    abbrev.includes("fail")
  ) {
    return "failure";
  }
  if (statusId === STATUS.IN_PROGRESS || abbrev === "in progress") {
    return "live";
  }
  if (statusId === STATUS.HOLD || abbrev === "hold") {
    return "hold";
  }

  const netMs = Date.parse(launch.net);
  if (Number.isNaN(netMs)) return "unknown";

  const windowEndMs = launch.windowEnd
    ? Date.parse(launch.windowEnd)
    : netMs + DEFAULT_WINDOW_MS;

  if (nowMs < netMs) return "countdown";
  if (nowMs <= windowEndMs) return "window";

  return "unknown";
}

/** Start nadal sensowny na liście „nadchodzących”. */
export function isActionableUpcoming(launch: OpsLaunch): boolean {
  if (launch.phase === "success" || launch.phase === "failure") return false;
  if (launch.phase === "countdown" || launch.phase === "window" || launch.phase === "live") {
    return true;
  }
  if (launch.phase === "hold") return true;

  const netMs = Date.parse(launch.net);
  const windowEndMs = launch.windowEnd
    ? Date.parse(launch.windowEnd)
    : netMs + DEFAULT_WINDOW_MS;
  const staleAfter = windowEndMs + LAUNCH_STALE_AFTER_WINDOW_MS;
  return Date.now() <= staleAfter;
}

export function pickPrimaryLaunch(launches: OpsLaunch[]): OpsLaunch | null {
  const priority: OpsLaunch["phase"][] = ["live", "window", "countdown", "hold"];
  for (const phase of priority) {
    const found = launches.find((l) => l.phase === phase);
    if (found) return found;
  }
  return launches[0] ?? null;
}

export function enrichLaunchPhase(launch: OpsLaunch): OpsLaunch {
  const phase = computeLaunchPhase(launch);
  return { ...launch, phase };
}

export function migrateLaunchRecord(launch: OpsLaunch): OpsLaunch {
  return enrichLaunchPhase({
    ...launch,
    phase: launch.phase ?? "countdown",
  });
}

export function launchPhaseLabel(phase: OpsLaunch["phase"]): string {
  switch (phase) {
    case "countdown":
      return "Odliczanie";
    case "window":
      return "Okno startowe";
    case "live":
      return "Start w toku";
    case "hold":
      return "Wstrzymany";
    case "success":
      return "Start udany";
    case "failure":
      return "Start nieudany";
    default:
      return "Status nieznany";
  }
}

export function isLaunchFeedStale(
  launches: OpsLaunch[],
  fetchedAt: string,
  maxAgeMs: number,
): boolean {
  const age = Date.now() - new Date(fetchedAt).getTime();
  if (age > maxAgeMs) return true;

  const primary = pickPrimaryLaunch(launches);
  if (!primary) return age > 60_000;

  if (primary.phase === "unknown") return true;

  if (primary.phase === "countdown") {
    const netMs = Date.parse(primary.net);
    if (netMs < Date.now() - 30 * 60_000) return true;
  }

  return false;
}
