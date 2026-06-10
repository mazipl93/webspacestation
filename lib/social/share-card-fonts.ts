import type { Font } from "next/dist/compiled/@vercel/og/satori";

const INTER_SEMIBOLD =
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf";
const INTER_EXTRABOLD =
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf";

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Share card font fetch failed (${res.status}): ${url}`);
  }
  return res.arrayBuffer();
}

let fontsPromise: Promise<Font[]> | null = null;

/** Fonts for ImageResponse — Inter (body copy). Cached per lambda instance. */
export function loadShareCardFonts(): Promise<Font[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetchFont(INTER_SEMIBOLD),
      fetchFont(INTER_EXTRABOLD),
    ]).then(([interSemiBold, interExtraBold]) => [
      { name: "Inter", data: interSemiBold, weight: 600, style: "normal" },
      { name: "Inter", data: interExtraBold, weight: 800, style: "normal" },
    ]);
  }
  return fontsPromise;
}
