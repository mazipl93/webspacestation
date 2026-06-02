/**
 * Normalize RSS article subtitles (remove old "agregat WSS / tłumaczenie automatyczne").
 * Usage: npm run rss:clean-subtitles
 */
import { config } from "dotenv";

config();

import { PrismaClient } from "@prisma/client";
import { buildAggregatorSubtitle } from "../lib/rss/normalize";

async function main() {
  const prisma = new PrismaClient();
  const rows = await prisma.article.findMany({
    where: {
      source: { not: null },
      originalUrl: { not: null },
    },
    select: { id: true, source: true, subtitle: true },
  });

  let updated = 0;
  for (const row of rows) {
    const source = row.source?.trim();
    if (!source) continue;
    const next = buildAggregatorSubtitle(source);
    if (row.subtitle === next) continue;
    await prisma.article.update({
      where: { id: row.id },
      data: { subtitle: next },
    });
    updated += 1;
  }

  console.log(`Updated ${updated} / ${rows.length} RSS subtitles.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
