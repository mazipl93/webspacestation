import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env" });

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: npx tsx scripts/check-article-slug.ts <slug>");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const row = await prisma.article.findFirst({
    where: { slug },
    select: { slug: true, status: true, title: true, publishedAt: true },
  });
  console.log(row ?? "NOT_FOUND");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
