import { RSS_RAW_SUBTITLE_MARKER } from "@/lib/rss/pipeline";

const LEGACY_AGGREGATOR_MARKERS = /agregat\s+WSS|tłumaczenie\s+automatyczne/i;

export function hasLegacyAggregatorSubtitle(subtitle?: string | null): boolean {
  if (!subtitle?.trim()) return false;
  if (subtitle.includes(RSS_RAW_SUBTITLE_MARKER)) return true;
  if (LEGACY_AGGREGATOR_MARKERS.test(subtitle)) return true;
  if (/^Ze świata\s*·/i.test(subtitle.trim())) return true;
  return false;
}

/** Publisher name from DB or old subtitle patterns (The Verge - agregat WSS …). */
export function inferRssSource(article: {
  source?: string | null;
  subtitle?: string | null;
}): string | null {
  const fromDb = article.source?.trim();
  if (fromDb) return fromDb;

  const sub = article.subtitle?.trim() ?? "";
  const dash = sub.match(/^(.+?)\s*-\s*agregat\s+WSS/i);
  if (dash?.[1]) return dash[1].trim();

  const dot = sub.match(/^(.+?)\s*·\s*agregat/i);
  if (dot?.[1]) return dot[1].trim();

  const ze = sub.match(/Ze świata\s*·\s*(.+)$/i);
  if (ze?.[1]) return ze[1].trim();

  return null;
}

export function isRssAggregatorArticle(article: {
  source?: string | null;
  originalUrl?: string | null;
  subtitle?: string | null;
}): boolean {
  const url = article.originalUrl?.trim();
  const source = inferRssSource(article);

  if (url && source) return true;
  if (url && hasLegacyAggregatorSubtitle(article.subtitle)) return true;
  if (source && hasLegacyAggregatorSubtitle(article.subtitle)) return true;

  return Boolean(article.source?.trim() && url);
}
