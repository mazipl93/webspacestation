import { getSiteUrl } from "@/lib/site-url";
import { resolvePageOgImage } from "@/lib/seo/page-og-registry";

export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_ALT =
  "Web Space Station — portal informacyjny o kosmosie, astronomii i technologiach kosmicznych";

/** Domyślna okładka OG (app/opengraph-image.tsx), fallback gdy brak wpisu w rejestrze. */
export function getDefaultOgImageUrl(): string {
  return `${getSiteUrl()}/opengraph-image`;
}

/** Per-page OG image URL from registry (hybrid: photo + branded overlay via /og/[id]). */
export function getPageOgImageForPath(path: string) {
  return resolvePageOgImage(path);
}
