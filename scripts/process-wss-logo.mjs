/**
 * Usuwa szachownicę i eksportuje glob do public/brand/.
 * node scripts/process-wss-logo.mjs
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const input = path.join(process.cwd(), "assets", "logo-wss-source.png");
const outDir = path.join(process.cwd(), "public", "brand");

function isCheckerboard(r, g, b) {
  if (b > r + 12 && b > 70) return false;
  if (g > r + 8 && g > 55 && b > 40) return false;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  if (spread > 10) return false;
  const avg = (r + g + b) / 3;
  if (avg >= 250) return true;
  if (avg >= 192 && avg <= 204) return true;
  if (avg >= 122 && avg <= 130) return true;
  return false;
}

/** Kula wpisana w wysokość kadru (logo ma Ziemię od lewej, pełna wysokość). */
function globeCircle(width, height) {
  const radius = height * 0.5 - 1;
  const cx = height * 0.5;
  const cy = height * 0.5;
  return { cx, cy, radius };
}

function processGlobePixels(data, width, height, channels) {
  const { cx, cy, radius } = globeCircle(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const inside = Math.hypot(x - cx, y - cy) <= radius;

      if (!inside) {
        data[i + 3] = 0;
        continue;
      }

      if (isCheckerboard(r, g, b)) {
        data[i + 3] = 0;
      } else {
        data[i + 3] = 255;
      }
    }
  }
}

async function trimAlpha(img, padding = 4) {
  const { data, info } = await img
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * channels + 3];
      if (a > 12) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (minX > maxX) return img;

  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const right = Math.min(width - 1, maxX + padding);
  const bottom = Math.min(height - 1, maxY + padding);

  return img.extract({
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  });
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const meta = await sharp(input).metadata();
  const h = meta.height ?? 271;
  const extractW = h;

  const { data, info } = await sharp(input)
    .extract({ left: 0, top: 0, width: extractW, height: h })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  processGlobePixels(data, width, height, channels);

  let globe = sharp(data, { raw: { width, height, channels } });
  globe = await trimAlpha(globe, 4);

  await globe
    .clone()
    .resize(128, 128, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, "wss-globe.png"));

  await globe
    .clone()
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, "wss-globe@2x.png"));

  console.log("OK:", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
