import type {
  OpsCalendarEvent,
  OpsGalleryItem,
  OpsIssPosition,
  OpsLaunch,
  OpsMapPin,
  OpsSnapshot,
  OpsVideoItem,
} from "@/lib/ops/types";
import { migrateLaunchRecord } from "@/lib/ops/launch-phase";

export const OPS_CACHE_TAG = "ops-data";

export const OPS_CACHE_KEYS = {
  core: "core",
  gallery: "gallery",
  video: "video",
} as const;

export type OpsCacheKey = (typeof OPS_CACHE_KEYS)[keyof typeof OPS_CACHE_KEYS];

export type OpsCorePayload = {
  launches: OpsLaunch[];
  recentLaunches: OpsLaunch[];
  calendar: OpsCalendarEvent[];
  iss: OpsIssPosition | null;
  issOrbit: { lat: number; lon: number }[][];
  mapPins: OpsMapPin[];
  live: boolean;
  fetchedAt: string;
};

export type OpsGalleryPayload = {
  gallery: OpsGalleryItem[];
  live: boolean;
  fetchedAt: string;
};

export type OpsVideoPayload = {
  videos: OpsVideoItem[];
  live: boolean;
  fetchedAt: string;
};

export function coreToOpsSnapshot(core: OpsCorePayload): OpsSnapshot {
  return {
    ...core,
    gallery: [],
    videos: [],
  };
}

export function mergeOpsSnapshots(
  core: OpsCorePayload,
  gallery: OpsGalleryPayload,
  video: OpsVideoPayload
): OpsSnapshot {
  return {
    ...core,
    gallery: gallery.gallery,
    videos: video.videos,
    live: core.live || gallery.live || video.live,
    fetchedAt: newestFetchedAt([
      core.fetchedAt,
      gallery.fetchedAt,
      video.fetchedAt,
    ]),
  };
}

function newestFetchedAt(values: string[]): string {
  return values.reduce((latest, value) =>
    new Date(value).getTime() > new Date(latest).getTime() ? value : latest
  );
}

export function parseCorePayload(raw: unknown): OpsCorePayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<OpsCorePayload>;
  if (!Array.isArray(o.launches) || !Array.isArray(o.calendar)) return null;
  const launches = o.launches.map((l) => migrateLaunchRecord(l as OpsLaunch));
  const recentLaunches = Array.isArray(o.recentLaunches)
    ? o.recentLaunches.map((l) => migrateLaunchRecord(l as OpsLaunch))
    : [];
  return {
    launches,
    recentLaunches,
    calendar: o.calendar,
    iss: o.iss ?? null,
    issOrbit: Array.isArray(o.issOrbit) ? o.issOrbit : [],
    mapPins: Array.isArray(o.mapPins) ? o.mapPins : [],
    live: Boolean(o.live),
    fetchedAt:
      typeof o.fetchedAt === "string" ? o.fetchedAt : new Date().toISOString(),
  };
}

export function parseGalleryPayload(raw: unknown): OpsGalleryPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<OpsGalleryPayload>;
  if (!Array.isArray(o.gallery)) return null;
  return {
    gallery: o.gallery,
    live: Boolean(o.live),
    fetchedAt:
      typeof o.fetchedAt === "string" ? o.fetchedAt : new Date().toISOString(),
  };
}

export function parseVideoPayload(raw: unknown): OpsVideoPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<OpsVideoPayload>;
  if (!Array.isArray(o.videos)) return null;
  return {
    videos: o.videos,
    live: Boolean(o.live),
    fetchedAt:
      typeof o.fetchedAt === "string" ? o.fetchedAt : new Date().toISOString(),
  };
}

export function galleryToOpsSnapshot(payload: OpsGalleryPayload): OpsSnapshot {
  return {
    launches: [],
    recentLaunches: [],
    calendar: [],
    iss: null,
    issOrbit: [],
    mapPins: [],
    gallery: payload.gallery,
    videos: [],
    live: payload.live,
    fetchedAt: payload.fetchedAt,
  };
}

export function videoToOpsSnapshot(payload: OpsVideoPayload): OpsSnapshot {
  return {
    launches: [],
    recentLaunches: [],
    calendar: [],
    iss: null,
    issOrbit: [],
    mapPins: [],
    gallery: [],
    videos: payload.videos,
    live: payload.live,
    fetchedAt: payload.fetchedAt,
  };
}
