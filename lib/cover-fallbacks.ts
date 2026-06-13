import { createHash } from "crypto";
import { nasaCoverUrl } from "@/lib/editorial/nasa-cover";

/** NASA Image Library — zweryfikowane HTTP 200 (bez Unsplash, często 404 w 2026). */
/** Tylko poziome ~medium (karty newsroom). */
const NASA_POOL: Record<string, string[]> = {
  technologie: [
    nasaCoverUrl("KSC-20180402-PH_KLS02_0018"),
    nasaCoverUrl("PIA25501"),
    nasaCoverUrl("PIA23646"),
  ],
  ai: [nasaCoverUrl("PIA25236"), nasaCoverUrl("carina_nebula")],
  misje: [
    nasaCoverUrl("PIA14761"),
    nasaCoverUrl("PIA23646"),
    nasaCoverUrl("KSC-20180402-PH_KLS02_0018"),
    nasaCoverUrl("PIA25501"),
  ],
  astronomia: [
    nasaCoverUrl("carina_nebula"),
    nasaCoverUrl("PIA25701"),
    nasaCoverUrl("PIA25236"),
    nasaCoverUrl("PIA04921"),
  ],
  "ziemia-z-kosmosu": [
    nasaCoverUrl("PIA23421"),
    nasaCoverUrl("PIA25501"),
  ],
  iss: [nasaCoverUrl("PIA25501"), nasaCoverUrl("PIA19807")],
};

const DEFAULT_POOL = [
  nasaCoverUrl("PIA25236"),
  nasaCoverUrl("carina_nebula"),
];

export function pickCategoryCoverFallback(
  category: string,
  seed: string
): string {
  const pool = NASA_POOL[category] ?? DEFAULT_POOL;
  const hash = createHash("sha1").update(seed).digest("hex");
  const idx = parseInt(hash.slice(0, 8), 16) % pool.length;
  return pool[idx] ?? DEFAULT_POOL[0];
}

/** Główny fallback kart (search, cover onError). */
export const DEFAULT_COVER_FALLBACK = DEFAULT_POOL[0];
