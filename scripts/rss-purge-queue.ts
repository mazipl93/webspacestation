/**
 * Usuwa kolejkę RSS (DRAFT + REVIEW) — bez ruszania opublikowanych artykułów.
 *
 * Usage:
 *   npx tsx scripts/rss-purge-queue.ts           # podgląd liczb
 *   npx tsx scripts/rss-purge-queue.ts --confirm # usuń
 */
import { config } from "dotenv";
config();

import {
  ArticleContentOrigin,
  ArticleStatus,
  PrismaClient,
} from "@prisma/client";
import { revalidateArticlesViaHttp } from "../lib/cache/revalidate-articles";

const prisma = new PrismaClient();

const PURGE_STATUSES: ArticleStatus[] = [
  ArticleStatus.DRAFT,
  ArticleStatus.REVIEW,
];

async function main() {
  const confirm = process.argv.includes("--confirm");

  const where = {
    contentOrigin: ArticleContentOrigin.RSS,
    status: { in: PURGE_STATUSES },
  };

  const [byStatus, bySource, sample, keepPublished, keepEditorialQueue] =
    await Promise.all([
      prisma.article.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),
      prisma.article.groupBy({
        by: ["source"],
        where,
        _count: { _all: true },
        orderBy: { _count: { source: "desc" } },
      }),
      prisma.article.findMany({
        where,
        select: { slug: true, title: true, status: true, source: true },
        take: 8,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.article.count({
        where: {
          contentOrigin: ArticleContentOrigin.RSS,
          status: ArticleStatus.PUBLISHED,
        },
      }),
      prisma.article.count({
        where: {
          contentOrigin: ArticleContentOrigin.EDITORIAL,
          status: { in: PURGE_STATUSES },
        },
      }),
    ]);

  const total = byStatus.reduce((n, g) => n + g._count._all, 0);

  console.log("=== RSS queue purge ===");
  console.log("Do usunięcia (RSS × DRAFT/REVIEW):", total);
  console.log(
    "Zostaje (RSS opublikowane):",
    keepPublished,
    "| redakcyjne szkice/review:",
    keepEditorialQueue
  );
  console.log("\nPo statusie:", byStatus);
  console.log("\nPo źródle (top):", bySource.slice(0, 12));
  console.log("\nPrzykłady:", sample);

  if (!confirm) {
    console.log("\nDry-run. Uruchom z --confirm aby usunąć.");
    return;
  }

  if (total === 0) {
    console.log("\nNic do usunięcia.");
    return;
  }

  const deleted = await prisma.article.deleteMany({ where });
  console.log(`\n[delete] Usunięto ${deleted.count} artykułów RSS z kolejki.`);

  await revalidateArticlesViaHttp();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
