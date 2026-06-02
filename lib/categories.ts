import type { NewsCategory } from "@/types";

export type CategorySlug = NewsCategory;

export type CategoryInfo = {
  label: string;
  color: string;
  href: string;
  description: string;
};

export const CATEGORY_INFO: Record<CategorySlug, CategoryInfo> = {
  misje: {
    label: "Misje",
    color: "#2f6dff",
    href: "/misje",
    description: "Eksploracja Księżyca, Marsa i głębokiej przestrzeni kosmicznej.",
  },
  astronomia: {
    label: "Astronomia",
    color: "#a855f7",
    href: "/astronomia",
    description: "Odkrycia teleskopów, galaktyki i tajemnice Wszechświata.",
  },
  technologie: {
    label: "Technologie",
    color: "#38bdf8",
    href: "/technologie",
    description: "Rakiety, satelity i innowacje napędzające erę kosmiczną.",
  },
  "ziemia-z-kosmosu": {
    label: "Ziemia z kosmosu",
    color: "#22c55e",
    href: "/ziemia-z-kosmosu",
    description: "Zdjęcia i obserwacje naszej planety z orbity.",
  },
  iss: {
    label: "ISS",
    color: "#ffb830",
    href: "/iss",
    description: "Życie i badania na Międzynarodowej Stacji Kosmicznej.",
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
  technologie: `
    radial-gradient(ellipse at 50% 94%, rgba(90,140,255,0.34) 0%, transparent 36%),
    linear-gradient(160deg, #050a13 0%, #070e1a 100%)`,
  "ziemia-z-kosmosu": `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)`,
  iss: `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)`,
};

export function categoryFallbackBg(slug: string): string {
  return CATEGORY_FALLBACK_BG[slug] ?? CATEGORY_FALLBACK_BG.technologie;
}
