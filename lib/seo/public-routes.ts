/** Public paths that belong in sitemap.xml (indexable, real content). */
export const SEO_SITEMAP_PATHS = [
  "/",
  "/aktualnosci",
  "/misje",
  "/astronomia",
  "/nauka",
  "/technologie",
  "/iss",
  "/ziemia-z-kosmosu",
  // Brand/agency hubs
  "/nasa",
  "/spacex",
  "/esa",
  "/jwst",
  // Topic hubs
  "/hubble",
  "/czarne-dziury",
  "/egzoplanety",
  "/mars",
  "/ksiezyc",
  "/blue-origin",
  "/starlink",
  "/artemis",
  "/ciemna-materia",
  "/stacja-kosmiczna",
  "/polityka-prywatnosci",
  "/kontakt",
  "/starty",
  "/mapa",
  "/galeria",
  "/wideo",
  "/zorza",
] as const;

/** Utility — poza sitemap, noindex. */
export const SEO_NOINDEX_PUBLIC_PATHS = ["/search", "/rss"] as const;
