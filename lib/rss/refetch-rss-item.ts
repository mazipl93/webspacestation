import { fetchFeeds } from "@/lib/rss/fetchFeeds";
import type { NormalizedRssItem } from "@/lib/rss/types";

/** Find latest normalized RSS item matching canonical URL (scans all feeds). */
export async function fetchRssItemByUrl(
  originalUrl: string
): Promise<NormalizedRssItem | null> {
  const target = originalUrl.trim();
  if (!target) return null;

  const { items } = await fetchFeeds();
  return items.find((item) => item.originalUrl === target) ?? null;
}
