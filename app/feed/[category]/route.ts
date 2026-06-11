import { notFound } from "next/navigation";
import { getFeedArticlesByCategory } from "@/lib/articles";
import { getCategoryInfo } from "@/lib/categories";
import { buildRssXml, RSS_CATEGORY_LIMIT, rssResponse } from "@/lib/feed-xml";
import { isCategorySlug, RSS_CATEGORY_FEEDS } from "@/lib/rss-feeds";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

export function generateStaticParams() {
  return RSS_CATEGORY_FEEDS.map(({ id }) => ({ category: id }));
}

type Props = { params: Promise<{ category: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { category } = await params;
  if (!isCategorySlug(category)) notFound();

  const meta = getCategoryInfo(category);
  const siteUrl = getSiteUrl();
  const feedUrl = `${siteUrl}/feed/${category}`;
  const channelLink = `${siteUrl}${meta.href}`;

  try {
    const items = await getFeedArticlesByCategory(category, RSS_CATEGORY_LIMIT);
    const xml = buildRssXml({
      siteUrl,
      feedUrl,
      title: `Web Space Station — ${meta.label}`,
      description: meta.description,
      channelLink,
      items,
    });
    return rssResponse(xml);
  } catch (error) {
    console.error(`[feed/${category}] failed to build RSS`, error);
    const xml = buildRssXml({
      siteUrl,
      feedUrl,
      title: `Web Space Station — ${meta.label}`,
      description: meta.description,
      channelLink,
      items: [],
    });
    return rssResponse(xml);
  }
}
