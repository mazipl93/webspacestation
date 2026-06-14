/**
 * Generuje PNG favicony z app/icon.svg (okrągłe WSS na czerni).
 * node scripts/generate-favicons.mjs
 */
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const svgPath = path.join(root, "app", "icon.svg");
const svg = await fs.readFile(svgPath);

const outputs = [
  { file: "public/favicon-48.png", size: 48 },
  { file: "public/favicon-96.png", size: 96 },
  { file: "public/apple-icon.png", size: 180 },
  { file: "public/icon-192.png", size: 192 },
  { file: "public/icon-512.png", size: 512 },
];

for (const { file, size } of outputs) {
  const out = path.join(root, file);
  await sharp(svg)
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(out);
  console.log("OK", file);
}
