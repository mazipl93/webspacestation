import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config();

const prisma = new PrismaClient({
  datasources: process.env.DIRECT_URL
    ? { db: { url: process.env.DIRECT_URL } }
    : undefined,
});

async function main() {
  const hits = await prisma.article.findMany({
    where: {
      OR: [
        { slug: { contains: "goth", mode: "insensitive" } },
        { title: { contains: "Goth", mode: "insensitive" } },
        { title: { contains: "gotyk", mode: "insensitive" } },
      ],
    },
    select: {
      slug: true,
      title: true,
      status: true,
      category: { select: { slug: true, name: true } },
    },
  });
  console.log(JSON.stringify(hits, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
