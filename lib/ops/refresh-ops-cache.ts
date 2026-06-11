import { revalidateTag } from "next/cache";
import {
  hasRealLaunchData,
  mergeIssRefreshIntoCore,
  shouldPersistCoreSnapshot,
} from "@/lib/ops/fallback";
import { fetchCoreOpsSnapshot } from "@/lib/ops/fetch-core-snapshot";
import { fetchGalleryOpsSnapshot } from "@/lib/ops/fetch-gallery-snapshot";
import { fetchVideoOpsSnapshot } from "@/lib/ops/fetch-video-snapshot";
import {
  OPS_CACHE_KEYS,
  OPS_CACHE_TAG,
  type OpsCorePayload,
  type OpsGalleryPayload,
  type OpsVideoPayload,
} from "@/lib/ops/payloads";
import {
  readStoredCore,
  writeOpsCacheEntry,
} from "@/lib/ops/snapshot-store";

export type OpsRefreshResult = {
  core: { live: boolean; launches: number; fetchedAt: string };
  gallery: { live: boolean; items: number; fetchedAt: string };
  video: { live: boolean; items: number; fetchedAt: string };
};

/** Fetch external APIs and persist snapshots — invoked by cron, never by user SSR. */
export async function refreshOpsCache(): Promise<OpsRefreshResult> {
  const [coreResult, galleryResult, videoResult] = await Promise.allSettled([
    fetchCoreOpsSnapshot({ generateBriefs: true }),
    fetchGalleryOpsSnapshot(),
    fetchVideoOpsSnapshot(),
  ]);

  let core: OpsCorePayload;
  if (coreResult.status === "fulfilled") {
    const fetched = coreResult.value;
    const stored = await readStoredCore().catch(() => null);

    if (shouldPersistCoreSnapshot(fetched, stored)) {
      core = fetched;
      await writeOpsCacheEntry(OPS_CACHE_KEYS.core, core, core.live);
    } else if (stored) {
      core = mergeIssRefreshIntoCore(stored, fetched);
      await writeOpsCacheEntry(
        OPS_CACHE_KEYS.core,
        core,
        hasRealLaunchData(core.launches),
      );
      console.warn(
        "[ops] LL2 empty — kept cached launches, refreshed ISS/map only",
      );
    } else {
      core = fetched;
      await writeOpsCacheEntry(OPS_CACHE_KEYS.core, core, false);
    }
  } else {
    console.error("[ops] cron core fetch failed", coreResult.reason);
    throw coreResult.reason;
  }

  let gallery: OpsGalleryPayload = {
    gallery: [],
    live: false,
    fetchedAt: new Date().toISOString(),
  };
  if (galleryResult.status === "fulfilled") {
    gallery = galleryResult.value;
    await writeOpsCacheEntry(OPS_CACHE_KEYS.gallery, gallery, gallery.live);
  } else {
    console.error("[ops] cron gallery fetch failed", galleryResult.reason);
  }

  let video: OpsVideoPayload = {
    videos: [],
    live: false,
    fetchedAt: new Date().toISOString(),
  };
  if (videoResult.status === "fulfilled") {
    video = videoResult.value;
    await writeOpsCacheEntry(OPS_CACHE_KEYS.video, video, video.live);
  } else {
    console.error("[ops] cron video fetch failed", videoResult.reason);
  }

  try {
    revalidateTag(OPS_CACHE_TAG);
  } catch {
    console.warn("[ops] revalidateTag skipped — run cron or redeploy to bust ISR");
  }

  return {
    core: {
      live: core.live,
      launches: core.launches.length,
      fetchedAt: core.fetchedAt,
    },
    gallery: {
      live: gallery.live,
      items: gallery.gallery.length,
      fetchedAt: gallery.fetchedAt,
    },
    video: {
      live: video.live,
      items: video.videos.length,
      fetchedAt: video.fetchedAt,
    },
  };
}
