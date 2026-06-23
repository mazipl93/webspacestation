import type { MetadataRoute } from "next";
import { ArticleContentKind } from "@prisma/client";
import { isFreshContentKind } from "@/lib/articles/content-kind";
import { INTERACTIVE_TOOLS } from "@/lib/seo/interactive-tools";
import { SEO_SITEMAP_PATHS } from "@/lib/seo/public-routes";
import { getSiteUrl } from "@/lib/site-url";

export const SITEMAP_PAGES_SEGMENT = "pages";
export const SITEMAP_ARTICLES_SEGMENT = "articles";
export const SITEMAP_NEWS_SEGMENT = "news";

/** Rolling window for Google News sitemap (hours). */
export const NEWS_SITEMAP_FRESH_HOURS = 48;
export const NEWS_SITEMAP_FRESH_MS = NEWS_SITEMAP_FRESH_HOURS * 60 * 60 * 1000;

export const NEWS_PUBLICATION_NAME = "Web Space Station";
export const NEWS_PUBLICATION_LANGUAGE = "pl";

export type NewsSitemapEntry = {
  slug: string;
  title: string;
  publishedAt: Date;
};

export function newsSitemapCutoff(now: Date): Date {
  return new Date(now.getTime() - NEWS_SITEMAP_FRESH_MS);
}

/** Pure filter — mirrors DB query rules (tests + docs). */
export function matchesFreshNewsSitemapCriteria(
  article: {
    publishedAt: Date | null;
    contentKind: ArticleContentKind;
    categorySlug: string;
  },
  now: Date,
): boolean {
  if (!article.publishedAt) return false;
  if (article.categorySlug === "nauka") return false;
  if (!isFreshContentKind(article.contentKind)) return false;
  const publishedAt = article.publishedAt.getTime();
  const cutoff = newsSitemapCutoff(now).getTime();
  const upper = now.getTime();
  return publishedAt >= cutoff && publishedAt <= upper;
}

export function filterFreshNewsSitemapEntries<T extends NewsSitemapEntry & {
  contentKind: ArticleContentKind;
  categorySlug: string;
}>(
  entries: T[],
  now: Date,
): T[] {
  return entries.filter((entry) =>
    matchesFreshNewsSitemapCriteria(
      {
        publishedAt: entry.publishedAt,
        contentKind: entry.contentKind,
        categorySlug: entry.categorySlug,
      },
      now,
    ),
  );
}

export function sitemapChildPath(segment: string): string {
  return `/sitemaps/${segment}.xml`;
}

export function buildSitemapIndexLocations(): string[] {
  const base = getSiteUrl().replace(/\/$/, "");
  return [
    `${base}${sitemapChildPath(SITEMAP_PAGES_SEGMENT)}`,
    `${base}${sitemapChildPath(SITEMAP_ARTICLES_SEGMENT)}`,
    `${base}${sitemapChildPath(SITEMAP_NEWS_SEGMENT)}`,
  ];
}

/**
 * Paths that never change content — Googlebot shouldn't waste crawl budget
 * re-fetching them on every sitemap regeneration (every 5 min).
 * Everything else (categories, hubs, tools, homepage) gets `now` because
 * it changes whenever an article is published.
 */
const STATIC_PAGE_LAST_MODIFIED: Partial<Record<string, string>> = {
  "/polityka-prywatnosci": "2025-01-01T00:00:00.000Z",
  "/kontakt": "2025-01-01T00:00:00.000Z",
};

export function buildPagesSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  const base = getSiteUrl().replace(/\/$/, "");

  const toolPriorityByPath = Object.fromEntries(
    Object.values(INTERACTIVE_TOOLS).map((t) => [t.path, t.sitemapPriority]),
  ) as Record<string, number>;
  const toolFrequencyByPath = Object.fromEntries(
    Object.values(INTERACTIVE_TOOLS).map((t) => [t.path, t.sitemapChangeFrequency]),
  ) as Record<string, MetadataRoute.Sitemap[number]["changeFrequency"]>;

  return SEO_SITEMAP_PATHS.map((path) => {
    const staticDate = STATIC_PAGE_LAST_MODIFIED[path];
    return {
      url: `${base}${path === "/" ? "" : path}`,
      lastModified: staticDate ? new Date(staticDate) : now,
      changeFrequency:
        toolFrequencyByPath[path]
        ?? (path === "/" ? "hourly" : staticDate ? "yearly" : "daily"),
      priority:
        toolPriorityByPath[path]
        ?? (path === "/" ? 1
        : path === "/aktualnosci" ? 0.9
        : ["/nasa", "/spacex", "/esa", "/jwst"].includes(path) ? 0.85
        : 0.7),
    };
  });
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

export async function buildNewsSitemapEntries(
  now = new Date(),
): Promise<NewsSitemapEntry[]> {
  try {
    const { getFreshNewsSitemapEntries } = await import("@/lib/server/articles");
    return await getFreshNewsSitemapEntries(now);
  } catch (error) {
    console.error("[sitemap] failed to load fresh news", error);
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

export function renderNewsUrlsetXml(entries: NewsSitemapEntry[]): string {
  const base = getSiteUrl().replace(/\/$/, "");
  const urls = entries
    .map((entry) => {
      const loc = `${base}/aktualnosci/${entry.slug}`;
      const publicationDate = entry.publishedAt.toISOString();
      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        "    <news:news>",
        "      <news:publication>",
        `        <news:name>${escapeXml(NEWS_PUBLICATION_NAME)}</news:name>`,
        `        <news:language>${NEWS_PUBLICATION_LANGUAGE}</news:language>`,
        "      </news:publication>",
        `      <news:publication_date>${publicationDate}</news:publication_date>`,
        `      <news:title>${escapeXml(entry.title)}</news:title>`,
        "    </news:news>",
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
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
