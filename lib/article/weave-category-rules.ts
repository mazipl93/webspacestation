import type { NewsCategory } from "@/types";

/**
 * Weave (in-body „polecamy lekturę”) — reguły per dział.
 * Fundament: docs/WSS_CONTENT_ARCHITECTURE.md
 *
 * Zasada: najpierw ten sam dział → potem sąsiednie kosmos/nauka → nigdy Rozrywka
 * w działach redakcyjnych.
 */
export const WEAVE_DENIED_TARGETS: Partial<
  Record<NewsCategory, readonly NewsCategory[]>
> = {
  nauka: ["rozrywka"],
  misje: ["rozrywka"],
  astronomia: ["rozrywka"],
  technologie: ["rozrywka"],
  iss: ["rozrywka"],
  "ziemia-z-kosmosu": ["rozrywka"],
};

/**
 * Kolejność fallbacku gdy brak artykułów w tym samym dziale
 * (np. pierwszy artykuł w Nauce → Astronomia, potem Misje…).
 */
export const WEAVE_FALLBACK_ORDER: Partial<
  Record<NewsCategory, readonly NewsCategory[]>
> = {
  nauka: ["astronomia", "misje", "iss", "technologie", "ziemia-z-kosmosu"],
  misje: ["astronomia", "iss", "technologie", "nauka", "ziemia-z-kosmosu"],
  astronomia: ["nauka", "misje", "iss", "technologie", "ziemia-z-kosmosu"],
  technologie: ["misje", "astronomia", "iss", "nauka", "ziemia-z-kosmosu"],
  iss: ["misje", "astronomia", "technologie", "nauka", "ziemia-z-kosmosu"],
  "ziemia-z-kosmosu": [
    "misje",
    "astronomia",
    "iss",
    "technologie",
    "nauka",
  ],
  rozrywka: ["rozrywka", "technologie", "nauka", "astronomia"],
};

/** Warstwy wyboru: [ten sam dział], potem każdy fallback osobno. */
export function getWeaveCategoryTiers(
  sourceCategory: NewsCategory
): NewsCategory[][] {
  const fallback = WEAVE_FALLBACK_ORDER[sourceCategory] ?? [];
  const tiers: NewsCategory[][] = [[sourceCategory]];
  for (const category of fallback) {
    if (category === sourceCategory) continue;
    tiers.push([category]);
  }
  return tiers;
}

export function isWeaveTargetAllowed(
  sourceCategory: NewsCategory,
  candidateCategory: NewsCategory
): boolean {
  const denied = WEAVE_DENIED_TARGETS[sourceCategory];
  if (denied?.includes(candidateCategory)) return false;

  const fallback = WEAVE_FALLBACK_ORDER[sourceCategory];
  if (!fallback) return true;

  const allowed = new Set<NewsCategory>([sourceCategory, ...fallback]);
  return allowed.has(candidateCategory);
}

/** Tie-breaker w obrębie warstwy (tagi/recency nadal w scoreWeaveInternalLinkCandidate). */
export function weaveCategoryAffinityBonus(
  sourceCategory: NewsCategory,
  candidateCategory: NewsCategory
): number {
  if (sourceCategory === candidateCategory) return 4;
  const fallback = WEAVE_FALLBACK_ORDER[sourceCategory];
  if (!fallback) return 0;
  const index = fallback.indexOf(candidateCategory);
  if (index === -1) return 0;
  return Math.max(0, 2.5 - index * 0.35);
}
