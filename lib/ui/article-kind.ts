/**
 * UI-only article kind labels — never use contentOrigin for display decisions.
 * UX lock (PR6.1): only these two concepts may appear in CMS/public copy.
 */

export const EDITORIAL_ARTICLE_LABEL = "Artykuł redakcyjny";
export const EXTERNAL_SOURCE_LABEL = "Źródło zewnętrzne";

export function hasExternalSource(
  sourceName?: string | null,
  sourceUrl?: string | null
): boolean {
  return Boolean(sourceName?.trim() && sourceUrl?.trim());
}

export function articleKindLabel(
  sourceName?: string | null,
  sourceUrl?: string | null
): typeof EDITORIAL_ARTICLE_LABEL | typeof EXTERNAL_SOURCE_LABEL {
  return hasExternalSource(sourceName, sourceUrl)
    ? EXTERNAL_SOURCE_LABEL
    : EDITORIAL_ARTICLE_LABEL;
}
