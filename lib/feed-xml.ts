import type { NewsArticle } from "@/types";
import { getCategoryInfo } from "@/lib/categories";

const SITE_NAME = "Web Space Station";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRssDate(iso: string): string {
  return new Date(iso).toUTCString();
}

function itemDescription(article: NewsArticle, articleUrl: string): string {
  const excerpt = escapeXml(article.excerpt);
  const link = escapeXml(articleUrl);
  const sourceNote = article.originalUrl
    ? `<p><a href="${escapeXml(article.originalUrl)}">Źródło: ${escapeXml(article.source ?? "oryginał")}</a></p>`
    : "";
  return `<p>${excerpt}</p><p><a href="${link}">Czytaj więcej na ${SITE_NAME}</a></p>${sourceNote}`;
}

export type RssChannelOptions = {
  siteUrl: string;
  feedUrl: string;
  title: string;
  description: string;
  channelLink: string;
  items: NewsArticle[];
};

export function buildRssXml({
  siteUrl,
  feedUrl,
  title,
  description,
  channelLink,
  items,
}: RssChannelOptions): string {
  const lastBuild = items[0]
    ? toRssDate(items[0].publishedAt)
    : toRssDate(new Date().toISOString());

  const itemXml = items
    .map((article) => {
      const cat = getCategoryInfo(article.category);
      const articleUrl = `${siteUrl}/aktualnosci/${article.slug}`;
      const enclosure =
        article.imageUrl.startsWith("http")
          ? `\n      <enclosure url="${escapeXml(article.imageUrl)}" type="image/jpeg" length="0"/>`
          : "";

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(articleUrl)}</link>
      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>
      <pubDate>${toRssDate(article.publishedAt)}</pubDate>
      <description><![CDATA[${itemDescription(article, articleUrl)}]]></description>
      <category>${escapeXml(cat.label)}</category>${enclosure}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(description)}</description>
    <language>pl-PL</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <generator>${SITE_NAME}</generator>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${itemXml}
  </channel>
</rss>`;
}

export const RSS_MAIN_LIMIT = 50;
export const RSS_CATEGORY_LIMIT = 40;

export function rssResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
