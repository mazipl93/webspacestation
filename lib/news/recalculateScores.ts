import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/news/calculateScore";
import { isBreakingScore } from "@/lib/news/score-thresholds";
import { isExternalAggregatorArticle } from "@/lib/news/is-external-article";

export type RecalculateScoresResult = {
  updated: number;
};

/**
 * Recomputes `score` and `featured` for published articles only (public site).
 */
export async function recalculateAllScores(): Promise<RecalculateScoresResult> {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    select: {
      id: true,
      title: true,
      excerpt: true,
      source: true,
      originalUrl: true,
      publishedAt: true,
    },
  });

  let updated = 0;

  for (const article of articles) {
    const score = calculateScore({
      title: article.title,
      excerpt: article.excerpt,
      source: article.source,
      publishedAt: article.publishedAt,
    });
    const featured =
      !isExternalAggregatorArticle(article) && isBreakingScore(score);

    await prisma.article.update({
      where: { id: article.id },
      data: { score, featured },
    });
    updated += 1;
  }

  return { updated };
}
