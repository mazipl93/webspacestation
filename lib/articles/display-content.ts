import type { NewsArticle } from "@/types";
import { parseContentImageLine } from "@/lib/articles/content-image";
import { isRssArticle } from "@/lib/ui/article-kind";
import {
  countInternalLinksForParagraphs,
  countParagraphBlocks,
} from "@/lib/article/weave-internal-links";
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
  const trimmed = text.trim();
  if (!trimmed) return true;

  // CMS figure blocks (markdown / ::image) contain https:// — must not be stripped.
  const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.some((line) => parseContentImageLine(line))) {
    return false;
  }

  const lower = trimmed.toLowerCase();
  return BOILERPLATE_SNIPPETS.some((s) => lower.includes(s));
}

/** Body paragraphs for article page (no duplicate aggregator legal text). */
export function getArticleBodyParagraphs(article: NewsArticle): string[] {
  const raw = article.content ?? [];

  if (!isRssArticle(article.contentOrigin)) {
    return raw.map((p) => p.trim()).filter(Boolean);
  }

  return raw.filter((p) => !isBoilerplateParagraph(p));
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

/** Paragraph count in body (after lead) — drives automatic in-body link density. */
export function countWeaveableParagraphs(article: NewsArticle): number {
  const blocks = getArticleBodyBlocks(article);
  const { restBlocks } = splitArticleLeadAndBody(article, blocks);
  return countParagraphBlocks(restBlocks);
}

/** Target number of in-body internal link teasers for this article. */
export function targetInternalLinkCount(article: NewsArticle): number {
  return countInternalLinksForParagraphs(countWeaveableParagraphs(article));
}
