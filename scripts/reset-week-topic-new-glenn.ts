/**
 * Reset „W centrum uwagi” — wyczyść weekTopic, zarchiwizuj tech/AI spoza kosmosu,
 * ustaw klaster New Glenn / rynek startów (docs/WSS_CONTENT_ARCHITECTURE.md).
 *
 *   npm run week-topic:reset-new-glenn
 */
import { config } from "dotenv";
import { PrismaClient, ArticleStatus } from "@prisma/client";

config();

const prisma = new PrismaClient({
  datasources: process.env.DIRECT_URL
    ? { db: { url: process.env.DIRECT_URL } }
    : undefined,
});

const WEEK_TOPIC_SLUGS = [
  "rakieta-new-glenn-eksplodowa-a-podczas-testu-na-wyrzutni-w-cape-canavera-74e5a206",
  "awaria-new-glenn-pogarsza-i-tak-ograniczony-rynek-startow-e5bb7d9c",
  "blue-origin-chce-wznowic-starty-new-glenn-do-konca-roku-f939bb61",
  "blue-origin-new-glenn-wznowienie-lotow-koniec-2026",
  "najnowoczesniejsze-chinskie-rakiety-sa-bliskie-startu-15ee17b9",
  "bellatrix-i-telepix-planuja-demonstracje-obrazowania-vleo-z-wykorzystani-44979b38",
] as const;

const ARCHIVE_SLUGS = [
  "floryda-pozywa-openai-i-sama-altmana-po-serii-zabojstw-zwiazanych-z-chat-8d796b44",
  "trump-podpisuje-wezsze-rozporzadzenie-wykonawcze-dotyczace-nadzoru-nad-a-ec28701a",
] as const;

async function main() {
  const cleared = await prisma.article.updateMany({
    where: { weekTopic: true },
    data: { weekTopic: false },
  });
  console.log(`[clear] weekTopic=false on ${cleared.count} articles`);

  for (const slug of ARCHIVE_SLUGS) {
    const row = await prisma.article.updateMany({
      where: { slug, status: ArticleStatus.PUBLISHED },
      data: { weekTopic: false, status: ArticleStatus.ARCHIVED },
    });
    if (row.count === 0) {
      console.log(`[archive skip] ${slug}`);
    } else {
      console.log(`[archive] ${slug}`);
    }
  }

  let set = 0;
  for (const slug of WEEK_TOPIC_SLUGS) {
    const updated = await prisma.article.updateMany({
      where: { slug, status: ArticleStatus.PUBLISHED },
      data: { weekTopic: true },
    });
    if (updated.count === 0) {
      console.warn(`[weekTopic skip] ${slug}`);
      continue;
    }
    console.log(`[weekTopic] ${slug}`);
    set += 1;
  }

  console.log(JSON.stringify({ cleared: cleared.count, weekTopicSet: set }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
