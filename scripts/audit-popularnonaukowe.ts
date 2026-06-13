import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config();

const prisma = new PrismaClient({
  datasources: process.env.DIRECT_URL
    ? { db: { url: process.env.DIRECT_URL } }
    : undefined,
});

async function main() {
  const cat = await prisma.category.findUnique({
    where: { slug: "popularnonaukowe" },
    include: {
      articles: {
        select: {
          slug: true,
          title: true,
          status: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!cat) {
    console.log("Category popularnonaukowe not found");
    return;
  }

  console.log(`Category: ${cat.name} (${cat.id})`);
  console.log(`Articles total: ${cat.articles.length}`);
  console.log("---");
  for (const a of cat.articles) {
    console.log(`[${a.status}] ${a.slug}`);
    console.log(`  ${a.title}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
