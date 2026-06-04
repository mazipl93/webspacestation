import { EDITORIAL_COVER_NASA_ID } from "./editorial-cover-ids";

export type NasaCoverSize = "thumb" | "medium" | "large";

/**
 * NASA Image Library — domyślnie ~medium.jpg (poziome miniatury pod karty 16:9).
 */
export function nasaCoverUrl(
  nasaId: string,
  size: NasaCoverSize = "medium"
): string {
  const id = nasaId.trim();
  const enc = encodeURIComponent(id);
  return `https://images-assets.nasa.gov/image/${enc}/${enc}~${size}.jpg`;
}

export function editorialCoverForSlug(slug: string): string {
  const id = EDITORIAL_COVER_NASA_ID[slug];
  if (!id) {
    throw new Error(`No NASA cover ID for editorial slug: ${slug}`);
  }
  return nasaCoverUrl(id);
}
