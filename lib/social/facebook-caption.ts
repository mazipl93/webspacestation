import { stripHtml } from "@/lib/rss/normalize";

type CaptionInput = {
  title: string;
  excerpt?: string | null;
  subtitle?: string | null;
  content?: string | string[] | null;
  /** Article tags from CMS — rendered as clickable FB hashtags in caption. */
  tags?: string[] | null;
};

const MAX_CAPTION = 2000;
const MIN_LEAD_CHARS = 40;
/** Share-card subline — one hook line under the title. */
export const SHARE_CARD_SUBLINE_MAX = 100;

/** CMS paragraph titles use "# " for bold — strip before social / FB copy. */
export function stripCmsHeadingMarker(text: string): string {
  return text.replace(/^#{1,6}\s+/u, "").trim();
}

/** Remove emoji and long dashes — editorial social copy, not AI filler. */
export function sanitizeSocialText(text: string): string {
  return stripCmsHeadingMarker(
    text
      .replace(/[\u2013\u2014\u2015\u2212]/g, "-")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function contentParts(content: string | string[]): string[] {
  if (Array.isArray(content)) return content;
  return content.split(/\n\s*\n/);
}

/** First sentence (`.!?`) — for short share-card subline fallback. */
export function extractFirstSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/u);
  if (match?.[1]) return match[1].trim();

  return trimmed;
}

/**
 * Short hook on share-card image — not the FB post lead.
 * Priority: CMS excerpt/subtitle → first sentence of body lead.
 */
export function extractShareCardSubline(input: CaptionInput): string {
  const excerpt = (input.excerpt ?? input.subtitle ?? "").trim();
  if (excerpt) {
    return fitShareCardLine(sanitizeSocialText(excerpt), SHARE_CARD_SUBLINE_MAX);
  }

  const lead = extractSocialLead(input);
  if (!lead) return "";

  return fitShareCardLine(
    sanitizeSocialText(extractFirstSentence(lead)),
    SHARE_CARD_SUBLINE_MAX,
  );
}

/** First substantive paragraph from article body — FB post lead only. */
export function extractSocialLead(input: CaptionInput): string {
  if (input.content) {
    for (const part of contentParts(input.content)) {
      const text = stripHtml(part).trim();
      if (text.length >= MIN_LEAD_CHARS) {
        return sanitizeSocialText(text);
      }
    }
  }

  const fallback = (input.excerpt ?? input.subtitle ?? "").trim();
  return fallback ? sanitizeSocialText(fallback) : "";
}

/** One CMS tag → Facebook hashtag (# bez spacji, litery PL OK). */
export function formatFacebookHashtag(tag: string): string | null {
  const core = tag.trim().replace(/^#+/u, "").trim();
  if (!core) return null;

  const normalized = core
    .normalize("NFC")
    .split(/\s+/u)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)
    .join("");

  if (normalized.length < 2) return null;
  return `#${normalized}`;
}

/** Space-separated hashtag line from article tags (max 5, deduped). */
export function buildFacebookHashtagLine(tags?: string[] | null): string {
  if (!tags?.length) return "";

  const seen = new Set<string>();
  const hashtags: string[] = [];

  for (const tag of tags) {
    const hashtag = formatFacebookHashtag(tag);
    if (!hashtag) continue;
    const key = hashtag.toLocaleLowerCase("pl-PL");
    if (seen.has(key)) continue;
    seen.add(key);
    hashtags.push(hashtag);
    if (hashtags.length >= 5) break;
  }

  return hashtags.join(" ");
}

/** Post text on Facebook — title, lead, hashtags, link at the end. */
export function buildFacebookCaption(
  article: CaptionInput,
  articleUrl: string,
): string {
  const lead = extractSocialLead(article);
  const hashtagLine = buildFacebookHashtagLine(article.tags);
  const lines = [sanitizeSocialText(article.title.trim())];

  if (lead) {
    lines.push("", lead);
  }

  lines.push("", `Czytaj więcej: ${articleUrl}`);

  if (hashtagLine) {
    lines.push("", hashtagLine);
  }

  return lines.join("\n").slice(0, MAX_CAPTION);
}
/**
 * Fit share-card line without mid-word ellipsis — clip at sentence or word end.
 */
export function fitShareCardLine(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;

  const slice = trimmed.slice(0, maxChars);
  const sentenceEnd = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? "),
    slice.endsWith(".") ? slice.length - 1 : -1,
    slice.endsWith("!") ? slice.length - 1 : -1,
    slice.endsWith("?") ? slice.length - 1 : -1,
  );
  if (sentenceEnd >= Math.floor(maxChars * 0.45)) {
    const end = slice.endsWith(".") || slice.endsWith("!") || slice.endsWith("?")
      ? sentenceEnd + 1
      : sentenceEnd + 1;
    return slice.slice(0, end).trim();
  }

  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace >= Math.floor(maxChars * 0.55)) {
    return slice.slice(0, lastSpace).trim();
  }

  return slice.trimEnd();
}

/** Tiny labels only (e.g. photo credit) — ellipsis OK. */
export function truncateForShareCard(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}
