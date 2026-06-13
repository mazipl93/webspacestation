import { readFile } from "fs/promises";
import path from "path";

/** Wczytuje asset z /public jako data URL (niezawodne w ImageResponse, bez fetch z edge). */
export async function loadOgBackgroundDataUrl(
  relativePublicPath: string,
): Promise<string | null> {
  try {
    const rel = relativePublicPath.replace(/^\//, "");
    const filePath = path.join(process.cwd(), "public", rel);
    const buf = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
