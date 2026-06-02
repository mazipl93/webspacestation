function sourceHostname(url: string): string {
  try {
    return new URL(url.trim()).hostname.replace(/^www\./i, "");
  } catch {
    return url.trim().slice(0, 48) || "źródło";
  }
}

/**
 * Caption for RSS cover images — we rarely get photographer metadata from feeds,
 * so credit goes to the publisher and link to the original article.
 */
export function buildRssImageCredit(
  source: string,
  originalUrl?: string | null
): string {
  const publisher = source.trim() || "źródło zewnętrzne";
  if (originalUrl?.trim()) {
    const site = sourceHostname(originalUrl);
    return `Ilustracja z artykułu na stronie ${publisher} (${site}). Autor zdjęcia: według materiału u wydawcy.`;
  }
  return `Ilustracja: materiał redakcyjny ${publisher}. Autor zdjęcia: według materiału u wydawcy.`;
}

import { inferRssSource, isRssAggregatorArticle } from "@/lib/rss/is-aggregator";

export function getRssImageCreditForArticle(article: {
  source?: string | null;
  originalUrl?: string | null;
  subtitle?: string | null;
}): string | null {
  if (!isRssAggregatorArticle(article)) return null;
  const source = inferRssSource(article);
  if (!source) return null;
  return buildRssImageCredit(source, article.originalUrl);
}
