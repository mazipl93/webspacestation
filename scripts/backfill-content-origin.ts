/**
 * Re-apply contentOrigin from source + originalUrl (idempotent).
 * Primary backfill runs in migration 20260603120000_article_content_origin.
 *
 * Usage: npm run db:backfill-content-origin
 */
import { config } from "dotenv";

config();

import { ArticleContentOrigin, PrismaClient } from "@prisma/client";
import { inferContentOriginFromArticle } from "../lib/articles/content-origin";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.article.findMany({
    select: { id: true, source: true, originalUrl: true, contentOrigin: true },
  });

  let updated = 0;
  let rss = 0;
  let editorial = 0;

  for (const row of rows) {
    const next = inferContentOriginFromArticle(row);
    if (next === ArticleContentOrigin.RSS) rss += 1;
    else editorial += 1;

    if (row.contentOrigin === next) continue;

    await prisma.article.update({
      where: { id: row.id },
      data: { contentOrigin: next },
    });
    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        total: rows.length,
        wouldBeRss: rss,
        wouldBeEditorial: editorial,
        updated,
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
