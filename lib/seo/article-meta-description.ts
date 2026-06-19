import { buildExcerpt, stripHtml } from "@/lib/rss/normalize";
import type { NewsArticle } from "@/types";

/** Google snippet sweet spot — keep under hard cap. */
export const META_DESCRIPTION_MAX = 160;
export const META_DESCRIPTION_TARGET = 155;
const META_DESCRIPTION_MIN = 40;

export type ArticleMetaDescriptionInput = Pick<
  NewsArticle,
  "title" | "excerpt" | "subtitle" | "content"
>;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForCompare(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[«»„""''`]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Reject empty, too short, or near-duplicate of the page title. */
export function isUsableMetaDescription(
  candidate: string,
  title: string,
): boolean {
  const text = normalizeWhitespace(candidate);
  if (text.length < META_DESCRIPTION_MIN) return false;

  const normalizedCandidate = normalizeForCompare(text);
  const normalizedTitle = normalizeForCompare(title);
  if (!normalizedCandidate || normalizedCandidate === normalizedTitle) {
    return false;
  }

  if (
    normalizedTitle.length >= 24 &&
    normalizedCandidate.startsWith(normalizedTitle) &&
    normalizedCandidate.length - normalizedTitle.length < 24
  ) {
    return false;
  }

  return true;
}

export function trimMetaDescription(
  text: string,
  max = META_DESCRIPTION_MAX,
): string {
  const normalized = normalizeWhitespace(text);
  if (normalized.length <= max) return normalized;

  const slice = normalized.slice(0, max);
  const sentenceEnd = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? "),
  );
  if (sentenceEnd >= Math.floor(max * 0.55)) {
    return normalized.slice(0, sentenceEnd + 1).trim();
  }

  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace >= Math.floor(max * 0.65)) {
    return `${slice.slice(0, lastSpace).trimEnd()}…`;
  }

  return `${slice.trimEnd()}…`;
}

function extractLeadFromContent(content?: string[]): string {
  if (!content?.length) return "";

  const paragraphs = content
    .map((part) => stripHtml(part))
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);

  if (paragraphs.length === 0) return "";

  const joined = paragraphs.join(" ");
  return buildExcerpt(joined) || joined;
}

/**
 * Unique meta / OG description per article.
 * Prefers CMS excerpt; falls back to subtitle or trimmed body — never bare title.
 */
export function buildArticleMetaDescription(
  article: ArticleMetaDescriptionInput,
): string {
  const title = normalizeWhitespace(article.title);
  const excerpt = normalizeWhitespace(article.excerpt ?? "");
  const subtitle = normalizeWhitespace(article.subtitle ?? "");
  const fromContent = extractLeadFromContent(article.content);

  const candidates = [excerpt, subtitle, fromContent].filter(Boolean);

  for (const candidate of candidates) {
    if (isUsableMetaDescription(candidate, title)) {
      return trimMetaDescription(candidate);
    }
  }

  const softFallback = fromContent || subtitle || excerpt;
  if (softFallback) {
    return trimMetaDescription(softFallback);
  }

  return trimMetaDescription(
    `${title} — wiadomości, analizy i wiedza o kosmosie na Web Space Station.`,
  );
}
