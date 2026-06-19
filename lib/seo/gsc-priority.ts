import { INTERACTIVE_TOOLS } from "@/lib/seo/interactive-tools";
import { SEO_SITEMAP_PATHS } from "@/lib/seo/public-routes";
import { RSS_ALL_FEEDS } from "@/lib/rss-feeds";
import { getSiteUrl } from "@/lib/site-url";

/** Frazy z planu Krok 6 — raport Performance → Search results. */
export const GSC_SEARCH_INTENTS = [
  { query: "zorza polarna dziś", path: "/zorza" },
  { query: "indeks kp", path: "/zorza" },
  { query: "iss tracker", path: "/mapa" },
  { query: "gdzie jest iss", path: "/mapa" },
  { query: "harmonogram startów spacex", path: "/starty" },
  { query: "starty rakiet", path: "/starty" },
  { query: "aktualności kosmiczne", path: "/aktualnosci" },
  { query: "newsy kosmos", path: "/aktualnosci" },
] as const;

/** Narzędzia live + strona główna — pierwsze „Request indexing” w GSC. */
export const GSC_TIER_1_PATHS = [
  "/",
  ...Object.values(INTERACTIVE_TOOLS).map((t) => t.path),
  "/aktualnosci",
] as const;

/** Działy redakcyjne — druga fala indeksacji. */
export const GSC_TIER_2_PATHS = [
  "/misje",
  "/astronomia",
  "/nauka",
  "/technologie",
  "/iss",
  "/ziemia-z-kosmosu",
] as const;

function uniquePaths(paths: readonly string[]): string[] {
  return [...new Set(paths)];
}

/** Huby tematyczne + strony prawne (reszta sitemap). */
export function getGscTier3Paths(): string[] {
  const skip = new Set<string>([
    ...GSC_TIER_1_PATHS,
    ...GSC_TIER_2_PATHS,
    "/polityka-prywatnosci",
    "/kontakt",
  ]);
  return SEO_SITEMAP_PATHS.filter((p) => !skip.has(p));
}

export type GscUrlTier = 1 | 2 | 3 | "all" | "intents";

export type GscUrlEntry = {
  path: string;
  url: string;
  tier: 1 | 2 | 3;
  note?: string;
};

export function buildGscUrlEntries(tier: GscUrlTier = "all"): GscUrlEntry[] {
  const base = getSiteUrl().replace(/\/$/, "");
  const toUrl = (path: string) => `${base}${path === "/" ? "" : path}`;

  const tier1: GscUrlEntry[] = GSC_TIER_1_PATHS.map((path) => ({
    path,
    url: toUrl(path),
    tier: 1 as const,
    note:
      path === "/zorza"
        ? "intencja: zorza polarna dziś, indeks Kp"
        : path === "/mapa"
          ? "intencja: ISS tracker, gdzie jest ISS"
          : path === "/starty"
            ? "intencja: harmonogram startów"
            : undefined,
  }));

  const tier2: GscUrlEntry[] = GSC_TIER_2_PATHS.map((path) => ({
    path,
    url: toUrl(path),
    tier: 2 as const,
  }));

  const tier3: GscUrlEntry[] = getGscTier3Paths().map((path) => ({
    path,
    url: toUrl(path),
    tier: 3 as const,
  }));

  const intentOnly: GscUrlEntry[] = uniquePaths(
    GSC_SEARCH_INTENTS.map((i) => i.path),
  ).map((path) => ({
    path,
    url: toUrl(path),
    tier: 1 as const,
    note: GSC_SEARCH_INTENTS.filter((i) => i.path === path)
      .map((i) => i.query)
      .join(" · "),
  }));

  switch (tier) {
    case 1:
      return tier1;
    case 2:
      return tier2;
    case 3:
      return tier3;
    case "intents":
      return intentOnly;
    case "all":
    default:
      return [...tier1, ...tier2, ...tier3];
  }
}

export function getGscFeedUrls(): string[] {
  const base = getSiteUrl().replace(/\/$/, "");
  return RSS_ALL_FEEDS.map((f) => `${base}${f.path}`);
}

export function getGscSitemapUrl(): string {
  return `${getSiteUrl().replace(/\/$/, "")}/sitemap.xml`;
}
