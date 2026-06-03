import "server-only";

import sharp from "sharp";

/** Max upload size before compression (handoff P1-6). */
export const COVER_MAX_INPUT_BYTES = 25 * 1024 * 1024;

export const COVER_MAX_WIDTH = 1920;
export const COVER_WEBP_QUALITY = 82;

const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isAcceptedCoverMime(mime: string): boolean {
  return ACCEPTED_MIME.has(mime);
}

export type ProcessedCover = {
  buffer: Buffer;
  width: number;
  height: number;
  contentType: "image/webp";
};

/**
 * Normalize article cover: auto-orient, max width, WebP output.
 */
export async function processCoverImage(input: Buffer): Promise<ProcessedCover> {
  const pipeline = sharp(input, { failOn: "error" })
    .rotate()
    .resize({
      width: COVER_MAX_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: COVER_WEBP_QUALITY, effort: 4 });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    contentType: "image/webp",
  };
}
