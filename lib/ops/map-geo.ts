import type { OpsMapPin } from "@/lib/ops/types";
import type { OpsIssPosition } from "@/lib/ops/types";
import type { OpsLaunch } from "@/lib/ops/types";
import { providerHue } from "@/lib/ops/launch-library";

/** Simplified equirectangular → % on editorial map panel */
export function lonLatToMapPercent(
  longitude: number,
  latitude: number
): { left: string; top: string } {
  const left = `${((longitude + 180) / 360) * 88 + 6}%`;
  const top = `${((90 - latitude) / 180) * 76 + 12}%`;
  return { left, top };
}

export function buildMapPins(
  iss: OpsIssPosition | null,
  launches: OpsLaunch[],
  padCoords: { id: string; lat: number; lon: number; label: string; sublabel: string }[]
): OpsMapPin[] {
  const pins: OpsMapPin[] = [];

  if (iss) {
    const pos = lonLatToMapPercent(iss.longitude, iss.latitude);
    pins.push({
      id: "iss-live",
      label: "ISS",
      sublabel: "Na orbicie",
      color: "#38bdf8",
      left: pos.left,
      top: pos.top,
      kind: "iss",
    });
  }

  const seen = new Set<string>();
  for (const pad of padCoords.slice(0, 6)) {
    const key = `${pad.lat.toFixed(1)}:${pad.lon.toFixed(1)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const pos = lonLatToMapPercent(pad.lon, pad.lat);
    pins.push({
      id: pad.id,
      label: pad.label,
      sublabel: pad.sublabel,
      color: `hsl(${providerHue(pad.label)}, 72%, 58%)`,
      left: pos.left,
      top: pos.top,
      kind: "pad",
    });
  }

  if (pins.length === 0 && launches.length > 0) {
    launches.slice(0, 4).forEach((l, i) => {
      pins.push({
        id: `launch-${l.id}`,
        label: l.provider,
        sublabel: l.mission,
        color: `hsl(${l.hue}, 72%, 58%)`,
        left: `${18 + i * 18}%`,
        top: `${30 + (i % 2) * 20}%`,
        kind: "pad",
      });
    });
  }

  return pins;
}
