import { ArticleContentKind } from "@prisma/client";
import { validateContentKindForCategory } from "./content-kind";

export type ContentKindInferInput = {
  categorySlug: string;
  title: string;
  excerpt?: string | null;
  readingTime?: number | null;
};

export type ContentKindInferResult = {
  kind: ArticleContentKind;
  reason: string;
};

const GUIDE_RE =
  /\b(przewodnik|poradnik|krok po kroku|jak obserwować|jak obserwowac|jak zobaczyć|jak zobaczyc|gdzie zobaczyć|gdzie zobaczyc|instrukcja|tutorial|faq)\b/i;

const EXPLICIT_ANALYSIS_RE =
  /\b(nowa analiza|hipotez[aąę]|zaskakując[aą]|zaskakujac[aą])\b/i;

const ANALYSIS_PHRASE_RE =
  /\b(co wiemy|co dalej|co oznacza|co to oznacza|nowe badanie sugeruje|finalizują plan|finalizuja plan)\b/i;

const ANALYSIS_TITLE_RE =
  /(rozwiązał zagadk|rozwiazał zagadk|rozwiązuje jedną|rozwiazuje jedna|najbardziej szczegółową mapę|najbardziej szczegolowa mape|obserwowali ten sam|przez 10 lat|który łamie granice|ktory lamie granice|czy .+ pomylił|kandydat na pozostałość|kandydat na pozostalosc|pokazana jak nigdy wcześniej|pokazana jak nigdy wczesniej)/i;

const INTERPRETIVE_QUESTION_RE = /czy .+\?/i;

/** Strong event / announcement — prefer NEWS over ANALYSIS for long RSS-style titles. */
const BREAKING_NEWS_RE =
  /\b(ogłosi|oglosi|ogłoszon|ogloszon|wystartowa|wyniesion|wyniesi|zadokowa|dostarczy|dostarczyła|flight \d+|rekord:|rekordowy start|zamyka misj|zamyka maven|deklaracja po|wznawia start|gotowa do startu|mija ziemi|eksplodowa|przesyła pierwsze|pierwsze zdjęcie całego|pierwsze zdjecie calego|transmituje pierwszy|10-43 wyniesion|build 2026|pierwszy taki sygnał|pierwszy taki sygnal|wykrył metan|wykryl metan|odkryto egzoplanet|odkryto egzoplanetę|odkryto egzoplanete)\b/i;

function haystack(input: ContentKindInferInput): string {
  return `${input.title} ${input.excerpt ?? ""}`.trim();
}

function isGuide(input: ContentKindInferInput): boolean {
  // Title only — excerpt may contain „półprzewodników” (false „przewodnik”).
  return GUIDE_RE.test(input.title);
}

function isExplicitAnalysis(input: ContentKindInferInput): boolean {
  const h = haystack(input);
  return (
    EXPLICIT_ANALYSIS_RE.test(h) ||
    ANALYSIS_PHRASE_RE.test(h) ||
    ANALYSIS_TITLE_RE.test(input.title) ||
    INTERPRETIVE_QUESTION_RE.test(input.title)
  );
}

function isDeepFeature(input: ContentKindInferInput): boolean {
  const rt = input.readingTime ?? 0;
  const h = haystack(input);
  if (BREAKING_NEWS_RE.test(h)) return false;

  if (input.categorySlug === "technologie" && rt >= 7) {
    return /\b(google|internet kwantowy|silnik|umowa|teleportacj|majorana)\b/i.test(h);
  }

  if (input.categorySlug === "misje" && rt >= 7) {
    return /\b(eksperyment|nauki|gateway|budżet|budzet|stracił|stracil)\b/i.test(h);
  }

  if (input.categorySlug === "astronomia" && rt >= 6) {
    return /\b(mapę|mape|dekady|pyłowy kapelusz|niezwykłych szczegółach)\b/i.test(h);
  }

  return false;
}

/**
 * Rule-based editorial classifier for backfill and CMS hints.
 * Nauka is always EVERGREEN or GUIDE per content architecture.
 */
export function inferContentKindForArticle(
  input: ContentKindInferInput,
): ContentKindInferResult {
  if (input.categorySlug === "nauka") {
    if (isGuide(input)) {
      return { kind: ArticleContentKind.GUIDE, reason: "nauka + przewodnik/poradnik" };
    }
    return { kind: ArticleContentKind.EVERGREEN, reason: "nauka = wiedza na lata" };
  }

  if (isGuide(input)) {
    return { kind: ArticleContentKind.GUIDE, reason: "format przewodnika" };
  }

  if (isExplicitAnalysis(input) || isDeepFeature(input)) {
    return { kind: ArticleContentKind.ANALYSIS, reason: "analiza / feature z kontekstem" };
  }

  return { kind: ArticleContentKind.NEWS, reason: "aktualność (domyślnie)" };
}

export function inferContentKindValidated(
  input: ContentKindInferInput,
): ContentKindInferResult {
  const inferred = inferContentKindForArticle(input);
  const check = validateContentKindForCategory(input.categorySlug, inferred.kind);
  if (check.ok) return inferred;

  if (input.categorySlug === "nauka") {
    return { kind: ArticleContentKind.EVERGREEN, reason: "fallback nauka → evergreen" };
  }
  return { kind: ArticleContentKind.NEWS, reason: "fallback → news" };
}
