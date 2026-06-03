/**
 * DEPRECATED / DANGEROUS — nie uruchamiaj bez --apply.
 *
 * Wcześniejsza wersja ustawiała publishedAt = updatedAt dla wielu wierszy naraz,
 * przez co na froncie wszystkie karty pokazywały ten sam wiek (np. „3 godz. temu”).
 *
 * Dry-run (domyślnie): tylko raport kandydatów.
 * Apply: npm run db:fix-published-at -- --apply
 */
import { config } from "dotenv";

config();

import { ArticleStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const rows = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: { not: null },
    },
    select: { id: true, title: true, publishedAt: true, updatedAt: true, createdAt: true },
  });

  const candidates = rows.filter(
    (row) => row.publishedAt && row.publishedAt < row.updatedAt
  );

  console.log(
    JSON.stringify(
      {
        mode: apply ? "APPLY" : "DRY_RUN",
        checked: rows.length,
        wouldChange: candidates.length,
        warning:
          "Ten skrypt NIE przywraca prawdziwej daty Opublikuj. Rozważ ręczną korektę w CMS.",
      },
      null,
      2
    )
  );

  if (!apply) {
    if (candidates.length > 0) {
      console.log("Przykłady (publishedAt < updatedAt):");
      for (const row of candidates.slice(0, 5)) {
        console.log(`  - ${row.title.slice(0, 50)}`);
      }
    }
    return;
  }

  let updated = 0;
  for (const row of candidates) {
    if (!row.publishedAt || row.publishedAt >= row.updatedAt) continue;
    await prisma.article.update({
      where: { id: row.id },
      data: { publishedAt: row.updatedAt },
    });
    updated += 1;
    console.log(`fixed: ${row.title.slice(0, 60)}`);
  }

  console.log(JSON.stringify({ updated }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
