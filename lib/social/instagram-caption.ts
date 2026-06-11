import {
  buildFacebookHashtagLine,
  extractSocialLead,
  sanitizeSocialText,
  type CaptionInput,
} from "@/lib/social/facebook-caption";

const MAX_CAPTION = 2200;

/** Instagram caption — no clickable links; URL as plain text + hashtags. */
export function buildInstagramCaption(
  article: CaptionInput,
  articleUrl: string,
): string {
  const lead = extractSocialLead(article);
  const hashtagLine = buildFacebookHashtagLine(article.tags);
  const lines = [sanitizeSocialText(article.title.trim())];

  if (lead) {
    lines.push("", lead);
  }

  lines.push("", articleUrl);

  if (hashtagLine) {
    lines.push("", hashtagLine);
  }

  return lines.join("\n").slice(0, MAX_CAPTION);
}
