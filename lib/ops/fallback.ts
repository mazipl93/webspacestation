import { OPS_TIMELINE_EVENTS } from "@/lib/ops/discover-data";
import type {
  OpsCalendarEvent,
  OpsLaunch,
  OpsSnapshot,
} from "@/lib/ops/types";
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
      statusLabel: "Offline API",
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
      statusLabel: "Offline API",
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
      statusLabel: "Offline API",
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
      statusLabel: "Offline API",
    },
  ];
}

function mockCalendar(): OpsCalendarEvent[] {
  return OPS_TIMELINE_EVENTS.map((ev) => ({
    id: ev.id,
    quarter: ev.quarter,
    title: ev.title,
    hint: ev.hint,
    active: ev.active,
    net: FALLBACK_NET_ISO[0],
  }));
}

export function buildFallbackOpsSnapshot(): OpsSnapshot {
  const launches = mockLaunches();
  return {
    launches,
    calendar: mockCalendar(),
    iss: null,
    mapPins: buildMapPins(null, launches, []),
    gallery: [],
    videos: [],
    live: false,
    fetchedAt: new Date().toISOString(),
  };
}
