import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/news/calculateScore";

export type RecalculateScoresResult = {
  updated: number;
};

/**
 * Recomputes `score` for published articles only (public site).
 * `featured` (badge „Ważne” w CMS) pozostaje pod kontrolą redakcji — nie nadpisujemy.
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
    await prisma.article.update({
      where: { id: article.id },
      data: { score },
    });
    updated += 1;
  }

  return { updated };
}

