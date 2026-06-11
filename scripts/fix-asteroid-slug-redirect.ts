/**
 * One-off: set previousSlug + revalidate after astoroida → asteroida rename.
 * Usage: npx tsx scripts/fix-asteroid-slug-redirect.ts
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { revalidateArticlesViaHttp } from "../lib/cache/revalidate-articles";

config();

const prisma = new PrismaClient();

const CURRENT =
  "asteroida-zabila-dinozaury-chicxulub-8-milionow-lat-zycie";
const OLD = "astoroida-zabila-dinozaury-chicxulub-8-milionow-lat-zycie";

async function main() {
  const row = await prisma.article.update({
    where: { slug: CURRENT },
    data: { previousSlug: OLD },
    select: { slug: true, previousSlug: true, status: true },
  });
  console.log("Updated:", row);
  await revalidateArticlesViaHttp();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
