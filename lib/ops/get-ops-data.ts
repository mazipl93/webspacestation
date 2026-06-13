import { unstable_cache } from "next/cache";
import { shouldFetchExternalOpsOnSsr } from "@/lib/ops/ops-ssr-mode";
import { fetchCoreOpsSnapshot } from "@/lib/ops/fetch-core-snapshot";
import { fetchGalleryOpsSnapshot } from "@/lib/ops/fetch-gallery-snapshot";
import { fetchVideoOpsSnapshot } from "@/lib/ops/fetch-video-snapshot";
import {
  buildEmptyCoreSnapshot,
  buildFallbackOpsSnapshot,
  hasRealLaunchData,
  mergeIssRefreshIntoCore,
  shouldPersistCoreSnapshot,
} from "@/lib/ops/fallback";
import {
  coreToOpsSnapshot,
  galleryToOpsSnapshot,
  mergeOpsSnapshots,
  OPS_CACHE_KEYS,
  OPS_CACHE_TAG,
  videoToOpsSnapshot,
  type OpsCorePayload,
  type OpsGalleryPayload,
  type OpsVideoPayload,
} from "@/lib/ops/payloads";
import {
  readStoredCore,
  readStoredGallery,
  readStoredVideo,
  writeOpsCacheEntry,
} from "@/lib/ops/snapshot-store";
import type { OpsSnapshot } from "@/lib/ops/types";
import { withTimeout } from "@/lib/ops/with-timeout";
import { isLaunchFeedStale } from "@/lib/ops/launch-phase";

export { OPS_CACHE_TAG };

const BOOTSTRAP_TIMEOUT_MS =
  process.env.NODE_ENV === "development" ? 14_000 : 8_000;

/** Maks. wiek snapshotu z DB zanim wymusimy fetch LL2 + ISS. */
const OPS_MAX_AGE_MS =
  process.env.NODE_ENV === "development" ? 2 * 60_000 : 10 * 60_000;

async function bootstrapCore(): Promise<OpsCorePayload> {
  const stored = await readStoredCore();
  try {
    const fresh = await withTimeout(
      fetchCoreOpsSnapshot(),
      BOOTSTRAP_TIMEOUT_MS,
      null
    );
    if (fresh) {
      if (shouldPersistCoreSnapshot(fresh, stored)) {
        await writeOpsCacheEntry(OPS_CACHE_KEYS.core, fresh, fresh.live).catch(
          () => {}
        );
        return fresh;
      }
      if (stored && hasRealLaunchData(stored.launches)) {
        return mergeIssRefreshIntoCore(stored, fresh);
      }
      return fresh;
    }
  } catch (error) {
    console.warn("[ops] bootstrap core failed:", error instanceof Error ? error.message : error);
  }
  if (stored && hasRealLaunchData(stored.launches)) return stored;
  return buildEmptyCoreSnapshot();
}

async function bootstrapGallery(): Promise<OpsGalleryPayload> {
  const stored = await readStoredGallery();
  try {
    const fresh = await withTimeout(
      fetchGalleryOpsSnapshot(),
      BOOTSTRAP_TIMEOUT_MS,
      null
    );
    if (fresh) {
      await writeOpsCacheEntry(
        OPS_CACHE_KEYS.gallery,
        fresh,
        fresh.live
      ).catch(() => {});
      return fresh;
    }
  } catch (error) {
    console.error("[ops] bootstrap gallery failed", error);
  }
  if (stored) return stored;
  return { gallery: [], live: false, fetchedAt: new Date().toISOString() };
}

async function bootstrapVideo(): Promise<OpsVideoPayload> {
  const stored = await readStoredVideo();
  try {
    const fresh = await withTimeout(
      fetchVideoOpsSnapshot(),
      BOOTSTRAP_TIMEOUT_MS,
      null
    );
    if (fresh) {
      await writeOpsCacheEntry(OPS_CACHE_KEYS.video, fresh, fresh.live).catch(
        () => {}
      );
      return fresh;
    }
  } catch (error) {
    console.error("[ops] bootstrap video failed", error);
  }
  if (stored) return stored;
  return { videos: [], live: false, fetchedAt: new Date().toISOString() };
}

async function loadCoreFromStore(): Promise<OpsCorePayload> {
  const stored = await readStoredCore();

  if (!shouldFetchExternalOpsOnSsr()) {
    if (stored) return stored;
    return buildEmptyCoreSnapshot();
  }

  if (
    stored &&
    !isLaunchFeedStale(stored.launches, stored.fetchedAt, OPS_MAX_AGE_MS)
  ) {
    return stored;
  }
  return bootstrapCore();
}

async function loadGalleryFromStore(): Promise<OpsGalleryPayload> {
  const stored = await readStoredGallery();
  if (!shouldFetchExternalOpsOnSsr()) {
    if (stored) return stored;
    return { gallery: [], live: false, fetchedAt: new Date().toISOString() };
  }
  if (stored) return stored;
  return bootstrapGallery();
}

async function loadVideoFromStore(): Promise<OpsVideoPayload> {
  const stored = await readStoredVideo();
  if (!shouldFetchExternalOpsOnSsr()) {
    if (stored) return stored;
    return { videos: [], live: false, fetchedAt: new Date().toISOString() };
  }
  if (stored) return stored;
  return bootstrapVideo();
}

function cachedCoreLoader() {
  if (process.env.NODE_ENV === "development") {
    return loadCoreFromStore();
  }
  return unstable_cache(loadCoreFromStore, ["ops-core-v2"], {
    revalidate: 120,
    tags: [OPS_CACHE_TAG],
  })();
}

function cachedGalleryLoader() {
  if (process.env.NODE_ENV === "development") {
    return loadGalleryFromStore();
  }
  return unstable_cache(loadGalleryFromStore, ["ops-gallery-v1"], {
    revalidate: 300,
    tags: [OPS_CACHE_TAG],
  })();
}

function cachedVideoLoader() {
  if (process.env.NODE_ENV === "development") {
    return loadVideoFromStore();
  }
  return unstable_cache(loadVideoFromStore, ["ops-video-v1"], {
    revalidate: 300,
    tags: [OPS_CACHE_TAG],
  })();
}

/** Homepage + Centrum operacyjne — tylko starty, ISS, mapa (bez NASA). */
export async function getHomepageOpsData(): Promise<OpsSnapshot> {
  const core = await cachedCoreLoader();
  return coreToOpsSnapshot(core);
}

/** Starty + kalendarz — ten sam rdzeń co homepage. */
export async function getCoreOpsData(): Promise<OpsSnapshot> {
  return getHomepageOpsData();
}

/** /mapa — ISS + platformy z rdzenia (bez osobnego fetch w request). */
export async function getMapOpsData(): Promise<OpsSnapshot> {
  return getHomepageOpsData();
}

/** /galeria — tylko galeria (NASA + redakcja). */
export async function getGalleryOpsData(): Promise<OpsSnapshot> {
  const gallery = await cachedGalleryLoader();
  return galleryToOpsSnapshot(gallery);
}

/** /wideo — tylko NASA videos. */
export async function getVideoOpsData(): Promise<OpsSnapshot> {
  const video = await cachedVideoLoader();
  return videoToOpsSnapshot(video);
}

/** Pełny snapshot — kompatybilność wsteczna (unika zbędnego łączenia na homepage). */
export async function getOpsData(): Promise<OpsSnapshot> {
  const [core, gallery, video] = await Promise.all([
    cachedCoreLoader(),
    cachedGalleryLoader(),
    cachedVideoLoader(),
  ]);
  return mergeOpsSnapshots(core, gallery, video);
}

/** Alias — używany w fallback timeoutach mapy. */
export { buildFallbackOpsSnapshot };
