/**
 * Dział Rozrywka + przeniesienie gamingu z Technologie + okładki + kredyty.
 *
 *   npm run rozrywka:migrate
 *
 * Zatrzymaj `npm run dev` jeśli pool Supabase jest pełny.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import {
  ROZRYWKA_ARTICLE_SLUGS,
  ROZRYWKA_COVER_BY_SLUG,
  stripEditorialBoldMarkdown,
} from "../lib/editorial/rozrywka";
import { ALL_EDITORIAL_JUNE_2026 } from "../lib/editorial/editorial-june-2026-all";

config();

const prisma = new PrismaClient({
  datasources: process.env.DIRECT_URL
    ? { db: { url: process.env.DIRECT_URL } }
    : undefined,
});

const ROZRYWKA_CATEGORY = {
  slug: "rozrywka",
  name: "Rozrywka",
  description:
    "Gry, filmy i kultura popularna — kosmos w rozrywce, bez mieszania z newsami rakiet i misji.",
  colorTheme: "#f472b6",
  orderIndex: 6,
} as const;

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: ROZRYWKA_CATEGORY.slug },
    update: {
      name: ROZRYWKA_CATEGORY.name,
      description: ROZRYWKA_CATEGORY.description,
      colorTheme: ROZRYWKA_CATEGORY.colorTheme,
      orderIndex: ROZRYWKA_CATEGORY.orderIndex,
    },
    create: ROZRYWKA_CATEGORY,
  });

  const draftBySlug = new Map(
    ALL_EDITORIAL_JUNE_2026.map((d) => [d.slug, d])
  );

  let moved = 0;
  for (const slug of ROZRYWKA_ARTICLE_SLUGS) {
    const draft = draftBySlug.get(slug);
    const coverFromMap = ROZRYWKA_COVER_BY_SLUG[slug];
    const article = await prisma.article.findFirst({
      where: { slug },
      select: { id: true, coverImage: true, content: true },
    });
    if (!article) {
      console.log(`[skip] ${slug} — brak w DB`);
      continue;
    }

    const keepPublisherCover =
      slug ===
        "playstation-state-of-play-czerwiec-2026-wolverine-god-of-war-laufey" &&
      Boolean(article.coverImage) &&
      !article.coverImage!.includes("images-assets.nasa.gov");

    const coverImage = keepPublisherCover
      ? article.coverImage
      : (coverFromMap ?? draft?.coverImage ?? article.coverImage);

    const strippedContent = article.content
      ? stripEditorialBoldMarkdown(article.content)
      : undefined;

    await prisma.article.update({
      where: { id: article.id },
      data: {
        categoryId: category.id,
        coverImage: keepPublisherCover ? article.coverImage : coverImage,
        coverImageCredit: draft?.coverImageCredit ?? undefined,
        ...(strippedContent ? { content: strippedContent } : {}),
      },
    });
    moved += 1;
    console.log(`[ok] ${slug} → rozrywka`);
  }

  console.log(
    JSON.stringify({ category: category.slug, articlesUpdated: moved })
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
