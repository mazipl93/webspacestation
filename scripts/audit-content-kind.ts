/**
 * Audit all articles — current vs inferred contentKind.
 *   npx tsx scripts/audit-content-kind.ts
 */
import { PrismaClient } from "@prisma/client";
import { inferContentKindValidated } from "../lib/articles/content-kind-infer";

const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    orderBy: [{ category: { slug: "asc" } }, { publishedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      contentKind: true,
      status: true,
      publishedAt: true,
      readingTime: true,
      contentOrigin: true,
      category: { select: { slug: true, name: true } },
    },
  });

  console.log(`Total articles: ${articles.length}\n`);

  const mismatches: typeof articles = [];
  const byKind: Record<string, number> = {};
  const byCategory: Record<string, Record<string, number>> = {};

  for (const a of articles) {
    const inferred = inferContentKindValidated({
      categorySlug: a.category.slug,
      title: a.title,
      excerpt: a.excerpt,
      readingTime: a.readingTime,
    });

    byKind[a.contentKind] = (byKind[a.contentKind] ?? 0) + 1;
    byCategory[a.category.slug] ??= {};
    byCategory[a.category.slug][a.contentKind] =
      (byCategory[a.category.slug][a.contentKind] ?? 0) + 1;

    if (inferred.kind !== a.contentKind) {
      mismatches.push(a);
      console.log(
        `[${a.status}] ${a.category.slug} | ${a.contentKind} → ${inferred.kind} (${inferred.reason})`,
      );
      console.log(`  ${a.slug}`);
      console.log(`  ${a.title.slice(0, 90)}`);
      console.log("");
    }
  }

  console.log("\n--- Current distribution ---");
  console.log(byKind);
  console.log("\n--- By category ---");
  console.log(JSON.stringify(byCategory, null, 2));
  console.log(`\nMismatches: ${mismatches.length} / ${articles.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
