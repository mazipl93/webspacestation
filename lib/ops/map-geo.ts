import type { LaunchPadCoord } from "@/lib/ops/launch-pads";
import { providerHue } from "@/lib/ops/launch-library";
import { localizeProvider, localizeSite } from "@/lib/ops/localize-ops";
import { resolvePadDisplayLabel } from "@/lib/ops/pad-resolver";
import {
  MAJOR_COSMODROMES,
  matchPadToMajorCosmodrome,
} from "@/lib/ops/major-cosmodromes";
import type { OpsMapPin } from "@/lib/ops/types";
import type { OpsIssPosition } from "@/lib/ops/types";

const COSMODROME_COLOR = "#64748b";

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

export function buildMapPins(
  iss: OpsIssPosition | null,
  padCoords: LaunchPadCoord[],
): OpsMapPin[] {
  const pins: OpsMapPin[] = [];

  if (iss) {
    pins.push({
      id: "iss-live",
      label: "ISS",
      sublabel: "Międzynarodowa Stacja Kosmiczna",
      color: "#38bdf8",
      lat: iss.latitude,
      lon: iss.longitude,
      kind: "iss",
    });
  }

  const scheduledBySite = new Map<
    string,
    { pad: LaunchPadCoord; provider: string; displayLabel: string }
  >();
  const extraPads: LaunchPadCoord[] = [];

  for (const pad of padCoords) {
    const site = matchPadToMajorCosmodrome(pad);
    if (site) {
      const existing = scheduledBySite.get(site.id);
      if (!existing) {
        const provider = localizeProvider(pad.sublabel);
        scheduledBySite.set(site.id, {
          pad,
          provider,
          displayLabel: resolvePadDisplayLabel(
            {
              label: pad.label,
              provider: pad.sublabel,
              lat: pad.lat,
              lon: pad.lon,
            },
            localizeSite(pad.label),
          ),
        });
      }
    } else {
      extraPads.push(pad);
    }
  }

  for (const site of MAJOR_COSMODROMES) {
    const scheduled = scheduledBySite.get(site.id);
    const provider = scheduled?.provider ?? site.sublabel;

    pins.push({
      id: `cosmodrome-${site.id}`,
      siteId: site.id,
      label: scheduled ? scheduled.displayLabel : site.label,
      ll2Label: scheduled?.pad.label,
      sublabel: scheduled
        ? `${scheduled.provider} · start w harmonogramie`
        : site.sublabel,
      color: scheduled
        ? `hsl(${providerHue(provider)}, 72%, 58%)`
        : COSMODROME_COLOR,
      lat: site.lat,
      lon: site.lon,
      kind: "cosmodrome",
      scheduled: Boolean(scheduled),
    });
  }

  const seenExtra = new Set<string>();
  for (const pad of extraPads) {
    const key = `${pad.lat.toFixed(2)}:${pad.lon.toFixed(2)}`;
    if (seenExtra.has(key)) continue;
    seenExtra.add(key);

    const provider = localizeProvider(pad.sublabel);
    const displayLabel = resolvePadDisplayLabel(
      {
        label: pad.label,
        provider: pad.sublabel,
        lat: pad.lat,
        lon: pad.lon,
      },
      localizeSite(pad.label),
    );
    pins.push({
      id: pad.id,
      label: displayLabel,
      ll2Label: pad.label,
      sublabel: `${provider} · start w harmonogramie`,
      color: `hsl(${providerHue(provider)}, 72%, 58%)`,
      lat: pad.lat,
      lon: pad.lon,
      kind: "pad",
      scheduled: true,
    });
  }

  return pins;
}

/** Odległość ISS od pinu (km) — do sortowania listy. */
export function distanceKmFromIss(
  pin: OpsMapPin,
  iss: OpsIssPosition | null,
): number | null {
  if (!iss) return null;
  return haversineKm(iss.latitude, iss.longitude, pin.lat, pin.lon);
}
