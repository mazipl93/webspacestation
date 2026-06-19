import type { OpsLaunch, OpsLaunchBrief } from "@/lib/ops/types";

function formatNetShort(net: string): string {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(new Date(net));
  } catch {
    return net;
  }
}

/** Krótki kontekst z samych pól LL2 — gdy AI brief jeszcze nie powstał. */
export function buildFallbackLaunchBriefText(launch: OpsLaunch): string {
  const mission = launch.mission;
  const haystack = `${mission} ${launch.provider} ${launch.rocketName ?? ""}`.toLowerCase();
  const net = formatNetShort(launch.net);
  const rocket = launch.rocketName ? ` na ${launch.rocketName}` : "";
  const site = launch.site;

  if (/starlink/i.test(haystack)) {
    const batch = mission.match(/(?:group|grupa)\s+[\d-–]+|\d+[-–]\d+/i)?.[0]?.replace(/–/g, "-");
    if (batch) {
      return `Partia Starlink ${batch}: kolejne satelity internetowe SpaceX trafią na niską orbitę. Start z ${site}, NET ok. ${net} UTC.`;
    }
    return `Rutynowy start Starlink uzupełnia globalną sieć internetową SpaceX na LEO. ${site}, NET ok. ${net} UTC.`;
  }

  if (/nrol|ussf|national security|nieujawnion|classified|tajny/i.test(haystack)) {
    return `Lot o ograniczonej jawności — operator nie publikuje szczegółów ładunku. ${launch.provider} startuje z ${site}${rocket}; NET ok. ${net} UTC.`;
  }

  if (/\bcrew\b|dragon.*crew|soyuz.*ms|progress\s*ms|axiom|starliner/i.test(haystack)) {
    return `Start załogowy lub transportowy związany z programem ISS. ${launch.provider}, ${site}${rocket}; NET ok. ${net} UTC.`;
  }

  if (/\bstarship\b|ift|flight\s*\d/i.test(haystack)) {
    return `Test lub lot Starship — kluczowy etap programu wielokrotnego użytku SpaceX. Platforma ${site}; NET ok. ${net} UTC.`;
  }

  if (/h3-|falcon|electron|ariane|vega|long march|soyuz|atlas|vulcan|new glenn/i.test(haystack)) {
    return `${launch.provider} wyniesie misję „${mission}”${rocket}. Start z ${site}; NET ok. ${net} UTC.`;
  }

  return `${launch.provider} planuje start „${mission}”${rocket}. Miejsce: ${site}; NET ok. ${net} UTC.`;
}

export function buildFallbackLaunchBrief(launch: OpsLaunch): OpsLaunchBrief {
  return {
    text: buildFallbackLaunchBriefText(launch),
    basedOnNet: launch.net,
    generatedAt: new Date().toISOString(),
    model: "fallback",
  };
}

export function resolveLaunchBrief(launch: OpsLaunch): OpsLaunchBrief {
  if (launch.brief?.text?.trim()) return launch.brief;
  return buildFallbackLaunchBrief(launch);
}
