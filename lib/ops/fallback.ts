import { buildCalendarFromLaunches } from "@/lib/ops/calendar-from-launches";
import type { OpsLaunch, OpsSnapshot } from "@/lib/ops/types";
import { buildMapPins } from "@/lib/ops/map-geo";

/** Stałe daty zapasowe — NIE odświeżane co request (unikamy fałszywego 24:00:00). */
const FALLBACK_NET_ISO = [
  "2026-06-10T12:00:00Z",
  "2026-06-18T08:30:00Z",
  "2026-07-02T14:15:00Z",
  "2026-07-22T06:00:00Z",
] as const;

function mockLaunches(): OpsLaunch[] {
  return [
    {
      id: "fallback-1",
      provider: "SpaceX",
      mission: "Starlink Group (zapas)",
      rocketName: "Falcon 9 Block 5",
      net: FALLBACK_NET_ISO[0],
      site: "SLC-40, Cape Canaveral",
      image:
        "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=70",
      hue: 212,
      statusLabel: "API niedostępne",
      windowLabel: "Dane zapasowe",
    },
    {
      id: "fallback-2",
      provider: "SpaceX",
      mission: "Starship (zapas)",
      net: FALLBACK_NET_ISO[1],
      site: "Starbase, Teksas",
      image:
        "https://images.unsplash.com/photo-1457364887197-9150188c107b?auto=format&fit=crop&w=800&q=70",
      hue: 26,
      statusLabel: "API niedostępne",
    },
    {
      id: "fallback-3",
      provider: "ArianeGroup",
      mission: "Ariane 6 (zapas)",
      net: FALLBACK_NET_ISO[2],
      site: "Kourou, Gujana",
      image:
        "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=800&q=70",
      hue: 156,
      statusLabel: "API niedostępne",
    },
    {
      id: "fallback-4",
      provider: "Blue Origin",
      mission: "New Glenn (zapas)",
      net: FALLBACK_NET_ISO[3],
      site: "LC-36, Cape Canaveral",
      image:
        "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=70",
      hue: 268,
      statusLabel: "API niedostępne",
    },
  ];
}

export function buildFallbackOpsSnapshot(): OpsSnapshot {
  return coreToFullSnapshot(buildFallbackCoreSnapshot());
}

export function buildFallbackCoreSnapshot(): Omit<
  OpsSnapshot,
  "gallery" | "videos"
> {
  const launches = mockLaunches();
  return {
    launches,
    calendar: buildCalendarFromLaunches(launches),
    iss: null,
    issOrbit: [],
    mapPins: buildMapPins(null, []),
    live: false,
    fetchedAt: new Date().toISOString(),
  };
}

function coreToFullSnapshot(
  core: Omit<OpsSnapshot, "gallery" | "videos">
): OpsSnapshot {
  return {
    ...core,
    gallery: [],
    videos: [],
  };
}
