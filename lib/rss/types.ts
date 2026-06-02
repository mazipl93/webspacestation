/** Editorial buckets used by the News Engine before mapping to DB category slugs. */
export type RssEditorialCategory =
  | "MISJE"
  | "ASTRONOMIA"
  | "TECHNOLOGIE"
  | "AI"
  | "ZIEMIA";

export type RssFeedBucket = "tech" | "space" | "science";

export type ExternalFeedConfig = {
  id: string;
  url: string;
  source: string;
  bucket: RssFeedBucket;
};

export type NormalizedRssItem = {
  title: string;
  slug: string;
  source: string;
  originalUrl: string;
  excerpt: string;
  publishedAt: Date;
  category: RssEditorialCategory;
  coverImage?: string;
};

export type FetchFeedsResult = {
  items: NormalizedRssItem[];
  errors: { feedId: string; message: string }[];
};

export type IngestResult = {
  fetched: number;
  created: number;
  skippedUrl: number;
  skippedTitle: number;
  skippedSlug: number;
  errors: string[];
};
