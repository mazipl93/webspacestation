import { formatIssForReader } from "@/lib/ops/format-ops-display";
import type { OpsIssPosition, OpsLaunch } from "@/lib/ops/types";

export const OPS_IMMINENT_MS = 24 * 60 * 60 * 1000;

export function isOpsLaunchImminent(netIso: string): boolean {
  const diff = Date.parse(netIso) - Date.now();
  return diff > 0 && diff <= OPS_IMMINENT_MS;
}

export function providerAccent(hue: number): string {
  return `hsl(${hue} 72% 52%)`;
}

export function formatIssStats(iss: OpsIssPosition | null): {
  coords: string;
  altitude: string | null;
  velocity: string | null;
} {
  const base = formatIssForReader(iss);
  if (!iss) {
    return { coords: base.coords, altitude: null, velocity: null };
  }
  return {
    coords: base.coords,
    altitude:
      typeof iss.altitudeKm === "number" ? `${iss.altitudeKm} km` : null,
    velocity:
      typeof iss.velocityKmh === "number"
        ? `${iss.velocityKmh.toLocaleString("pl-PL")} km/h`
        : null,
  };
}

export function upcomingLaunchLabel(count: number): string {
  if (count <= 0) return "";
  if (count === 1) return "+1 start w harmonogramie";
  if (count < 5) return `+${count} starty w harmonogramie`;
  return `+${count} startów w harmonogramie`;
}

export function shortenMissionTitle(launch: OpsLaunch, max = 42): string {
  if (launch.mission.length <= max) return launch.mission;
  return `${launch.mission.slice(0, max - 1).trim()}…`;
}
