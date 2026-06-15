import type { MetadataRoute } from "next";
import { INTERACTIVE_TOOLS } from "@/lib/seo/interactive-tools";
import { SEO_SITEMAP_PATHS } from "@/lib/seo/public-routes";
import { getSiteUrl } from "@/lib/site-url";

export const SITEMAP_PAGES_SEGMENT = "pages";
export const SITEMAP_ARTICLES_SEGMENT = "articles";

export function sitemapChildPath(segment: string): string {
  return `/sitemaps/${segment}.xml`;
}

export function buildSitemapIndexLocations(): string[] {
  const base = getSiteUrl().replace(/\/$/, "");
  return [
    `${base}${sitemapChildPath(SITEMAP_PAGES_SEGMENT)}`,
    `${base}${sitemapChildPath(SITEMAP_ARTICLES_SEGMENT)}`,
  ];
}

export function buildPagesSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  const base = getSiteUrl().replace(/\/$/, "");

  const toolPriorityByPath = Object.fromEntries(
    Object.values(INTERACTIVE_TOOLS).map((t) => [t.path, t.sitemapPriority]),
  ) as Record<string, number>;
  const toolFrequencyByPath = Object.fromEntries(
    Object.values(INTERACTIVE_TOOLS).map((t) => [t.path, t.sitemapChangeFrequency]),
  ) as Record<string, MetadataRoute.Sitemap[number]["changeFrequency"]>;

  return SEO_SITEMAP_PATHS.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency:
      toolFrequencyByPath[path]
      ?? (path === "/" ? "hourly" : "daily"),
    priority:
      toolPriorityByPath[path]
      ?? (path === "/" ? 1
      : path === "/aktualnosci" ? 0.9
      : ["/nasa", "/spacex", "/esa", "/jwst"].includes(path) ? 0.85
      : 0.7),
  }));
}

export async function buildArticlesSitemapEntries(
  now = new Date(),
): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");

  try {
    const { getPublishedSitemapEntries } = await import("@/lib/server/articles");
    const articles = await getPublishedSitemapEntries();
    return articles.map((article) => ({
      url: `${base}/aktualnosci/${article.slug}`,
      lastModified: article.updatedAt ?? article.publishedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap] failed to load articles", error);
    return [];
  }
}

type SitemapXmlEntry = MetadataRoute.Sitemap[number];

function formatLastMod(value: SitemapXmlEntry["lastModified"]): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderUrlsetXml(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map((entry) => {
      const lastmod = formatLastMod(entry.lastModified);
      const changefreq = entry.changeFrequency;
      const priority =
        typeof entry.priority === "number" ? entry.priority.toFixed(1) : undefined;

      return [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
        priority ? `    <priority>${priority}</priority>` : null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("\n");
}

export function renderSitemapIndexXml(locations: string[], lastmod = new Date()): string {
  const stamp = lastmod.toISOString();
  const body = locations
    .map(
      (loc) =>
        [
          "  <sitemap>",
          `    <loc>${escapeXml(loc)}</loc>`,
          `    <lastmod>${stamp}</lastmod>`,
          "  </sitemap>",
        ].join("\n"),
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</sitemapindex>",
  ].join("\n");
}

export function sitemapXmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
