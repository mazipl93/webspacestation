import type { MetadataRoute } from "next";
import { getPublishedSitemapEntries, getPublishedTags } from "@/lib/server/articles";
import { INTERACTIVE_TOOLS } from "@/lib/seo/interactive-tools";
import { SEO_SITEMAP_PATHS } from "@/lib/seo/public-routes";
import { getSiteUrl } from "@/lib/site-url";

// Align with article ISR; refreshed on publish via revalidateTag + revalidatePath.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const toolPriorityByPath = Object.fromEntries(
    Object.values(INTERACTIVE_TOOLS).map((t) => [t.path, t.sitemapPriority]),
  ) as Record<string, number>;
  const toolFrequencyByPath = Object.fromEntries(
    Object.values(INTERACTIVE_TOOLS).map((t) => [t.path, t.sitemapChangeFrequency]),
  ) as Record<string, MetadataRoute.Sitemap[number]["changeFrequency"]>;

  const staticEntries: MetadataRoute.Sitemap = SEO_SITEMAP_PATHS.map((path) => ({
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

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const articles = await getPublishedSitemapEntries();
    articleEntries = articles.map((a) => ({
      url: `${base}/aktualnosci/${a.slug}`,
      lastModified: a.updatedAt ?? a.publishedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap] failed to load articles", error);
  }

  let tagEntries: MetadataRoute.Sitemap = [];
  try {
    const tags = await getPublishedTags();
    tagEntries = tags.map((tag) => ({
      url: `${base}/tag/${tag}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("[sitemap] failed to load tags", error);
  }

  return [...staticEntries, ...articleEntries, ...tagEntries];
}
