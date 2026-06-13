import { fetchExternal } from "@/lib/ops/fetch-external";

const LL2_BASE =
  process.env.LAUNCH_LIBRARY_API_URL?.replace(/\/$/, "") ??
  "https://ll.thespacedevs.com/2.3.0";

function ll2Headers(): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = process.env.LAUNCH_LIBRARY_API_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Token ${token}`;
  }
  return headers;
}

type Ll2Pad = {
  id?: number;
  name?: string;
  latitude?: number | string;
  longitude?: number | string;
  map_image?: string | null;
  location?: { name?: string };
};

export type Ll2LaunchPadSource = {
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
  imageUrl?: string;
};

function parseCoord(value: number | string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

/** Współrzędne ramp z już pobranej listy LL2 — bez dodatkowego requestu. */
export function extractLaunchPadCoords(
  launches: Ll2LaunchPadSource[],
  limit = 24,
): LaunchPadCoord[] {
  const out: LaunchPadCoord[] = [];
  const seen = new Set<string>();

  for (const launch of launches) {
    if (out.length >= limit) break;
    const pad = launch.pad;
    if (!pad) continue;
    const lat = parseCoord(pad.latitude);
    const lon = parseCoord(pad.longitude);
    if (lat === null || lon === null) continue;
    const key = `${lat.toFixed(2)}:${lon.toFixed(2)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const provider = launch.launch_service_provider?.name ?? "Start";
    out.push({
      id: `pad-${pad.id ?? launch.id}-${launch.id}`,
      lat,
      lon,
      label: pad.name ?? pad.location?.name ?? "Miejsce startu",
      sublabel: provider,
    });
  }

  return out;
}

/** Osobny fetch — tylko gdy brak danych z fetchLaunchSchedule. */
export async function fetchLaunchPadCoords(limit = 12): Promise<LaunchPadCoord[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    hide_recent_previous: "true",
  });
  const url = `${LL2_BASE}/launches/upcoming/?${params}`;
  const res = await fetchExternal(url, {
    headers: ll2Headers(),
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { results?: Ll2LaunchPadSource[] };
  return extractLaunchPadCoords(data.results ?? [], limit);
}
