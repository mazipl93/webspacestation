/**
 * Normalizes article write payloads (API → Prisma).
 * Single mapping for cover: coverImage || imageUrl || image → DB coverImage.
 */

import { normalizeCoverImageUrl } from "@/lib/media/cover-url";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asTrimmedString(v: unknown): string | undefined {
  return typeof v === "string" ? v.trim() : undefined;
}

export function hasCoverImageKeys(body: Record<string, unknown>): boolean {
  return (
    body.coverImage !== undefined ||
    body.imageUrl !== undefined ||
    body.image !== undefined
  );
}

/** coverImage || imageUrl || image (trimmed, normalized); empty → null. */
export function resolveCoverImageFromBody(
  body: Record<string, unknown>
): string | null {
  const raw =
    asTrimmedString(body.coverImage) ||
    asTrimmedString(body.imageUrl) ||
    asTrimmedString(body.image) ||
    "";
  return normalizeCoverImageUrl(raw);
}

/** Create: always resolve cover (null when absent). */
export function parseCoverImageForCreate(body: unknown): string | null {
  if (!isPlainObject(body)) return null;
  return resolveCoverImageFromBody(body);
}

/**
 * Update: omit coverImage when no image keys were sent (preserve existing row).
 * When keys are sent, persist resolved URL or null (explicit clear).
 */
export function parseCoverImageForUpdate(
  body: unknown
): string | null | undefined {
  if (!isPlainObject(body)) return undefined;
  if (!hasCoverImageKeys(body)) return undefined;
  return resolveCoverImageFromBody(body);
}
