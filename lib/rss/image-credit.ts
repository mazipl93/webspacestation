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

export function getRssImageCreditForArticle(article: {
  source?: string | null;
  originalUrl?: string | null;
}): string | null {
  if (!article.source?.trim() || !article.originalUrl?.trim()) return null;
  return buildRssImageCredit(article.source, article.originalUrl);
}
