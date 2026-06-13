/**
 * Generuje favicon.ico + PNG (48, 96, 180) z app/icon.svg.
 * Znak ISS: public/brand/wss-icon-source.png → node scripts/generate-icon-svg.mjs
 * Uruchom: node scripts/generate-icon-svg.mjs && npx tsx scripts/generate-favicons.ts
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "app", "icon.svg");

async function writePng(size: number, dest: string) {
  await sharp(SOURCE, { density: Math.max(96, size * 4) })
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(dest);
  console.log(`[ok] ${path.relative(ROOT, dest)} (${size}×${size})`);
}

async function main() {
  const publicDir = path.join(ROOT, "public");
  await fs.mkdir(publicDir, { recursive: true });

  await writePng(48, path.join(publicDir, "favicon-48.png"));
  await writePng(96, path.join(publicDir, "favicon-96.png"));
  await writePng(180, path.join(publicDir, "apple-icon.png"));

  const icoBuf = await sharp(SOURCE, { density: 192 })
    .resize(48, 48)
    .png()
    .toBuffer();

  await sharp(icoBuf)
    .resize(32, 32)
    .toFile(path.join(ROOT, "app", "favicon.ico"));

  console.log("[ok] app/favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
