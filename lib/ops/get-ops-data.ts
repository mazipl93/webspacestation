import { unstable_cache } from "next/cache";
import { getArticlesByCategory } from "@/lib/articles";
import { rankLatest } from "@/lib/home/rank-articles";
import { buildCalendarFromLaunches } from "@/lib/ops/calendar-from-launches";
import { buildFallbackOpsSnapshot } from "@/lib/ops/fallback";
import { computeIssOrbitSegments } from "@/lib/ops/iss-orbit";
import { fetchIssPosition } from "@/lib/ops/iss-tracker";
import { fetchUpcomingLaunches } from "@/lib/ops/launch-library";
import { fetchLaunchPadCoords } from "@/lib/ops/launch-pads";
import { buildMapPins } from "@/lib/ops/map-geo";
import {
  fetchNasaApod,
  fetchNasaGalleryImages,
  fetchNasaVideos,
} from "@/lib/ops/nasa-media";
import type { OpsGalleryItem, OpsSnapshot } from "@/lib/ops/types";
import { withTimeout } from "@/lib/ops/with-timeout";

export const OPS_CACHE_TAG = "ops-data";

const MAP_OPS_TIMEOUT_MS =
  process.env.NODE_ENV === "development" ? 14_000 : 25_000;
const FULL_OPS_TIMEOUT_MS =
  process.env.NODE_ENV === "development" ? 18_000 : 30_000;

async function fetchOpsSnapshot(): Promise<OpsSnapshot> {
  const isDev = process.env.NODE_ENV === "development";
  let launches: OpsSnapshot["launches"] = [];
  let live = false;

  try {
    launches = await fetchUpcomingLaunches(12);
    live = true;
  } catch (error) {
    console.error("[ops] Launch Library failed", error);
  }

  if (launches.length === 0) {
    console.warn("[ops] no launches — fallback snapshot");
    return buildFallbackOpsSnapshot();
  }

  const [iss, issOrbit, pads, apod, nasaImages, nasaVideos, astroArticles] =
    await Promise.all([
      fetchIssPosition().catch(() => null),
      computeIssOrbitSegments().catch(() => [] as { lat: number; lon: number }[][]),
      fetchLaunchPadCoords(12).catch(() => []),
      isDev
        ? Promise.resolve(null)
        : fetchNasaApod().catch(() => null),
      isDev
        ? Promise.resolve([])
        : fetchNasaGalleryImages(10).catch(() => []),
      isDev
        ? Promise.resolve([])
        : fetchNasaVideos(12).catch(() => []),
      isDev
        ? Promise.resolve([])
        : getArticlesByCategory("astronomia").catch(() => []),
    ]);

  const gallery: OpsGalleryItem[] = [];
  if (apod) gallery.push(apod);
  gallery.push(...nasaImages);

  const editorial = rankLatest(astroArticles, 6)
    .filter((a) => a.image)
    .map((a) => ({
      id: `article-${a.slug}`,
      title: a.title,
      imageUrl: a.image!,
      credit: a.source ?? "Web Space Station",
      date: a.publishedAt?.slice(0, 10),
      href: `/aktualnosci/${a.slug}`,
      source: "Redakcja WSS",
    }));
  gallery.push(...editorial);

  const calendar = buildCalendarFromLaunches(launches);

  return {
    launches,
    calendar,
    iss,
    issOrbit,
    mapPins: buildMapPins(iss, pads),
    gallery,
    videos: nasaVideos,
    live,
    fetchedAt: new Date().toISOString(),
  };
}

/** Tylko ISS + platformy — szybsze /mapa, mniej obciążenia dev serwera. */
async function fetchMapSnapshot(): Promise<OpsSnapshot> {
  const [iss, issOrbit, pads] = await Promise.all([
    fetchIssPosition().catch(() => null),
    computeIssOrbitSegments().catch(() => [] as { lat: number; lon: number }[][]),
    fetchLaunchPadCoords(12).catch(() => []),
  ]);

  const live = iss != null || pads.length > 0;

  return {
    launches: [],
    calendar: [],
    iss,
    issOrbit,
    mapPins: buildMapPins(iss, pads),
    gallery: [],
    videos: [],
    live,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getMapOpsData(): Promise<OpsSnapshot> {
  try {
    const load =
      process.env.NODE_ENV === "development"
        ? fetchMapSnapshot()
        : unstable_cache(fetchMapSnapshot, ["ops-map-snapshot-v1"], {
            revalidate: 300,
            tags: [OPS_CACHE_TAG],
          })();
    return await withTimeout(load, MAP_OPS_TIMEOUT_MS, buildFallbackOpsSnapshot());
  } catch (error) {
    console.error("[ops] getMapOpsData failed — fallback", error);
    return buildFallbackOpsSnapshot();
  }
}

export async function getOpsData(): Promise<OpsSnapshot> {
  try {
    const load =
      process.env.NODE_ENV === "development"
        ? fetchOpsSnapshot()
        : unstable_cache(fetchOpsSnapshot, ["ops-snapshot-v4"], {
            revalidate: 300,
            tags: [OPS_CACHE_TAG],
          })();
    return await withTimeout(load, FULL_OPS_TIMEOUT_MS, buildFallbackOpsSnapshot());
  } catch (error) {
    console.error("[ops] getOpsData failed — fallback", error);
    return buildFallbackOpsSnapshot();
  }
}
