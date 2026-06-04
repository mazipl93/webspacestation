import { EDITORIAL_COVER_NASA_ID } from "./editorial-cover-ids";
import { editorialCoverForSlug } from "./nasa-cover";
import {
  isRozrywkaArticleSlug,
  rozrywkaCoverForSlug,
} from "./rozrywka";

/** Hosty / ścieżki, które w 2026 zwracają 404 lub psują Next image optimizer. */
const BROKEN_COVER_PATTERN =
  /nasa\.gov\/wp-content|assets\.science\.nasa\.gov|esa\.int\/var\/esa\/storage|apod\.nasa\.gov\/apod\/image|images\.unsplash\.com/i;

export function isBrokenCoverUrl(url: string | null | undefined): boolean {
  const u = url?.trim();
  if (!u) return false;
  return BROKEN_COVER_PATTERN.test(u);
}

export function isEditorialCoverSlug(slug: string | undefined): slug is string {
  return Boolean(slug && slug in EDITORIAL_COVER_NASA_ID);
}

/** NASA okładka tylko dla 21 slugów redakcyjnych; reszta = coverImage z DB. */
export function resolveEditorialCoverImage(
  slug: string | undefined,
  dbCover: string | null | undefined
): string | null {
  if (isRozrywkaArticleSlug(slug)) {
    const mapped = rozrywkaCoverForSlug(slug);
    if (mapped) return mapped;
    const fromDb = dbCover?.trim() || null;
    if (fromDb && !isBrokenCoverUrl(fromDb)) return fromDb;
    return null;
  }

  if (isEditorialCoverSlug(slug)) {
    return editorialCoverForSlug(slug);
  }

  const fromDb = dbCover?.trim() || null;
  if (!fromDb || isBrokenCoverUrl(fromDb)) return null;
  return fromDb;
}
