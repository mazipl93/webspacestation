import type { NewsArticle } from "@/types";
import { isRssArticle } from "@/lib/ui/article-kind";
import {
  parseArticleBodyBlocks,
  type ArticleContentBlock,
} from "@/lib/articles/parse-content-blocks";

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

/** Parsed body blocks (paragraphs + vertical lists) for public article UI. */
export function getArticleBodyBlocks(article: NewsArticle): ArticleContentBlock[] {
  return parseArticleBodyBlocks(getArticleBodyParagraphs(article));
}

/** Editorial lead (first paragraph) + remaining blocks for manual articles. */
export function splitArticleLeadAndBody(
  article: NewsArticle,
  blocks: ArticleContentBlock[]
): { lead: string | null; restBlocks: ArticleContentBlock[] } {
  if (isRssArticle(article.contentOrigin)) {
    return { lead: null, restBlocks: blocks };
  }
  if (blocks[0]?.kind === "paragraph") {
    return { lead: blocks[0].text, restBlocks: blocks.slice(1) };
  }
  const fallbackLead = article.excerpt?.trim();
  return { lead: fallbackLead || null, restBlocks: blocks };
}
