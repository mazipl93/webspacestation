import type { ExternalFeedConfig } from "@/lib/rss/types";

/**
 * Per-feed cap per cron run. Default 5 = kilka nowych na feed, nie setki.
 * Jednorazowy backfill: RSS_ITEMS_PER_FEED=30 w .env, potem usuń / wróć do 5.
 */
export const RSS_ITEMS_PER_FEED = Math.min(
  50,
  Math.max(1, Number(process.env.RSS_ITEMS_PER_FEED) || 5)
);

export const EXTERNAL_RSS_FEEDS: ExternalFeedConfig[] = [
  // TECH
  {
    id: "techcrunch",
    url: "https://techcrunch.com/feed/",
    source: "TechCrunch",
    bucket: "tech",
  },
  {
    id: "theverge",
    url: "https://www.theverge.com/rss/index.xml",
    source: "The Verge",
    bucket: "tech",
  },
  {
    id: "arstechnica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
    source: "Ars Technica",
    bucket: "tech",
  },
  // SCIENCE / SPACE
  {
    id: "nasa",
    url: "https://www.nasa.gov/news-release/feed/",
    source: "NASA",
    bucket: "space",
  },
  {
    id: "esa",
    url: "https://www.esa.int/rssfeed/Our_Activities/Space_News",
    source: "ESA",
    bucket: "space",
  },
  {
    id: "spacenews",
    url: "https://spacenews.com/feed/",
    source: "SpaceNews",
    bucket: "space",
  },
  {
    id: "phys-space",
    url: "https://phys.org/rss-feed/space-news/",
    source: "Phys.org",
    bucket: "science",
  },
  {
    id: "phys-tech",
    url: "https://phys.org/rss-feed/technology-news/",
    source: "Phys.org",
    bucket: "science",
  },
];
