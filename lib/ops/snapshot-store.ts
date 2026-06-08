import { prisma } from "@/lib/prisma";
import {
  OPS_CACHE_KEYS,
  parseCorePayload,
  parseGalleryPayload,
  parseVideoPayload,
  type OpsCacheKey,
  type OpsCorePayload,
  type OpsGalleryPayload,
  type OpsVideoPayload,
} from "@/lib/ops/payloads";

export async function readOpsCacheEntry(key: OpsCacheKey): Promise<{
  core: OpsCorePayload | null;
  gallery: OpsGalleryPayload | null;
  video: OpsVideoPayload | null;
} | null> {
  try {
    const row = await prisma.opsCacheEntry.findUnique({ where: { key } });
    if (!row) return null;

    if (key === OPS_CACHE_KEYS.core) {
      return {
        core: parseCorePayload(row.payload),
        gallery: null,
        video: null,
      };
    }
    if (key === OPS_CACHE_KEYS.gallery) {
      return {
        core: null,
        gallery: parseGalleryPayload(row.payload),
        video: null,
      };
    }
    return {
      core: null,
      gallery: null,
      video: parseVideoPayload(row.payload),
    };
  } catch (error) {
    console.error("[ops] readOpsCacheEntry", key, error);
    return null;
  }
}

export async function writeOpsCacheEntry(
  key: OpsCacheKey,
  payload: OpsCorePayload | OpsGalleryPayload | OpsVideoPayload,
  live: boolean
): Promise<void> {
  const fetchedAt = new Date(payload.fetchedAt);
  await prisma.opsCacheEntry.upsert({
    where: { key },
    create: { key, payload, live, fetchedAt },
    update: { payload, live, fetchedAt },
  });
}

export async function readStoredCore(): Promise<OpsCorePayload | null> {
  const row = await readOpsCacheEntry(OPS_CACHE_KEYS.core);
  return row?.core ?? null;
}

export async function readStoredGallery(): Promise<OpsGalleryPayload | null> {
  const row = await readOpsCacheEntry(OPS_CACHE_KEYS.gallery);
  return row?.gallery ?? null;
}

export async function readStoredVideo(): Promise<OpsVideoPayload | null> {
  const row = await readOpsCacheEntry(OPS_CACHE_KEYS.video);
  return row?.video ?? null;
}
