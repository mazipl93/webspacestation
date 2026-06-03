/** Minimal article reference for related-content scaffold (no embeddings). */
export type RelatedArticleRef = {
  id: string;
  slug: string;
  title: string;
  tags?: string[];
};

/**
 * Tag-overlap related articles — scaffold only (no vector DB).
 * Returns [] when no tags or no matches.
 */
export function getRelatedArticles(
  article: RelatedArticleRef,
  allArticles: RelatedArticleRef[],
  limit = 5
): RelatedArticleRef[] {
  const tagSet = new Set(
    (article.tags ?? [])
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
  );
  if (tagSet.size === 0) return [];

  return allArticles
    .filter((candidate) => candidate.id !== article.id)
    .map((candidate) => {
      const overlap = (candidate.tags ?? []).filter((t) =>
        tagSet.has(t.trim().toLowerCase())
      ).length;
      return { candidate, overlap };
    })
    .filter((row) => row.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((row) => row.candidate);
}
