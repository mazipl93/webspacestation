import { providerHue } from "@/lib/ops/launch-library";

const LL2_BASE =
  process.env.LAUNCH_LIBRARY_API_URL?.replace(/\/$/, "") ??
  "https://ll.thespacedevs.com/2.3.0";

type Ll2Pad = {
  id: number;
  name?: string;
  latitude?: number | string;
  longitude?: number | string;
  location?: { name?: string };
};

type Ll2Launch = {
  id: string;
  pad?: Ll2Pad;
  launch_service_provider?: { name?: string };
};

export type LaunchPadCoord = {
  id: string;
  lat: number;
  lon: number;
  label: string;
  sublabel: string;
};

function parseCoord(value: number | string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

export async function fetchLaunchPadCoords(limit = 12): Promise<LaunchPadCoord[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    hide_recent_previous: "true",
  });
  const url = `${LL2_BASE}/launches/upcoming/?${params}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { results?: Ll2Launch[] };
  const out: LaunchPadCoord[] = [];

  for (const launch of data.results ?? []) {
    const pad = launch.pad;
    if (!pad) continue;
    const lat = parseCoord(pad.latitude);
    const lon = parseCoord(pad.longitude);
    if (lat === null || lon === null) continue;
    const provider = launch.launch_service_provider?.name ?? "Start";
    out.push({
      id: `pad-${pad.id}-${launch.id}`,
      lat,
      lon,
      label: pad.name ?? pad.location?.name ?? "Wyrzutnia",
      sublabel: provider,
    });
  }

  return out;
}
