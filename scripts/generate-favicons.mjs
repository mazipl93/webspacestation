/**
 * Generuje favicon.ico + PNG z app/icon.svg (pełna czerń, WSS wycentrowane).
 * node scripts/generate-favicons.mjs
 */
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const svgPath = path.join(root, "app", "icon.svg");
const svg = await fs.readFile(svgPath);

function render(size) {
  return sharp(svg, { density: Math.max(144, size * 4) })
    .resize(size, size, { fit: "cover" })
    .flatten({ background: "#000000" })
    .png({ compressionLevel: 9, quality: 100 });
}

const outputs = [
  { file: "public/favicon-48.png", size: 48 },
  { file: "public/favicon-96.png", size: 96 },
  { file: "public/apple-icon.png", size: 180 },
  { file: "public/icon-192.png", size: 192 },
  { file: "public/icon-512.png", size: 512 },
];

for (const { file, size } of outputs) {
  await render(size).toFile(path.join(root, file));
  console.log("OK", file);
}

// Google i przeglądarki domyślnie pobierają /favicon.ico — min. 48×48
await render(48).toFile(path.join(root, "app", "favicon.ico"));
console.log("OK app/favicon.ico (48×48)");
