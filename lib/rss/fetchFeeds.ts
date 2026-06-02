import Parser from "rss-parser";
import { EXTERNAL_RSS_FEEDS, RSS_ITEMS_PER_FEED } from "@/lib/rss/feeds-config";
import { normalizeFeedItem } from "@/lib/rss/normalize";
import type { FetchFeedsResult, NormalizedRssItem } from "@/lib/rss/types";

const parser = new Parser({
  timeout: 20_000,
  headers: {
    "User-Agent": "WSS-News-Engine/1.0 (+https://webspacestation.pl)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

type RawRssItem = {
  title?: string;
  link?: string;
  guid?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
  enclosure?: { url?: string; type?: string };
};

async function fetchSingleFeed(
  feedConfig: (typeof EXTERNAL_RSS_FEEDS)[number]
): Promise<{ items: NormalizedRssItem[]; error?: string }> {
  try {
    const parsed = await parser.parseURL(feedConfig.url);
    const items: NormalizedRssItem[] = [];

    for (const raw of (parsed.items as RawRssItem[]).slice(0, RSS_ITEMS_PER_FEED)) {
      const normalized = normalizeFeedItem(raw, feedConfig);
      if (normalized) items.push(normalized);
    }

    return { items };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { items: [], error: message };
  }
}

/**
 * Fetches and normalizes the latest items from all configured external feeds.
 * Does not write to the database — see `runNewsEngineIngest`.
 */
export async function fetchFeeds(): Promise<FetchFeedsResult> {
  const results = await Promise.all(
    EXTERNAL_RSS_FEEDS.map(async (feed) => {
      const result = await fetchSingleFeed(feed);
      return { feedId: feed.id, ...result };
    })
  );

  const items: NormalizedRssItem[] = [];
  const errors: FetchFeedsResult["errors"] = [];
  const seenUrls = new Set<string>();

  for (const result of results) {
    if (result.error) {
      errors.push({ feedId: result.feedId, message: result.error });
    }
    for (const item of result.items) {
      if (seenUrls.has(item.originalUrl)) continue;
      seenUrls.add(item.originalUrl);
      items.push(item);
    }
  }

  items.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return { items, errors };
}
