import { getAllArticles } from "@/lib/articles";
import { buildRssXml, RSS_MAIN_LIMIT, rssResponse } from "@/lib/feed-xml";
import { RSS_MAIN_FEED } from "@/lib/rss-feeds";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

export async function GET() {
  const siteUrl = getSiteUrl();
  const feedUrl = `${siteUrl}${RSS_MAIN_FEED.path}`;
  const items = (await getAllArticles()).slice(0, RSS_MAIN_LIMIT);

  const xml = buildRssXml({
    siteUrl,
    feedUrl,
    title: `Web Space Station — ${RSS_MAIN_FEED.title}`,
    description: RSS_MAIN_FEED.description,
    channelLink: `${siteUrl}${RSS_MAIN_FEED.pageHref}`,
    items,
  });

  return rssResponse(xml);
}
