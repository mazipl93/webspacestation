import type { Font } from "next/dist/compiled/@vercel/og/satori";

const INTER_REGULAR =
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf";
const INTER_SEMIBOLD =
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf";
const INTER_EXTRABOLD =
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf";

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OG overlay font fetch failed (${res.status}): ${url}`);
  }
  return res.arrayBuffer();
}

let fontsPromise: Promise<Font[]> | null = null;

/** Inter 400/600/800 — ostre fonty w Satori (nie system-ui). */
export function loadOgOverlayFonts(): Promise<Font[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetchFont(INTER_REGULAR),
      fetchFont(INTER_SEMIBOLD),
      fetchFont(INTER_EXTRABOLD),
    ]).then(([regular, semiBold, extraBold]) => [
      { name: "Inter", data: regular, weight: 400, style: "normal" },
      { name: "Inter", data: semiBold, weight: 600, style: "normal" },
      { name: "Inter", data: extraBold, weight: 800, style: "normal" },
    ]);
  }
  return fontsPromise;
}
