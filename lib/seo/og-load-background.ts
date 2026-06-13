import { readFile } from "fs/promises";
import path from "path";

function detectImageMime(buf: Buffer, filePath: string): string {
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

/** Wczytuje asset z /public jako data URL (niezawodne w ImageResponse, bez fetch z edge). */
export async function loadOgBackgroundDataUrl(
  relativePublicPath: string,
): Promise<string | null> {
  try {
    const rel = relativePublicPath.replace(/^\//, "");
    const filePath = path.join(process.cwd(), "public", rel);
    const buf = await readFile(filePath);
    const mime = detectImageMime(buf, filePath);
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
