/** Eligible statuses for on-the-fly aiScore in API responses. */
const AI_SCORE_STATUSES = new Set(["PUBLISHED", "REVIEW"]);

/** Read-only inputs for deterministic article intelligence scoring (not persisted). */
export type ArticleScoreInput = {
  title: string;
  content?: string | null;
  coverImage?: string | null;
  tags?: string[];
  featured?: boolean;
  status: string;
  createdAt: Date | string;
};

const MS_PER_DAY = 86_400_000;

/**
 * Lightweight read-only score (0–100). Pure function — does not touch DB or ranking.
 */
export function calculateArticleScore(article: ArticleScoreInput): number {
  let score = 0;

  const created = new Date(article.createdAt).getTime();
  const ageDays = Number.isFinite(created)
    ? Math.max(0, (Date.now() - created) / MS_PER_DAY)
    : 90;
  // Recency: up to 30 pts (fresh → 30, ~90+ days → 0)
  score += Math.max(0, 30 - (ageDays / 90) * 30);

  if (article.coverImage?.trim()) score += 15;

  const tags = article.tags ?? [];
  if (tags.some((t) => t.trim().length > 0)) score += 10;

  const contentLen = (article.content ?? "").trim().length;
  if (contentLen >= 2000) score += 25;
  else if (contentLen >= 1000) score += 20;
  else if (contentLen >= 500) score += 15;
  else if (contentLen >= 200) score += 10;
  else if (contentLen > 0) score += 5;

  if (article.status === "PUBLISHED") score += 10;
  if (article.featured) score += 10;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/** API-facing resolver — null when status ineligible or title missing. */
export function resolveAiScore(
  article: ArticleScoreInput
): number | null {
  if (!AI_SCORE_STATUSES.has(article.status)) {
    return null;
  }
  if (!article.title?.trim()) return null;
  return calculateArticleScore(article);
}
