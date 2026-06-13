/**
 * Cofnij demo CMS — usuń artykuł testowy, przywróć hero slot 2 (Webb).
 */
import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import { revalidateArticlesViaHttp } from "../lib/cache/revalidate-articles";

const prisma = new PrismaClient();

const TEST_SLUG = "test-cms-slots-czerwiec-2026";
const HERO2_SLUG = "jwst-czarne-dziury-wczesny-wszechswiat-nowe-badanie";

async function main() {
  const test = await prisma.article.findUnique({
    where: { slug: TEST_SLUG },
    select: { id: true },
  });
  if (test) {
    await prisma.article.delete({ where: { id: test.id } });
    console.log(`[delete] ${TEST_SLUG}`);
  } else {
    console.log(`[skip] brak ${TEST_SLUG}`);
  }

  const jwst = await prisma.article.updateMany({
    where: { slug: HERO2_SLUG },
    data: { heroPosition: 2 },
  });
  console.log(`[restore] hero slot 2 → ${HERO2_SLUG} (${jwst.count} row)`);

  const weekTopic = await prisma.article.findMany({
    where: { weekTopicPosition: { gte: 1 } },
    select: { slug: true, weekTopicPosition: true },
  });
  console.log("[weekTopic slots po restore]", weekTopic);

  const legacy = await prisma.article.findMany({
    where: { weekTopic: true, status: "PUBLISHED" },
    select: { slug: true, weekTopic: true, weekTopicPosition: true },
  });
  console.log("[legacy weekTopic]", legacy);

  await revalidateArticlesViaHttp();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
