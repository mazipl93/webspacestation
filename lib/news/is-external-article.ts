/** RSS / News Engine item — excerpt + link, not full WSS editorial. */
export function isExternalAggregatorArticle(article: {
  source?: string | null;
  originalUrl?: string | null;
}): boolean {
  return Boolean(article.source?.trim() && article.originalUrl?.trim());
}
