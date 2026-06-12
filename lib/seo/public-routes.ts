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
  "/rozrywka",
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
  "/rss",
  "/polityka-prywatnosci",
  "/kontakt",
  "/starty",
  "/kalendarz",
  "/mapa",
  "/galeria",
  "/wideo",
] as const;

/** Utility — poza sitemap. */
export const SEO_NOINDEX_PUBLIC_PATHS = ["/search"] as const;
