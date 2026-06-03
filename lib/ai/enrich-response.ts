import type { ArticleScoreInput } from "@/lib/ai/article-score";
import { resolveAiScore } from "@/lib/ai/article-score";

export type WithAiScore<T> = T & { aiScore: number | null };

/** Attach computed aiScore to a single API article payload (non-breaking extension). */
export function withAiScore<T extends ArticleScoreInput>(article: T): WithAiScore<T> {
  return { ...article, aiScore: resolveAiScore(article) };
}

/** Attach aiScore to each article in a list response. */
export function withAiScores<T extends ArticleScoreInput>(
  articles: T[]
): WithAiScore<T>[] {
  return articles.map(withAiScore);
}
