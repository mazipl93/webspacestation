/**
 * Demo artykuł redakcyjny — test pól CMS (Ważne, hero 1–4, W centrum uwagi 1–4).
 *
 * Usage:
 *   npx tsx scripts/seed-cms-slots-demo.ts
 *   npx tsx scripts/seed-cms-slots-demo.ts --remove
 */
import { config } from "dotenv";
config();

import {
  ArticleContentOrigin,
  ArticleStatus,
  PrismaClient,
  Role,
} from "@prisma/client";
import { revalidateArticlesViaHttp } from "../lib/cache/revalidate-articles";
import { nasaCoverUrl } from "../lib/editorial/nasa-cover";

const prisma = new PrismaClient();
const SLUG = "test-cms-slots-czerwiec-2026";

async function getDefaultAuthorId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!admin) throw new Error("Brak użytkownika ADMIN — uruchom npm run db:seed");
  return admin.id;
}

async function removeDemo() {
  const row = await prisma.article.findUnique({
    where: { slug: SLUG },
    select: { id: true },
  });
  if (!row) {
    console.log(`[remove] Brak artykułu ${SLUG}`);
    return;
  }
  await prisma.article.delete({ where: { id: row.id } });
  console.log(`[remove] Usunięto ${SLUG}`);
  await revalidateArticlesViaHttp();
}

async function clearSlot(
  field: "heroPosition" | "weekTopicPosition",
  position: number,
  exceptId?: string
) {
  const data =
    field === "heroPosition"
      ? { heroPosition: 0 }
      : { weekTopicPosition: 0, weekTopic: false };
  await prisma.article.updateMany({
    where: {
      [field]: position,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data,
  });
}

async function seedDemo() {
  const authorId = await getDefaultAuthorId();
  const category = await prisma.category.findFirst({
    where: { slug: "technologie" },
    select: { id: true },
  });
  if (!category) throw new Error("Brak kategorii technologie");

  const heroPosition = 2;
  const weekTopicPosition = 4;

  const occupied = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { heroPosition: { gte: 1, lte: 4 } },
        { weekTopicPosition: { gte: 1, lte: 4 } },
      ],
    },
    select: { slug: true, heroPosition: true, weekTopicPosition: true },
  });
  console.log("[slots] Zajęte przed seed:", occupied);

  const existing = await prisma.article.findUnique({
    where: { slug: SLUG },
    select: { id: true },
  });

  await clearSlot("heroPosition", heroPosition, existing?.id);
  await clearSlot("weekTopicPosition", weekTopicPosition, existing?.id);

  const now = new Date();
  const data = {
    title:
      "[TEST CMS] Starship HLS — demonstracja slotów hero, centrum uwagi i badge Ważne",
    subtitle: "Artykuł testowy redakcji WSS — można usunąć po weryfikacji",
    excerpt:
      "Ten artykuł sprawdza nowe pola CMS: badge Ważne, pozycję w karuzeli hero (2) oraz slot „W centrum uwagi” (4). Po testach usuń go skryptem z flagą --remove.",
    content: [
      "To artykuł testowy dodany automatycznie, żeby zweryfikować nowe opcje w panelu redakcyjnym Web Space Station.",
      "Powinien mieć badge WAŻNE (pole „Ważne”), być widoczny na pozycji 2 w karuzeli hero u góry strony głównej oraz na pozycji 4 w sliderze „W centrum uwagi”.",
      "Artykuł może jednocześnie zajmować oba sloty — to zamierzone zachowanie po ostatniej refaktoryzacji homepage.",
      "Jeśli widzisz ten tekst na produkcji, test przeszedł pomyślnie. Usuń go poleceniem: npx tsx scripts/seed-cms-slots-demo.ts --remove",
    ].join("\n\n"),
    contextNote:
      "Artykuł techniczny QA — nie jest materiałem redakcyjnym. Slug: test-cms-slots-czerwiec-2026.",
    coverImage: nasaCoverUrl("PIA25236"),
    coverImageCredit: "NASA / JPL-Caltech",
    authorByline: "Redakcja WSS (test)",
    categoryId: category.id,
    authorId,
    status: ArticleStatus.PUBLISHED,
    contentOrigin: ArticleContentOrigin.EDITORIAL,
    featured: true,
    heroPosition,
    weekTopicPosition,
    weekTopic: true,
    readingTime: 3,
    tags: ["test-cms", "wss-qa"],
    source: "Web Space Station",
    publishedAt: now,
    publishAt: null as Date | null,
  };

  let articleId: string;
  if (existing) {
    const article = await prisma.article.update({
      where: { id: existing.id },
      data,
      select: { id: true, slug: true },
    });
    articleId = article.id;
    console.log(`[update] ${article.slug}`);
  } else {
    const article = await prisma.article.create({
      data: { slug: SLUG, ...data },
      select: { id: true, slug: true },
    });
    articleId = article.id;
    console.log(`[create] ${article.slug}`);
  }

  const row = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      slug: true,
      featured: true,
      heroPosition: true,
      weekTopicPosition: true,
      weekTopic: true,
      status: true,
    },
  });
  console.log("[result]", row);
  console.log(`\nPublic URL: https://webspacestation.pl/aktualnosci/${SLUG}`);
  console.log(`Admin:      https://webspacestation.pl/admin/articles/${articleId}/edit`);

  await revalidateArticlesViaHttp();
}

async function main() {
  if (process.argv.includes("--remove")) {
    await removeDemo();
  } else {
    await seedDemo();
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
