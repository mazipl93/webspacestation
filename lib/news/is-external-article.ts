import { isRssAggregatorArticle } from "@/lib/rss/is-aggregator";

/** RSS / News Engine item — excerpt + link, not full WSS editorial. */
export function isExternalAggregatorArticle(article: {
  source?: string | null;
  originalUrl?: string | null;
  subtitle?: string | null;
}): boolean {
  return isRssAggregatorArticle(article);
}
