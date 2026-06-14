/**
 * DEPRECATED — nadpisuje app/icon.svg starym znakiem ISS (rounded square).
 * Aktualny favicon: app/icon.svg (WSS na czerni) + node scripts/generate-favicons.mjs
 * node scripts/generate-icon-svg.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const SRC = path.join(ROOT, "public", "brand", "wss-icon-source.png");
const OUT = path.join(ROOT, "app", "icon.svg");

const buf = await sharp(SRC).resize(96, 96).png().toBuffer();
const b64 = buf.toString("base64");

const svg = `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="96" height="96" rx="18" fill="#060810"/>
  <image x="4" y="4" width="88" height="88" href="data:image/png;base64,${b64}" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;

await fs.writeFile(OUT, svg);
console.log("[ok]", path.relative(ROOT, OUT));
