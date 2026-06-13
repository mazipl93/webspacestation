import path from "path";
import sharp from "sharp";
import type { OgPageEntry } from "@/lib/seo/page-og-registry";
import {
  DEFAULT_OG_IMAGE_HEIGHT as H,
  DEFAULT_OG_IMAGE_WIDTH as W,
} from "@/lib/seo/site-og";

const CARD_W = 1104;
const CARD_X = 48;
const CARD_BOTTOM = 40;
const FONT = "Segoe UI, Roboto, Helvetica, Arial, sans-serif";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) {
        const last = lines[lines.length - 1]!;
        lines[lines.length - 1] =
          last.length > maxChars - 1
            ? `${last.slice(0, maxChars - 1)}…`
            : `${last}…`;
        return lines;
      }
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function parseAccentRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function buildGradientDefs(accent: string): string {
  const { r, g, b } = parseAccentRgb(accent);
  return `<defs>
    <linearGradient id="bgBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060810"/>
      <stop offset="100%" stop-color="#0a1520"/>
    </linearGradient>
    <radialGradient id="bgGlow" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="rgba(${r},${g},${b},0.4)"/>
      <stop offset="55%" stop-color="rgba(${r},${g},${b},0)"/>
    </radialGradient>
  </defs>`;
}

function buildOverlaySvg(entry: OgPageEntry, hasPhoto: boolean): string {
  const accent = entry.accent ?? "#38bdf8";
  const headlineLines = wrapLines(entry.headline, 38, 2);
  const subtitleLines = wrapLines(entry.subtitle, 72, 2);

  const brandBlock = 13 + 10;
  const headlineLineH = Math.round(46 * 1.15);
  const subtitleLineH = Math.round(22 * 1.35);
  const headlineH = headlineLines.length * headlineLineH;
  const subtitleH = subtitleLines.length * subtitleLineH + 12;
  const cardH = 28 + brandBlock + headlineH + subtitleH + 32;
  const cardY = H - CARD_BOTTOM - cardH;
  const textX = CARD_X + 37;
  const brandY = cardY + 28 + 13;
  const headlineY = brandY + 10 + Math.round(46 * 0.9);
  const subtitleY = headlineY + headlineH + 12 + Math.round(22 * 0.85);

  const headlineTsps = headlineLines
    .map(
      (line, index) =>
        `<tspan x="${textX}" dy="${index === 0 ? 0 : headlineLineH}" font-size="46" font-weight="700" fill="#ffffff">${escapeXml(line)}</tspan>`,
    )
    .join("");

  const subtitleTsps = subtitleLines
    .map(
      (line, index) =>
        `<tspan x="${textX}" dy="${index === 0 ? 0 : subtitleLineH}" font-size="22" font-weight="400" fill="#c8d3e0">${escapeXml(line)}</tspan>`,
    )
    .join("");

  const gradientLayer = hasPhoto
    ? ""
    : `${buildGradientDefs(accent)}
  <rect width="${W}" height="${H}" fill="url(#bgBase)"/>
  <rect width="${W}" height="${H}" fill="url(#bgGlow)"/>`;

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  ${gradientLayer}
  <rect width="${W}" height="${H}" fill="rgba(6,8,16,${hasPhoto ? 0.22 : 0.4})"/>
  <rect x="0" y="290" width="${W}" height="340" fill="rgba(6,8,16,0.55)"/>
  <rect x="${CARD_X}" y="${cardY}" width="${CARD_W}" height="${cardH}" rx="14" fill="rgba(8,12,22,0.86)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <rect x="${CARD_X}" y="${cardY}" width="5" height="${cardH}" rx="2" fill="${accent}"/>
  <text x="${textX}" y="${brandY}" font-family="${FONT}" font-size="13" font-weight="600" fill="${accent}" letter-spacing="3.2">WEB SPACE STATION</text>
  <text x="${textX}" y="${headlineY}" font-family="${FONT}">${headlineTsps}</text>
  <text x="${textX}" y="${subtitleY}" font-family="${FONT}">${subtitleTsps}</text>
</svg>`;
}

function loadPhotoBackground(relativePath: string): sharp.Sharp {
  const rel = relativePath.replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", rel);

  return sharp(filePath, { failOn: "none" })
    .rotate()
    .resize(W, H, {
      fit: "cover",
      position: "centre",
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.5, m1: 0.5, m2: 0.25 });
}

/** Wysokiej jakości JPEG 1200×630 — sharp zamiast Satori PNG (lepsze foto dla FB/Discord). */
export async function buildOgImageJpeg(entry: OgPageEntry): Promise<Buffer> {
  const hasPhoto = Boolean(entry.backgroundImage);
  const base = entry.backgroundImage
    ? loadPhotoBackground(entry.backgroundImage)
    : sharp({
        create: {
          width: W,
          height: H,
          channels: 3,
          background: { r: 6, g: 8, b: 16 },
        },
      });

  const overlaySvg = buildOverlaySvg(entry, hasPhoto);

  return base
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .jpeg({
      quality: 95,
      mozjpeg: true,
      chromaSubsampling: "4:4:4",
    })
    .toBuffer();
}
