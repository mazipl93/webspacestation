import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config();

const prisma = new PrismaClient({
  datasources: process.env.DIRECT_URL
    ? { db: { url: process.env.DIRECT_URL } }
    : undefined,
});

const SLUGS = ["nauka", "popularnonaukowe", "wyjasniamy", "wiedza"] as const;

async function main() {
  for (const slug of SLUGS) {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: {
        articles: {
          select: { slug: true, title: true, status: true, publishedAt: true },
          orderBy: { updatedAt: "desc" },
          take: 20,
        },
      },
    });
    if (!cat) {
      console.log(`[missing] ${slug}`);
      continue;
    }
    console.log(`\n=== ${cat.slug} (${cat.name}) — ${cat.articles.length} shown ===`);
    for (const a of cat.articles) {
      console.log(`  [${a.status}] ${a.slug}`);
    }
  }

  const target = await prisma.article.findFirst({
    where: { slug: "dlaczego-w-kosmosie-jest-proznia" },
    select: {
      slug: true,
      status: true,
      category: { select: { slug: true, name: true } },
    },
  });
  console.log("\n=== dlaczego-w-kosmosie-jest-proznia ===");
  console.log(target ?? "not found");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
