import type { OpsLaunch } from "@/lib/ops/types";

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

type Ll2Launch = {
  id: string;
  name: string;
  net: string;
  status?: { name?: string; abbrev?: string };
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
    name?: string;
    map_image?: string | null;
    location?: { name?: string; country_code?: string };
  };
};

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

type Ll2Response = { results?: Ll2Launch[] };

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

function mapLaunch(raw: Ll2Launch): OpsLaunch {
  const provider = raw.launch_service_provider?.name?.trim() || "Operator";
  const mission = launchMissionTitle(raw);
  const rocketName = launchRocketName(raw);
  const padName = raw.pad?.name?.trim();
  const loc = raw.pad?.location?.name?.trim();
  const site = [padName, loc].filter(Boolean).join(" · ") || "Wyrzutnia";

  const net = raw.net?.trim();
  if (!net) {
    throw new Error(`Launch ${raw.id}: missing net`);
  }

  const windowLabel =
    new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(net)) + " UTC";

  return {
    id: String(raw.id),
    provider,
    mission,
    rocketName,
    net,
    site,
    image: resolveLaunchImage(raw),
    hue: providerHue(provider),
    statusLabel: raw.status?.name || raw.status?.abbrev || "Zaplanowany",
    windowLabel,
    detailUrl: `${LL2_BASE}/launches/${raw.id}/`,
  };
}

export async function fetchUpcomingLaunches(limit = 12): Promise<OpsLaunch[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    hide_recent_previous: "true",
  });
  const url = `${LL2_BASE}/launches/upcoming/?${params}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 120);
    throw new Error(`Launch Library HTTP ${res.status}: ${snippet}`);
  }

  const data = (await res.json()) as Ll2Response;
  const results = data.results ?? [];
  if (results.length === 0) {
    throw new Error("Launch Library: empty results");
  }

  return results.map(mapLaunch);
}
