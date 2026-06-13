import path from "path";
import sharp from "sharp";
import type { OgPageEntry } from "@/lib/seo/page-og-registry";
import {
  OG_RENDER_SCALE,
  ogRenderDimensions,
  renderOgOverlayPng,
} from "@/lib/seo/og-overlay-satori";
import {
  DEFAULT_OG_IMAGE_HEIGHT as H,
  DEFAULT_OG_IMAGE_WIDTH as W,
} from "@/lib/seo/site-og";

export type OgImageFormat = "webp" | "jpeg";

function parseAccentRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

/** Gradient tła (sharp/librsvg — bez bugów Satori radial-gradient). */
function buildGradientBackgroundSvg(
  entry: OgPageEntry,
  width: number,
  height: number,
): string {
  const accent = entry.accent ?? "#38bdf8";
  const { r, g, b } = parseAccentRgb(accent);
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060810"/>
      <stop offset="100%" stop-color="#0a1520"/>
    </linearGradient>
    <radialGradient id="bgGlow" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="rgb(${r},${g},${b})" stop-opacity="0.42"/>
      <stop offset="55%" stop-color="rgb(${r},${g},${b})" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bgBase)"/>
  <rect width="${width}" height="${height}" fill="url(#bgGlow)"/>
  <rect width="${width}" height="${height}" fill="rgba(6,8,16,0.35)"/>
</svg>`;
}

async function openPhotoPipeline(
  entry: OgPageEntry,
  width: number,
  height: number,
): Promise<sharp.Sharp> {
  const rel = entry.backgroundImage!.replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", rel);
  const meta = await sharp(filePath, { failOn: "none" }).metadata();
  const needsUpscale = (meta.width ?? 0) < width || (meta.height ?? 0) < height;
  const position = entry.backgroundPosition ?? "centre";

  let pipeline = sharp(filePath, { failOn: "none" })
    .rotate()
    .resize(width, height, {
      fit: "cover",
      position,
      kernel: sharp.kernel.lanczos3,
    })
    .toColourspace("srgb");

  if (needsUpscale) {
    pipeline = pipeline.sharpen({ sigma: 0.7, m1: 0.85, m2: 0.35 });
  } else {
    pipeline = pipeline.sharpen({ sigma: 0.4, m1: 0.55, m2: 0.22 });
  }

  return pipeline;
}

function encodeOutput(image: sharp.Sharp, format: OgImageFormat): Promise<Buffer> {
  if (format === "jpeg") {
    return image
      .jpeg({
        quality: 98,
        mozjpeg: true,
        chromaSubsampling: "4:4:4",
        trellisQuantisation: true,
        overshootDeringing: true,
      })
      .toBuffer();
  }

  return image
    .webp({
      quality: 92,
      effort: 6,
      smartSubsample: false,
      nearLossless: true,
    })
    .toBuffer();
}

async function normalizeOverlayPng(
  overlay: Buffer,
  width: number,
  height: number,
): Promise<Buffer> {
  return sharp(overlay)
    .resize(width, height, { fit: "fill", kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .png({ compressionLevel: 6 })
    .toBuffer();
}

export type BuildOgImageOptions = {
  subtitleOverride?: string;
};

/**
 * HQ OG: foto/gradient @ 2× → Satori overlay @ 2× → downscale Lanczos → jeden encode JPEG/WebP.
 */
export async function buildOgImage(
  entry: OgPageEntry,
  format: OgImageFormat = "jpeg",
  options: BuildOgImageOptions = {},
): Promise<Buffer> {
  const { width: renderW, height: renderH } = ogRenderDimensions();
  const hasPhoto = Boolean(entry.backgroundImage);

  const overlayRaw = await renderOgOverlayPng(entry, {
    width: renderW,
    height: renderH,
    hasPhoto,
    subtitleOverride: options.subtitleOverride,
  });
  const overlayPng = await normalizeOverlayPng(overlayRaw, renderW, renderH);

  const baseBuffer = entry.backgroundImage
    ? await (await openPhotoPipeline(entry, renderW, renderH))
        .png({ compressionLevel: 6 })
        .toBuffer()
    : await sharp(Buffer.from(buildGradientBackgroundSvg(entry, renderW, renderH)))
        .png()
        .toBuffer();

  const mergedPng = await sharp(baseBuffer)
    .composite([{ input: overlayPng, top: 0, left: 0 }])
    .png()
    .toBuffer();

  return encodeOutput(
    sharp(mergedPng).resize(W, H, { kernel: sharp.kernel.lanczos3 }),
    format,
  );
}

/** @deprecated Use buildOgImage — kept for callers expecting JPEG. */
export async function buildOgImageJpeg(entry: OgPageEntry): Promise<Buffer> {
  return buildOgImage(entry, "jpeg");
}

export { OG_RENDER_SCALE };
