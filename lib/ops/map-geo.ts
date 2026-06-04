import type { OpsMapPin } from "@/lib/ops/types";
import type { OpsIssPosition } from "@/lib/ops/types";
import { providerHue } from "@/lib/ops/launch-library";
import { localizePadLabel, localizeProvider } from "@/lib/ops/localize-ops";

export function buildMapPins(
  iss: OpsIssPosition | null,
  padCoords: {
    id: string;
    lat: number;
    lon: number;
    label: string;
    sublabel: string;
    imageUrl?: string;
  }[]
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

  const seen = new Set<string>();
  for (const pad of padCoords.slice(0, 8)) {
    const key = `${pad.lat.toFixed(2)}:${pad.lon.toFixed(2)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const provider = localizeProvider(pad.sublabel);
    pins.push({
      id: pad.id,
      label: localizePadLabel(pad.label),
      sublabel: provider,
      color: `hsl(${providerHue(provider)}, 72%, 58%)`,
      lat: pad.lat,
      lon: pad.lon,
      kind: "pad",
      imageUrl: pad.imageUrl,
    });
  }

  return pins;
}
