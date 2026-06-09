import type { ExternalFeedConfig } from "@/lib/rss/types";

/**
 * Per-feed cap per cron run. Default 5 = kilka nowych na feed, nie setki.
 * Jednorazowy backfill: RSS_ITEMS_PER_FEED=30 w .env, potem usuń / wróć do 5.
 */
export const RSS_ITEMS_PER_FEED = Math.min(
  50,
  Math.max(1, Number(process.env.RSS_ITEMS_PER_FEED) || 5)
);

/** Space news + astronomy/science — bez ogólnego tech (Verge, TC, Ars). */
export const EXTERNAL_RSS_FEEDS: ExternalFeedConfig[] = [
  // SPACE NEWS
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
    id: "spacecom",
    url: "https://www.space.com/feeds/all",
    source: "Space.com",
    bucket: "space",
  },
  // ASTRONOMY / SCIENCE
  {
    id: "noirlab",
    url: "https://noirlab.edu/public/news/feed/",
    source: "NOIRLab",
    bucket: "science",
  },
  {
    id: "phys-space",
    url: "https://phys.org/rss-feed/space-news/",
    source: "Phys.org",
    bucket: "science",
  },
  /** Preprinty — egzoplanety / astrofizyka stelarna (węższe niż całe astro-ph). */
  {
    id: "arxiv-astro-ph-ep",
    url: "https://rss.arxiv.org/rss/astro-ph.EP",
    source: "arXiv",
    bucket: "science",
  },
];
