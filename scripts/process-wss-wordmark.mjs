/**
 * Logo WSS v2 — usuwa czarne tło, eksport wordmarku do public/brand/.
 * UI: components/brand/WssLogoWordmark.tsx (PNG z public/brand/).
 * Ten skrypt zostaje do PNG/OG/e-mail z oryginalnego assets/logo-wss-wordmark-source.png.
 * node scripts/process-wss-wordmark.mjs
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const input = path.join(process.cwd(), "assets", "logo-wss-wordmark-source.png");
const outDir = path.join(process.cwd(), "public", "brand");

function isBackground(r, g, b) {
  return r <= 14 && g <= 14 && b <= 18;
}

async function stripBackground(bufferOrPath) {
  const { data, info } = await sharp(bufferOrPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    if (isBackground(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 0;
    } else {
      data[i + 3] = 255;
    }
  }

  return sharp(data, { raw: { width, height, channels } });
}

async function trimAlpha(img, padding = 2) {
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

  let img = await stripBackground(input);
  img = await trimAlpha(img, 4);

  const meta = await img.metadata();
  const aspect = (meta.width ?? 1) / (meta.height ?? 1);

  const heights = [44, 52, 88];
  for (const h of heights) {
    const w = Math.round(h * aspect);
    const suffix = h === 44 ? "" : `@${h}h`;
    await img
      .clone()
      .resize(w, h, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(path.join(outDir, `wss-wordmark${suffix}.png`));
  }

  await img
    .clone()
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, "wss-wordmark-full.png"));

  console.log("OK:", outDir, `aspect ${aspect.toFixed(2)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
