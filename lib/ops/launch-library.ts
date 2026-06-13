import type { LaunchPadCoord } from "@/lib/ops/launch-pads";
import { extractLaunchPadCoords } from "@/lib/ops/launch-pads";
import type { OpsLaunch } from "@/lib/ops/types";
import { fetchExternal } from "@/lib/ops/fetch-external";
import { localizeOpsLaunch, localizePadLabel, localizeStatus } from "@/lib/ops/localize-ops";
import {
  enrichLaunchPhase,
  isActionableUpcoming,
} from "@/lib/ops/launch-phase";

/** LL2 prod — 2.3.0 stabilne; 2.4.0 bywa 500. Endpoint: /launches/ (liczba mnoga). */
const LL2_BASE =
  process.env.LAUNCH_LIBRARY_API_URL?.replace(/\/$/, "") ??
  "https://ll.thespacedevs.com/2.3.0";

const DEFAULT_LAUNCH_IMAGE =
  "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=70";

type Ll2Image = {
  image_url?: string | null;
  thumbnail_url?: string | null;
};

type Ll2Status = {
  id?: number;
  name?: string;
  abbrev?: string;
};

type Ll2Precision = {
  name?: string;
  abbrev?: string;
};

type Ll2Launch = {
  id: string;
  name: string;
  net: string;
  window_start?: string | null;
  window_end?: string | null;
  last_updated?: string;
  status?: Ll2Status;
  net_precision?: Ll2Precision;
  image?: string | Ll2Image | null;
  mission?: { name?: string | null };
  launch_service_provider?: { name?: string };
  rocket?: {
    configuration?: {
      full_name?: string;
      name?: string;
      image?: { image_url?: string | null };
    };
  };
  pad?: {
    id?: number;
    name?: string;
    latitude?: number | string;
    longitude?: number | string;
    map_image?: string | null;
    location?: { name?: string; country_code?: string };
  };
};

type Ll2Response = { results?: Ll2Launch[] };

function launchMissionTitle(raw: Ll2Launch): string {
  const fromMission = raw.mission?.name?.trim();
  if (fromMission && fromMission.toLowerCase() !== "unknown payload") {
    return fromMission;
  }
  const parts = raw.name?.split("|").map((s) => s.trim()) ?? [];
  if (parts.length >= 2 && parts[1]) return parts[1];
  return raw.name?.trim() || "Misja";
}

function launchRocketName(raw: Ll2Launch): string | undefined {
  const rocket =
    raw.rocket?.configuration?.full_name?.trim() ||
    raw.rocket?.configuration?.name?.trim();
  if (!rocket) return undefined;
  const title = launchMissionTitle(raw);
  if (rocket === title) return undefined;
  return rocket;
}

export function providerHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h + name.charCodeAt(i) * 17) % 360;
  }
  return Math.max(20, h);
}

function resolveLaunchImage(raw: Ll2Launch): string {
  if (typeof raw.image === "string" && raw.image) return raw.image;
  if (raw.image && typeof raw.image === "object") {
    const img = raw.image as Ll2Image;
    if (img.image_url) return img.image_url;
    if (img.thumbnail_url) return img.thumbnail_url;
  }
  const rocketImg = raw.rocket?.configuration?.image?.image_url;
  if (rocketImg) return rocketImg;
  if (raw.pad?.map_image) return raw.pad.map_image;
  return DEFAULT_LAUNCH_IMAGE;
}

function formatWindowLabel(net: string, windowEnd?: string | null): string {
  const fmt = new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
  const netLabel = `${fmt.format(new Date(net))} UTC`;
  if (windowEnd && windowEnd !== net) {
    const endLabel = fmt.format(new Date(windowEnd));
    return `NET ${netLabel} · okno do ${endLabel} UTC`;
  }
  return netLabel;
}

function parseCoord(value: number | string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

function mapLaunch(raw: Ll2Launch): OpsLaunch {
  const provider = raw.launch_service_provider?.name?.trim() || "Operator";
  const mission = launchMissionTitle(raw);
  const rocketName = launchRocketName(raw);
  const padName = raw.pad?.name?.trim();
  const loc = raw.pad?.location?.name?.trim();
  const rawSite = [padName, loc].filter(Boolean).join(" · ") || "Miejsce startu";
  const lat = parseCoord(raw.pad?.latitude);
  const lon = parseCoord(raw.pad?.longitude);
  const site = localizePadLabel(
    padName || loc || rawSite,
    provider,
    lat != null && lon != null ? { lat, lon } : undefined,
  );

  const net = raw.net?.trim();
  if (!net) {
    throw new Error(`Launch ${raw.id}: missing net`);
  }

  const statusName = raw.status?.name || raw.status?.abbrev || "Zaplanowany";
  const windowStart = raw.window_start?.trim() || undefined;
  const windowEnd = raw.window_end?.trim() || undefined;

  const base: OpsLaunch = {
    id: String(raw.id),
    provider,
    mission,
    rocketName,
    net,
    windowStart,
    windowEnd,
    site,
    image: resolveLaunchImage(raw),
    hue: providerHue(provider),
    statusLabel: localizeStatus(statusName),
    statusAbbrev: raw.status?.abbrev?.trim(),
    statusId: raw.status?.id,
    phase: "countdown",
    windowLabel: formatWindowLabel(net, windowEnd),
    detailUrl: `${LL2_BASE}/launches/${raw.id}/`,
    lastUpdated: raw.last_updated?.trim(),
    netPrecisionLabel: raw.net_precision?.name?.trim(),
  };

  return localizeOpsLaunch(enrichLaunchPhase(base));
}

export function ll2RequestHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = process.env.LAUNCH_LIBRARY_API_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Token ${token}`;
  }
  return headers;
}

function logLl2HttpFailure(list: string, status: number, snippet: string): void {
  const msg = `[ops] Launch Library ${list} HTTP ${status}${snippet ? `: ${snippet}` : ""}`;
  if (status === 429) {
    console.warn(`${msg} — używamy cache / ostatniego snapshotu`);
    return;
  }
  console.warn(msg);
}

async function fetchLaunchesFromList(
  list: "upcoming" | "previous",
  limit: number,
  extraParams?: Record<string, string>,
): Promise<Ll2Launch[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    ...extraParams,
  });
  if (list === "upcoming") {
    params.set("hide_recent_previous", "true");
  }

  const url = `${LL2_BASE}/launches/${list}/?${params}`;
  const res = await fetchExternal(url, {
    headers: ll2RequestHeaders(),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 120);
    logLl2HttpFailure(list, res.status, snippet);
    return [];
  }

  const data = (await res.json()) as Ll2Response;
  return data.results ?? [];
}

export type LaunchSchedule = {
  upcoming: OpsLaunch[];
  recent: OpsLaunch[];
  padCoords: LaunchPadCoord[];
};

/** Nadchodzące + ostatnie zakończone — pełniejszy obraz niż sam /upcoming/. */
export async function fetchLaunchSchedule(
  upcomingLimit = 16,
  recentLimit = 4,
): Promise<LaunchSchedule> {
  const upcomingRaw = await fetchLaunchesFromList("upcoming", upcomingLimit);
  const recentRaw = await fetchLaunchesFromList("previous", recentLimit).catch(
    () => [] as Ll2Launch[],
  );

  const upcoming = upcomingRaw
    .map(mapLaunch)
    .filter(isActionableUpcoming)
    .sort((a, b) => Date.parse(a.net) - Date.parse(b.net));

  let resolvedUpcoming = upcoming;
  if (resolvedUpcoming.length === 0 && upcomingRaw.length > 0) {
    resolvedUpcoming = upcomingRaw
      .map(mapLaunch)
      .filter(
        (l) =>
          l.phase === "countdown" ||
          l.phase === "hold" ||
          Date.parse(l.net) > Date.now(),
      )
      .sort((a, b) => Date.parse(a.net) - Date.parse(b.net));
  }

  const recent = recentRaw
    .map(mapLaunch)
    .filter((l) => l.phase === "success" || l.phase === "failure")
    .sort((a, b) => Date.parse(b.net) - Date.parse(a.net));

  return {
    upcoming: resolvedUpcoming.slice(0, 12),
    recent: recent.slice(0, 3),
    padCoords: extractLaunchPadCoords(upcomingRaw, 24),
  };
}

/** @deprecated Użyj fetchLaunchSchedule — zostawione dla powiadomień. */
export async function fetchUpcomingLaunches(limit = 12): Promise<OpsLaunch[]> {
  const { upcoming } = await fetchLaunchSchedule(limit + 4, 0);
  return upcoming.slice(0, limit);
}
