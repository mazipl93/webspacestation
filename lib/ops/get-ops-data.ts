import { unstable_cache } from "next/cache";
import { getArticlesByCategory } from "@/lib/articles";
import { rankLatest } from "@/lib/home/rank-articles";
import { buildCalendarFromLaunches } from "@/lib/ops/calendar-from-launches";
import { buildFallbackOpsSnapshot } from "@/lib/ops/fallback";
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

export const OPS_CACHE_TAG = "ops-data";

async function fetchOpsSnapshot(): Promise<OpsSnapshot> {
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

  const [iss, pads, apod, nasaImages, nasaVideos, astroArticles] =
    await Promise.all([
      fetchIssPosition().catch(() => null),
      fetchLaunchPadCoords(12).catch(() => []),
      fetchNasaApod().catch(() => null),
      fetchNasaGalleryImages(10).catch(() => []),
      fetchNasaVideos(12).catch(() => []),
      getArticlesByCategory("astronomia").catch(() => []),
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
    mapPins: buildMapPins(iss, launches, pads),
    gallery,
    videos: nasaVideos,
    live,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getOpsData(): Promise<OpsSnapshot> {
  if (process.env.NODE_ENV === "development") {
    return unstable_cache(fetchOpsSnapshot, ["ops-snapshot-dev"], {
      revalidate: 120,
      tags: [OPS_CACHE_TAG],
    })();
  }

  return unstable_cache(fetchOpsSnapshot, ["ops-snapshot-v3"], {
    revalidate: 300,
    tags: [OPS_CACHE_TAG],
  })();
}
