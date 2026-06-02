import { isExternalAggregatorArticle } from "@/lib/news/is-external-article";
import type { NewsArticle } from "@/types";

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
  if (isExternalAggregatorArticle(article)) {
    return [];
  }

  const raw = article.content ?? [];
  return raw.filter((p) => !isBoilerplateParagraph(p));
}
