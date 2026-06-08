/**
 * Archiwizuje artykuły z RSS Wired (źródło usunięte z feeds-config).
 * Usage: npm run rss:archive-wired
 */
import { config } from "dotenv";

config();

import { revalidateArticlesViaHttp } from "../lib/cache/revalidate-articles";
import { recalculateAllScores } from "../lib/news/recalculateScores";
import { prisma } from "../lib/prisma";
import { ArticleStatus } from "@prisma/client";

const WIRED_SOURCE = "Wired";

async function main() {
  const rows = await prisma.article.findMany({
    where: {
      source: WIRED_SOURCE,
      status: { not: ArticleStatus.ARCHIVED },
    },
    select: { id: true, slug: true, status: true },
  });

  if (rows.length === 0) {
    console.log(JSON.stringify({ archived: 0, message: "No active Wired articles" }, null, 2));
    return;
  }

  const result = await prisma.article.updateMany({
    where: {
      source: WIRED_SOURCE,
      status: { not: ArticleStatus.ARCHIVED },
    },
    data: {
      status: ArticleStatus.ARCHIVED,
      publishedAt: null,
      featured: false,
      heroPosition: 0,
      weekTopic: false,
    },
  });

  const scores = await recalculateAllScores();
  await revalidateArticlesViaHttp();

  console.log(
    JSON.stringify(
      {
        archived: result.count,
        slugs: rows.map((r) => r.slug),
        scoresUpdated: scores.updated,
      },
      null,
      2
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
