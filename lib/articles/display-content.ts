import type { NewsArticle } from "@/types";
import { isRssArticle } from "@/lib/ui/article-kind";

const BOILERPLATE_SNIPPETS = [
  "zebrany automatycznie przez wss news engine",
  "pełna treść artykułu znajduje się wyłącznie u wydawcy",
  "wss pokazuje skrót",
  "tłumaczenie automatyczne",
  "źródło:",
  "http://",
  "https://",
];

function isBoilerplateParagraph(text: string): boolean {
  const lower = text.trim().toLowerCase();
  if (!lower) return true;
  return BOILERPLATE_SNIPPETS.some((s) => lower.includes(s));
}

/** Body paragraphs for article page (no duplicate aggregator legal text). */
export function getArticleBodyParagraphs(article: NewsArticle): string[] {
  const raw = article.content ?? [];
  const paragraphs = raw.filter((p) => !isBoilerplateParagraph(p));

  if (isRssArticle(article.contentOrigin)) {
    return paragraphs;
  }

  return paragraphs;
}
