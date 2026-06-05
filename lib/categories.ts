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
    description: "Starty rakiet i misje kosmiczne.",
  },
  astronomia: {
    label: "Astronomia",
    color: "#a855f7",
    href: "/astronomia",
    description: "Teleskopy, galaktyki i odkrycia we Wszechświecie.",
  },
  nauka: {
    label: "Nauka",
    color: "#14b8a6",
    href: "/nauka",
    description: "Jak działa kosmos — fizyka, astronomia i technologie orbitalne.",
  },
  technologie: {
    label: "Technologie",
    color: "#38bdf8",
    href: "/technologie",
    description: "Rakiety, satelity, teleskopy i innowacje kosmiczne.",
  },
  iss: {
    label: "ISS",
    color: "#ffb830",
    href: "/iss",
    description: "Międzynarodowa Stacja Kosmiczna — załogi, eksperymenty i EVA.",
  },
  "ziemia-z-kosmosu": {
    label: "Ziemia z kosmosu",
    color: "#22c55e",
    href: "/ziemia-z-kosmosu",
    description: "Ziemia z orbity — pogoda, klimat i zjawiska naturalne.",
  },
  rozrywka: {
    label: "Rozrywka",
    color: "#f472b6",
    href: "/rozrywka",
    description: "Sci-fi, gry, filmy i seriale o kosmosie.",
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
  nauka: `
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

/** Legacy slugs merged into Nauka — hidden in editor when `nauka` row exists. */
export const NAUKA_LEGACY_SLUGS = [
  "popularnonaukowe",
  "wyjasniamy",
  "wiedza",
] as const;

/** Slugs excluded from article editor (redirects / merged on site). */
export const EDITOR_EXCLUDED_SLUGS = ["ai", ...NAUKA_LEGACY_SLUGS] as const;

/**
 * CMS article editor — same departments as nav / docs/WSS_CONTENT_ARCHITECTURE.md.
 * Labels from CATEGORY_INFO; only CATEGORY_SLUG_ORDER; legacy Nauka slug as fallback.
 */
export function prepareCategoriesForEditor<
  T extends { id: string; slug: string; name: string },
>(categories: T[]): T[] {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  const resolveNauka = (): T | undefined => {
    const direct = bySlug.get("nauka");
    if (direct) return direct;
    for (const legacy of NAUKA_LEGACY_SLUGS) {
      const row = bySlug.get(legacy);
      if (row) return row;
    }
    return undefined;
  };

  const nauka = resolveNauka();
  const out: T[] = [];

  for (const slug of CATEGORY_SLUG_ORDER) {
    if (slug === "nauka") {
      if (nauka) {
        out.push({ ...nauka, name: CATEGORY_INFO.nauka.label });
      }
      continue;
    }
    const row = bySlug.get(slug);
    if (!row) continue;
    out.push({ ...row, name: CATEGORY_INFO[slug].label });
  }

  return out;
}

/** @deprecated Use prepareCategoriesForEditor — keeps unknown slugs at the end. */
export function sortCategoriesForEditor<
  T extends { slug: string; orderIndex: number },
>(categories: T[]): T[] {
  const order = new Map(CATEGORY_SLUG_ORDER.map((slug, index) => [slug, index]));
  return [...categories].sort((a, b) => {
    const ai = order.get(a.slug as CategorySlug) ?? a.orderIndex + 100;
    const bi = order.get(b.slug as CategorySlug) ?? b.orderIndex + 100;
    return ai - bi;
  });
}

export const CATEGORY_EDITOR_HINTS: Partial<Record<CategorySlug, string>> = {
  nauka:
    "Tylko evergreeny i przewodniki (fizyka, chemia, kosmos od podstaw). Bez newsów z 24h.",
  misje: "Newsy i analizy misji — nie wrzucaj tu „Jak działa rakieta?” (to Nauka).",
  rozrywka: "Sci-fi, gry i filmy z kosmosem — nie ogólny gaming off-topic.",
};

/** Menu / feed order — docs/WSS_CONTENT_ARCHITECTURE.md */
export const CATEGORY_SLUG_ORDER: readonly CategorySlug[] = [
  "misje",
  "astronomia",
  "nauka",
  "technologie",
  "iss",
  "ziemia-z-kosmosu",
  "rozrywka",
] as const;

/** Homepage department rows (bez Nauki — ma osobną sekcję „Polecane z Nauki”). */
export const HOMEPAGE_DEPARTMENT_SLUGS: readonly CategorySlug[] = [
  "misje",
  "astronomia",
  "iss",
  "ziemia-z-kosmosu",
  "technologie",
  "rozrywka",
] as const;
