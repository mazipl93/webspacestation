import { ArticleContentKind } from "@prisma/client";

/**
 * Editorial format — orthogonal to `contentOrigin` (RSS/EDITORIAL) and category slug.
 * Drives news sitemap (NEWS + ANALYSIS, ≤48h) and Nauka publish rules.
 */
export const ARTICLE_CONTENT_KINDS: readonly ArticleContentKind[] = [
  ArticleContentKind.NEWS,
  ArticleContentKind.ANALYSIS,
  ArticleContentKind.EVERGREEN,
  ArticleContentKind.GUIDE,
] as const;

export const CONTENT_KIND_LABELS: Record<ArticleContentKind, string> = {
  [ArticleContentKind.NEWS]: "Aktualność",
  [ArticleContentKind.ANALYSIS]: "Analiza",
  [ArticleContentKind.EVERGREEN]: "Evergreen (wiedza)",
  [ArticleContentKind.GUIDE]: "Przewodnik",
};

export const CONTENT_KIND_HINTS: Record<ArticleContentKind, string> = {
  [ArticleContentKind.NEWS]: "Fakt z ostatnich dni — misje, odkrycia, starty.",
  [ArticleContentKind.ANALYSIS]: "Komentarz lub rozwinięcie bieżącego tematu.",
  [ArticleContentKind.EVERGREEN]: "Wiedza na lata — głównie dział Nauka.",
  [ArticleContentKind.GUIDE]: "Poradnik krok po kroku lub FAQ tematyczne.",
};

/** Included in `/sitemaps/news.xml` (with 48h window). */
export const FRESH_CONTENT_KINDS: readonly ArticleContentKind[] = [
  ArticleContentKind.NEWS,
  ArticleContentKind.ANALYSIS,
] as const;

export function isArticleContentKind(value: unknown): value is ArticleContentKind {
  return (
    typeof value === "string" &&
    (ARTICLE_CONTENT_KINDS as readonly string[]).includes(value)
  );
}

export function isFreshContentKind(kind: ArticleContentKind): boolean {
  return (FRESH_CONTENT_KINDS as readonly ArticleContentKind[]).includes(kind);
}

/** Sensible default when category changes in CMS. */
export function defaultContentKindForCategory(
  categorySlug: string,
): ArticleContentKind {
  return categorySlug === "nauka"
    ? ArticleContentKind.EVERGREEN
    : ArticleContentKind.NEWS;
}

export type ContentKindValidation =
  | { ok: true }
  | { ok: false; message: string };

/** Nauka = 100% evergreen/guide per content architecture. */
export function validateContentKindForCategory(
  categorySlug: string,
  contentKind: ArticleContentKind,
): ContentKindValidation {
  if (
    categorySlug === "nauka" &&
    (contentKind === ArticleContentKind.NEWS ||
      contentKind === ArticleContentKind.ANALYSIS)
  ) {
    return {
      ok: false,
      message:
        "Dział Nauka: wybierz Evergreen lub Przewodnik. Aktualności publikuj w Misjach, Astronomii, ISS itd.",
    };
  }
  return { ok: true };
}
