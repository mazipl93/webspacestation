import { getSiteUrl } from "@/lib/site-url";

/** Domyślna okładka OG dla stron bez własnego obrazu (homepage, działy). */
export function getDefaultOgImageUrl(): string {
  return `${getSiteUrl()}/icon.svg`;
}
