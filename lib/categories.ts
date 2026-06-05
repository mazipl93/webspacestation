import type { NewsCategory } from "@/types";

export type CategorySlug = NewsCategory;

export type CategoryInfo = {
  label: string;
  color: string;
  href: string;
  description: string;
};

/** Editorial order matches docs/WSS_CONTENT_ARCHITECTURE.md */
export const CATEGORY_INFO: Record<CategorySlug, CategoryInfo> = {
  misje: {
    label: "Misje",
    color: "#2f6dff",
    href: "/misje",
    description: "Załogowe i bezzałogowe misje — NASA, ESA, SpaceX, starty i sondy.",
  },
  astronomia: {
    label: "Astronomia",
    color: "#a855f7",
    href: "/astronomia",
    description: "Odkrycia, teleskopy, egzoplanety i kosmologia.",
  },
  popularnonaukowe: {
    label: "Popularnonaukowe",
    color: "#14b8a6",
    href: "/popularnonaukowe",
    description:
      "Wyjaśnienia i przewodniki evergreen — jak działa kosmos, bez newsów z 24h.",
  },
  technologie: {
    label: "Technologie kosmiczne",
    color: "#38bdf8",
    href: "/technologie",
    description: "Rakiety, satelity, napędy i inżynieria — w tym AI w kontekście kosmosu.",
  },
  iss: {
    label: "ISS i załogi",
    color: "#ffb830",
    href: "/iss",
    description: "Międzynarodowa Stacja Kosmiczna — załogi, eksperymenty i EVA.",
  },
  "ziemia-z-kosmosu": {
    label: "Ziemia z kosmosu",
    color: "#22c55e",
    href: "/ziemia-z-kosmosu",
    description: "Obserwacje Ziemi, pogoda kosmiczna i klimat z orbity.",
  },
  rozrywka: {
    label: "Rozrywka",
    color: "#f472b6",
    href: "/rozrywka",
    description: "Gry, filmy i sci-fi — dodatek, nie rdzeń serwisu.",
  },
};

const FALLBACK: CategoryInfo = {
  label: "Aktualności",
  color: "#2f6dff",
  href: "/aktualnosci",
  description: "",
};

export function getCategoryInfo(slug: string): CategoryInfo {
  return CATEGORY_INFO[slug as CategorySlug] ?? { ...FALLBACK, label: slug };
}

/** Category-tinted placeholder when a cover image fails to load. */
export const CATEGORY_FALLBACK_BG: Record<string, string> = {
  misje: `
    radial-gradient(ellipse at 50% 92%, rgba(255,130,30,0.72) 0%, rgba(225,70,0,0.34) 15%, transparent 40%),
    linear-gradient(180deg, #060c16 0%, #0a1320 52%, #07090c 100%)`,
  astronomia: `
    radial-gradient(ellipse at 56% 46%, rgba(168,20,240,0.46) 0%, rgba(90,10,205,0.22) 28%, transparent 56%),
    linear-gradient(135deg, #05070f 0%, #0b0514 100%)`,
  popularnonaukowe: `
    radial-gradient(ellipse at 48% 42%, rgba(20,184,166,0.44) 0%, transparent 52%),
    linear-gradient(145deg, #041210 0%, #061018 100%)`,
  technologie: `
    radial-gradient(ellipse at 50% 94%, rgba(90,140,255,0.34) 0%, transparent 36%),
    linear-gradient(160deg, #050a13 0%, #070e1a 100%)`,
  iss: `
    radial-gradient(circle at 66% 44%, rgba(255,184,48,0.42) 0%, rgba(14,52,150,0.22) 32%, transparent 56%),
    linear-gradient(135deg, #0f0a04 0%, #061224 100%)`,
  "ziemia-z-kosmosu": `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)`,
  rozrywka: `
    radial-gradient(ellipse at 55% 40%, rgba(244,114,182,0.42) 0%, transparent 52%),
    linear-gradient(145deg, #120810 0%, #0a0610 100%)`,
};

export function categoryFallbackBg(slug: string): string {
  return CATEGORY_FALLBACK_BG[slug] ?? CATEGORY_FALLBACK_BG.technologie;
}

/** Menu / feed order — docs/WSS_CONTENT_ARCHITECTURE.md */
export const CATEGORY_SLUG_ORDER: readonly CategorySlug[] = [
  "misje",
  "astronomia",
  "popularnonaukowe",
  "technologie",
  "iss",
  "ziemia-z-kosmosu",
  "rozrywka",
] as const;
