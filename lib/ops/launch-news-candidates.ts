import { isActionableUpcoming } from "@/lib/ops/launch-phase";
import type { OpsLaunch } from "@/lib/ops/types";

/** Upcoming launches within this window get a DRAFT candidate. */
export const LAUNCH_NEWS_CANDIDATE_WINDOW_MS = 7 * 86_400_000;

function isWithinCandidateWindow(launch: OpsLaunch, nowMs: number): boolean {
  const netMs = Date.parse(launch.net);
  if (Number.isNaN(netMs)) return false;
  if (netMs < nowMs - 60 * 60_000) return false;
  return netMs <= nowMs + LAUNCH_NEWS_CANDIDATE_WINDOW_MS;
}

export function filterLaunchNewsCandidates(
  launches: OpsLaunch[],
  nowMs = Date.now(),
): OpsLaunch[] {
  return launches.filter(
    (launch) =>
      isActionableUpcoming(launch) && isWithinCandidateWindow(launch, nowMs),
  );
}
