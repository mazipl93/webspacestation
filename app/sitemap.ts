import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/server/articles";
import { SEO_SITEMAP_PATHS } from "@/lib/seo/public-routes";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = SEO_SITEMAP_PATHS.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "hourly" : "daily",
    priority: path === "/" ? 1 : path === "/aktualnosci" ? 0.9 : 0.7,
  }));

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const articles = await getPublishedArticles();
    articleEntries = articles.map((a) => ({
      url: `${base}/aktualnosci/${a.slug}`,
      lastModified: a.updatedAt ?? a.publishedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap] failed to load articles", error);
  }

  return [...staticEntries, ...articleEntries];
}
