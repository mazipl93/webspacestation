import { RSS_RAW_SUBTITLE_MARKER } from "@/lib/rss/pipeline";
import {
  inferRssSource,
  isRssAggregatorArticle as detectRssAggregator,
} from "@/lib/rss/is-aggregator";

export { inferRssSource };

export function isRssAggregatorArticle(article: {
  source?: string | null;
  originalUrl?: string | null;
  subtitle?: string | null;
}): boolean {
  return detectRssAggregator(article);
}

export function isRawRssDraftArticle(article: {
  subtitle?: string | null;
  status?: string;
}): boolean {
  return (
    article.status === "DRAFT" &&
    Boolean(article.subtitle?.includes(RSS_RAW_SUBTITLE_MARKER))
  );
}

/** B+ enriched when lead + body + context exist (new pipeline). Legacy rows may lack body/context. */
export function isAiEnrichedRssArticle(article: {
  subtitle?: string | null;
  source?: string | null;
  originalUrl?: string | null;
  content?: string | null;
  contextNote?: string | null;
}): boolean {
  if (!isRssAggregatorArticle(article)) return false;
  if (isRawRssDraftArticle(article)) return false;
  return Boolean(article.content?.trim() && article.contextNote?.trim());
}

/** Legacy RSS in REVIEW with excerpt only (pre-B+). Still publishable — SAFE MODE. */
export function isLegacyRssReviewArticle(article: {
  subtitle?: string | null;
  status?: string;
  source?: string | null;
  originalUrl?: string | null;
  excerpt?: string | null;
  content?: string | null;
  contextNote?: string | null;
}): boolean {
  if (!isRssAggregatorArticle(article)) return false;
  if (isRawRssDraftArticle(article)) return false;
  if (isAiEnrichedRssArticle(article)) return false;
  return Boolean(article.excerpt?.trim());
}

export function getAdminArticleTags(article: { tags?: string[] }): string[] {
  return (article.tags ?? []).filter((t) => t.trim().length > 0);
}

/** Title for lists — always from DB `title` (PL after AI). */
export function getAdminDisplayTitle(article: { title: string }): string {
  return article.title?.trim() || "—";
}

/** Summary for lists — DB excerpt (= AI summary_pl). */
export function getAdminDisplaySummary(article: {
  excerpt?: string | null;
  title: string;
}): string {
  const excerpt = article.excerpt?.trim();
  if (excerpt) return excerpt;
  return "";
}

export function formatReadingTimeLabel(
  minutes: number | null | undefined
): string | null {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 1) return null;
  return `${Math.round(minutes)} min`;
}

/** Short label for admin links (e.g. spacenews.com). */
export function getRssSourceHostname(url: string): string {
  try {
    return new URL(url.trim()).hostname.replace(/^www\./i, "");
  } catch {
    return url.trim().slice(0, 48) || "link";
  }
}
