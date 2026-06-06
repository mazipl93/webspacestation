/**
 * Usuwa czarne tło z logo WEB SPACE STATION → public/brand/wss-logo.png
 * node scripts/process-wss-logo-wordmark.mjs [input.png]
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const input =
  process.argv[2] ??
  path.join(process.cwd(), "assets", "logo-wss-wordmark-source.png");
const outPath = path.join(process.cwd(), "public", "brand", "wss-logo.png");

/** Piksel tła: czysta czerń lub bardzo ciemny szary (antyaliasing tła). */
function isBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const avg = (r + g + b) / 3;
  return max <= 42 && avg <= 32;
}

async function stripBackgroundFlood(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const total = width * height;
  const bg = new Uint8Array(total);
  const queue = [];

  const push = (x, y) => {
    const idx = y * width + x;
    if (bg[idx]) return;
    const i = idx * channels;
    if (!isBackground(data[i], data[i + 1], data[i + 2])) return;
    bg[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  for (let idx = 0; idx < total; idx++) {
    const i = idx * channels;
    data[i + 3] = bg[idx] ? 0 : 255;
  }

  // Usuń szare halo (JPEG) przy krawędziach — tylko piksele sąsiadujące z przezroczystością.
  for (let pass = 0; pass < 3; pass++) {
    const next = new Uint8Array(data.length);
    next.set(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const i = idx * channels;
        if (data[i + 3] === 0) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (Math.max(r, g, b) > 80) continue;

        let transparentNeighbors = 0;
        for (const [dx, dy] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            transparentNeighbors++;
            continue;
          }
          if (data[(ny * width + nx) * channels + 3] === 0) transparentNeighbors++;
        }
        if (transparentNeighbors >= 2) next[i + 3] = 0;
      }
    }
    data.set(next);
  }

  return sharp(data, { raw: { width, height, channels } });
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
  await mkdir(path.dirname(outPath), { recursive: true });

  let img = await stripBackgroundFlood(input);
  img = await trimAlpha(img, 4);

  const meta = await img.metadata();
  await img.png({ compressionLevel: 9 }).toFile(outPath);

  const aspect = ((meta.width ?? 1) / (meta.height ?? 1)).toFixed(4);
  console.log("OK:", outPath, `${meta.width}x${meta.height}`, `aspect ${aspect}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
