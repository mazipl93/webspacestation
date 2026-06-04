/** Public paths that belong in sitemap.xml (indexable, real content). */
export const SEO_SITEMAP_PATHS = [
  "/",
  "/aktualnosci",
  "/misje",
  "/astronomia",
  "/technologie",
  "/ai",
  "/ziemia-z-kosmosu",
  "/iss",
  "/rss",
  "/polityka-prywatnosci",
  "/kontakt",
] as const;

/** Odkrywaj + search — publiczne, ale wyłączone z sitemap (noindex lub utility). */
export const SEO_NOINDEX_PUBLIC_PATHS = [
  "/search",
  "/starty",
  "/kalendarz",
  "/mapa",
  "/galeria",
  "/wideo",
] as const;
