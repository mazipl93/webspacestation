/**
 * One-off: RSS ingest used to stamp feed date into publishedAt before CMS publish.
 * Sets publishedAt = updatedAt for PUBLISHED rows where stored date predates last save.
 *
 * Usage: npm run db:fix-published-at
 */
import { config } from "dotenv";

config();

import { ArticleStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: { not: null },
    },
    select: { id: true, title: true, publishedAt: true, updatedAt: true },
  });

  let updated = 0;
  for (const row of rows) {
    if (!row.publishedAt || row.publishedAt >= row.updatedAt) continue;
    await prisma.article.update({
      where: { id: row.id },
      data: { publishedAt: row.updatedAt },
    });
    updated += 1;
    console.log(`fixed: ${row.title.slice(0, 60)}`);
  }

  console.log(JSON.stringify({ checked: rows.length, updated }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
