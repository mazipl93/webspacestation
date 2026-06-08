import { getSiteUrl } from "@/lib/site-url";

export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_ALT =
  "Web Space Station — portal informacyjny o kosmosie, astronomii i technologiach kosmicznych";

/** Domyślna okładka OG (app/opengraph-image.tsx). */
export function getDefaultOgImageUrl(): string {
  return `${getSiteUrl()}/opengraph-image`;
}
