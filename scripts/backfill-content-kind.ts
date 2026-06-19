/**
 * Backfill Article.contentKind using editorial rules.
 *
 *   npx tsx scripts/backfill-content-kind.ts           # dry-run (default)
 *   npx tsx scripts/backfill-content-kind.ts --apply   # write to DB
 *   npx tsx scripts/backfill-content-kind.ts --apply --published-only
 */
import { ArticleContentKind, ArticleStatus, PrismaClient } from "@prisma/client";
import {
  inferContentKindValidated,
  type ContentKindInferInput,
} from "../lib/articles/content-kind-infer";
import { validateContentKindForCategory } from "../lib/articles/content-kind";

const prisma = new PrismaClient();

const apply = process.argv.includes("--apply");
const publishedOnly = process.argv.includes("--published-only");

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  readingTime: number | null;
  contentKind: ArticleContentKind;
  status: ArticleStatus;
  category: { slug: string; name: string };
};

async function main() {
  const where = publishedOnly
    ? { status: ArticleStatus.PUBLISHED }
    : undefined;

  const articles = await prisma.article.findMany({
    where,
    orderBy: [{ category: { slug: "asc" } }, { publishedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      readingTime: true,
      contentKind: true,
      status: true,
      category: { select: { slug: true, name: true } },
    },
  });

  console.log(
    `Mode: ${apply ? "APPLY" : "DRY-RUN"} | Articles: ${articles.length}${
      publishedOnly ? " (published only)" : ""
    }\n`,
  );

  const changes: Array<{
    row: Row;
    next: ArticleContentKind;
    reason: string;
  }> = [];

  for (const row of articles) {
    const input: ContentKindInferInput = {
      categorySlug: row.category.slug,
      title: row.title,
      excerpt: row.excerpt,
      readingTime: row.readingTime,
    };
    const inferred = inferContentKindValidated(input);
    const check = validateContentKindForCategory(
      row.category.slug,
      inferred.kind,
    );
    if (!check.ok) {
      console.error(`INVALID ${row.slug}: ${check.message}`);
      process.exitCode = 1;
      continue;
    }
    if (inferred.kind !== row.contentKind) {
      changes.push({ row, next: inferred.kind, reason: inferred.reason });
    }
  }

  if (changes.length === 0) {
    console.log("Brak zmian — wszystkie contentKind zgodne z regułami.");
    return;
  }

  const byTransition: Record<string, number> = {};
  for (const c of changes) {
    const key = `${c.row.contentKind} → ${c.next}`;
    byTransition[key] = (byTransition[key] ?? 0) + 1;
    console.log(
      `[${c.row.status}] ${c.row.category.slug}: ${c.row.contentKind} → ${c.next}`,
    );
    console.log(`  ${c.row.slug}`);
    console.log(`  ${c.reason}`);
    console.log(`  ${c.row.title.slice(0, 100)}`);
    console.log("");
  }

  console.log("--- Summary ---");
  console.log(`Changes: ${changes.length} / ${articles.length}`);
  console.log(byTransition);

  if (!apply) {
    console.log("\nDry-run only. Uruchom z --apply aby zapisać.");
    return;
  }

  let updated = 0;
  for (const c of changes) {
    await prisma.article.update({
      where: { id: c.row.id },
      data: { contentKind: c.next },
    });
    updated++;
  }
  console.log(`\nZapisano: ${updated} artykułów.`);
  console.log(
    "Sitemap articles.xml — bez zmian URL; news.xml (Faza C) użyje nowych typów.",
  );
  console.log(
    "Opcjonalnie odśwież cache: curl -X POST http://localhost:3000/api/revalidate-articles (z tokenem cron).",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
