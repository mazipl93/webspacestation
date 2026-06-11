import type { OpsLaunch } from "@/lib/ops/types";

export function launchNeedsBrief(launch: OpsLaunch): boolean {
  if (!launch.brief) return true;
  return launch.brief.basedOnNet !== launch.net;
}

/** Zachowaj brief z poprzedniego snapshotu, gdy NET się nie zmienił. */
export function mergeLaunchBriefsFromPrevious(
  launches: OpsLaunch[],
  previous: OpsLaunch[],
): OpsLaunch[] {
  const prevById = new Map(previous.map((l) => [l.id, l]));

  return launches.map((launch) => {
    const prev = prevById.get(launch.id);
    if (prev?.brief && prev.brief.basedOnNet === launch.net) {
      return { ...launch, brief: prev.brief };
    }
    return launch;
  });
}

export function filterLaunchesForBriefGeneration(
  launches: OpsLaunch[],
  limit: number,
  horizonDays: number,
  nowMs = Date.now(),
): OpsLaunch[] {
  const horizonMs = horizonDays * 86_400_000;

  return launches
    .filter((launch) => {
      if (!launchNeedsBrief(launch)) return false;
      const netMs = Date.parse(launch.net);
      if (Number.isNaN(netMs)) return false;
      return netMs - nowMs <= horizonMs;
    })
    .sort((a, b) => Date.parse(a.net) - Date.parse(b.net))
    .slice(0, limit);
}

export function attachBriefsToLaunches(
  launches: OpsLaunch[],
  briefsById: Map<string, OpsLaunch["brief"]>,
): OpsLaunch[] {
  return launches.map((launch) => {
    const brief = briefsById.get(launch.id);
    return brief ? { ...launch, brief } : launch;
  });
}
