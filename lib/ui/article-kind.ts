/**
 * CMS article type (PR7) — from citation fields only; never RSS/contentOrigin in copy.
 * Public layout helpers — contentOrigin (not shown in CMS UI).
 */

export const CMS_EDITORIAL_TYPE_LABEL = "Artykuł";
export const CMS_EXTERNAL_SOURCE_TYPE_LABEL = "Źródło zewnętrzne";

/** CMS Typ column / editor badge — both publisher name and link required. */
export function hasCitationFields(
  sourceName?: string | null,
  sourceUrl?: string | null
): boolean {
  return Boolean(sourceName?.trim() && sourceUrl?.trim());
}

export function cmsArticleTypeLabel(
  sourceName?: string | null,
  sourceUrl?: string | null
): typeof CMS_EDITORIAL_TYPE_LABEL | typeof CMS_EXTERNAL_SOURCE_TYPE_LABEL {
  return hasCitationFields(sourceName, sourceUrl)
    ? CMS_EXTERNAL_SOURCE_TYPE_LABEL
    : CMS_EDITORIAL_TYPE_LABEL;
}

/** Public footer / link — URL only, not article type. */
export function hasSourceAttribution(sourceUrl?: string | null): boolean {
  return Boolean(sourceUrl?.trim());
}

/** Public article layout — backend provenance, never shown as CMS label. */
export function isRssArticle(
  contentOrigin?: string | null
): boolean {
  return contentOrigin === "RSS";
}
