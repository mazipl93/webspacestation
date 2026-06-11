/**
 * Lista URL-i z działu Nauka do ręcznego „Request indexing” w GSC.
 * Usage: npx tsx scripts/list-gsc-nauka-urls.ts [--limit=20]
 */
import { config } from "dotenv";
import { PrismaClient, ArticleStatus } from "@prisma/client";

config();

const prisma = new PrismaClient({
  datasources: process.env.DIRECT_URL
    ? { db: { url: process.env.DIRECT_URL } }
    : undefined,
});

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://webspacestation.pl"
).replace(/\/$/, "");

function parseLimit(): number | undefined {
  const arg = process.argv.find((a) => a.startsWith("--limit="));
  if (!arg) return undefined;
  const n = Number.parseInt(arg.split("=")[1] ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

async function main() {
  const limit = parseLimit();

  const rows = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: { not: null },
      category: { slug: "nauka" },
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: {
      slug: true,
      title: true,
      publishedAt: true,
    },
  });

  console.log(`# Nauka — ${rows.length} URL (GSC → URL Inspection → Request indexing)\n`);

  for (const row of rows) {
    const date = row.publishedAt?.toISOString().slice(0, 10) ?? "?";
    console.log(`${siteUrl}/aktualnosci/${row.slug}`);
    console.log(`  ${date} · ${row.title}\n`);
  }

  console.log(`# RSS (dystrybucja): ${siteUrl}/feed/nauka`);
  console.log(`# Sitemap: ${siteUrl}/sitemap.xml`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
