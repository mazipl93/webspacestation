/**
 * One-time: move auto-published RSS backfill off the public site → REVIEW queue.
 * Usage: npm run rss:demote-backfill
 */
import { config } from "dotenv";

config();

import { ArticleStatus } from "@prisma/client";
import { revalidateArticlesViaHttp } from "../lib/cache/revalidate-articles";
import { prisma } from "../lib/prisma";

async function main() {
  const result = await prisma.article.updateMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      originalUrl: { not: null },
      source: { not: null },
    },
    data: {
      status: ArticleStatus.REVIEW,
      featured: false,
    },
  });

  console.log(
    `Moved ${result.count} aggregator articles PUBLISHED → REVIEW (hidden from frontend).`
  );
  await revalidateArticlesViaHttp();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
