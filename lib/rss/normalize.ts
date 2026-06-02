import { createHash } from "crypto";
import type { ExternalFeedConfig, NormalizedRssItem } from "@/lib/rss/types";
import { categorizeRssItem } from "@/lib/rss/categorize";

const EXCERPT_MAX = 300;

/** Strip HTML and collapse whitespace from RSS descriptions. */
export function stripHtml(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** First 1–2 sentences, capped at EXCERPT_MAX — not full article body. */
export function buildExcerpt(raw: string): string {
  const text = stripHtml(raw);
  if (!text) return "";

  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [text];
  let excerpt = sentences.slice(0, 2).join(" ").trim();
  if (excerpt.length > EXCERPT_MAX) {
    excerpt = `${excerpt.slice(0, EXCERPT_MAX - 1).trimEnd()}…`;
  }
  return excerpt;
}

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return base || "artykul";
}

export function buildUniqueSlug(title: string, originalUrl: string): string {
  const hash = createHash("sha1").update(originalUrl).digest("hex").slice(0, 8);
  return `${slugifyTitle(title)}-${hash}`;
}

export function normalizeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ąćęłńóśźż]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveItemUrl(
  link?: string,
  guid?: string
): string | null {
  const candidate = (link ?? guid ?? "").trim();
  if (!candidate) return null;
  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate;
  }
  return null;
}

export function resolvePublishedAt(
  iso?: string,
  fallback?: string
): Date {
  const raw = iso ?? fallback;
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

export function pickCoverImage(item: {
  enclosure?: { url?: string; type?: string };
  content?: string;
}): string | undefined {
  if (
    item.enclosure?.url &&
    (item.enclosure.type?.startsWith("image/") ?? true)
  ) {
    return item.enclosure.url;
  }
  const content = item.content ?? "";
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

type ParserItem = {
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

export function normalizeFeedItem(
  item: ParserItem,
  feed: ExternalFeedConfig
): NormalizedRssItem | null {
  const title = stripHtml(item.title ?? "").trim();
  const originalUrl = resolveItemUrl(item.link, item.guid);
  if (!title || !originalUrl) return null;

  const rawDescription =
    item.contentSnippet ?? item.summary ?? item.content ?? "";
  const excerpt = buildExcerpt(rawDescription) || title.slice(0, EXCERPT_MAX);
  const publishedAt = resolvePublishedAt(item.isoDate, item.pubDate);
  const category = categorizeRssItem({
    feed,
    title,
    excerpt,
    rawText: stripHtml(rawDescription),
  });

  return {
    title,
    slug: buildUniqueSlug(title, originalUrl),
    source: feed.source,
    originalUrl,
    excerpt,
    publishedAt,
    category,
    coverImage: pickCoverImage(item),
  };
}

/** CMS / optional dek — czytelny dla redakcji, bez żargonu technicznego. */
export function buildAggregatorSubtitle(source: string): string {
  const name = source.trim() || "źródło zewnętrzne";
  return `Ze świata · ${name}`;
}

/** DB placeholder — real attribution lives in SourceAttribution (UI only). */
export function buildAggregatorContent(
  _source: string,
  _originalUrl: string
): string {
  return "";
}
