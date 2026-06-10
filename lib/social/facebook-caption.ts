import { stripHtml } from "@/lib/rss/normalize";

type CaptionInput = {
  title: string;
  excerpt?: string | null;
  subtitle?: string | null;
  content?: string | string[] | null;
};

const MAX_CAPTION = 2000;
const MIN_LEAD_CHARS = 40;

/** Remove emoji and long dashes — editorial social copy, not AI filler. */
export function sanitizeSocialText(text: string): string {
  return text
    .replace(/[\u2013\u2014\u2015\u2212]/g, "-")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function contentParts(content: string | string[]): string[] {
  if (Array.isArray(content)) return content;
  return content.split(/\n\s*\n/);
}

/** First substantive paragraph from article body — preferred for share-card / FB lead. */
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

/** Post text on Facebook — title, lead from article body, link at the end. */
export function buildFacebookCaption(
  article: CaptionInput,
  articleUrl: string,
): string {
  const lead = extractSocialLead(article);
  const lines = [sanitizeSocialText(article.title.trim())];

  if (lead) {
    lines.push("", lead);
  }

  lines.push("", `Czytaj więcej: ${articleUrl}`);

  return lines.join("\n").slice(0, MAX_CAPTION);
}
export function truncateForShareCard(
  text: string,
  max: number,
): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}
