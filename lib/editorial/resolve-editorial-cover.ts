import { EDITORIAL_COVER_NASA_ID } from "./editorial-cover-ids";
import { editorialCoverForSlug } from "./nasa-cover";
import { normalizeCoverImageUrl } from "@/lib/media/cover-url";

/**
 * Hosty / ścieżki, które faktycznie psują Next image optimizer
 * (ale NIE blokujemy nasa.gov/wp-content, bo to nasze realne zdjęcia).
 */
const BROKEN_COVER_PATTERN =
  /assets\.science\.nasa\.gov|esa\.int\/var\/esa\/storage|apod\.nasa\.gov\/apod\/image|images\.unsplash\.com/i;

export function isBrokenCoverUrl(url: string | null | undefined): boolean {
  const u = url?.trim();
  if (!u) return false;
  return BROKEN_COVER_PATTERN.test(u);
}

export function isEditorialCoverSlug(slug: string | undefined): slug is string {
  return Boolean(slug && slug in EDITORIAL_COVER_NASA_ID);
}

/**
 * NASA okładka tylko gdy brak coverImage w DB.
 * Jawna okładka z CMS/DB zawsze wygrywa (nawet hosts „broken" dla optimizera).
 */
export function resolveEditorialCoverImage(
  slug: string | undefined,
  dbCover: string | null | undefined
): string | null {
  const fromDb = normalizeCoverImageUrl(dbCover);
  if (fromDb) return fromDb;

  if (isEditorialCoverSlug(slug)) {
    return editorialCoverForSlug(slug);
  }

  return null;
}
