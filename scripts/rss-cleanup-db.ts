/**
 * Czyści featured + treść-placeholder u artykułów RSS (bez ponownego tłumaczenia).
 * Usage: npm run rss:cleanup-db
 */
import { config } from "dotenv";

config();

import { revalidateArticlesViaHttp } from "../lib/cache/revalidate-articles";
import { recalculateAllScores } from "../lib/news/recalculateScores";
import { prisma } from "../lib/prisma";

async function main() {
  const cleared = await prisma.article.updateMany({
    where: { originalUrl: { not: null }, source: { not: null } },
    data: { content: "", featured: false },
  });

  const scores = await recalculateAllScores();
  await revalidateArticlesViaHttp();

  console.log(
    JSON.stringify(
      { aggregatorRowsCleared: cleared.count, scoresUpdated: scores.updated },
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
