/**
 * Architektura treści v1 — działy, orderIndex, merge AI → technologie.
 *
 *   npm run content-arch:migrate
 *
 * Zgodnie z docs/WSS_CONTENT_ARCHITECTURE.md
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config();

const prisma = new PrismaClient({
  datasources: process.env.DIRECT_URL
    ? { db: { url: process.env.DIRECT_URL } }
    : undefined,
});

const TARGET_CATEGORIES = [
  {
    slug: "misje",
    name: "Misje",
    colorTheme: "#2f6dff",
    orderIndex: 0,
    description: "Załogowe i bezzałogowe misje kosmiczne.",
  },
  {
    slug: "astronomia",
    name: "Astronomia",
    colorTheme: "#a855f7",
    orderIndex: 1,
    description: "Odkrycia, obserwacje i badania wszechświata.",
  },
  {
    slug: "popularnonaukowe",
    name: "Popularnonaukowe",
    colorTheme: "#14b8a6",
    orderIndex: 2,
    description: "Wyjaśnienia i przewodniki evergreen o kosmosie.",
  },
  {
    slug: "technologie",
    name: "Technologie kosmiczne",
    colorTheme: "#38bdf8",
    orderIndex: 3,
    description: "Rakiety, satelity, napędy i inżynieria kosmiczna.",
  },
  {
    slug: "iss",
    name: "ISS i załogi",
    colorTheme: "#ffb830",
    orderIndex: 4,
    description: "Międzynarodowa Stacja Kosmiczna.",
  },
  {
    slug: "ziemia-z-kosmosu",
    name: "Ziemia z kosmosu",
    colorTheme: "#22c55e",
    orderIndex: 5,
    description: "Obserwacja Ziemi i pogoda kosmiczna.",
  },
  {
    slug: "rozrywka",
    name: "Rozrywka",
    colorTheme: "#f472b6",
    orderIndex: 6,
    description: "Gry, filmy i kultura sci-fi w kosmosie.",
  },
] as const;

async function main() {
  const idBySlug = new Map<string, string>();

  for (const c of TARGET_CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        colorTheme: c.colorTheme,
        orderIndex: c.orderIndex,
      },
      create: c,
    });
    idBySlug.set(c.slug, row.id);
    console.log(`[category] ${c.slug} order=${c.orderIndex}`);
  }

  const technologieId = idBySlug.get("technologie");
  if (!technologieId) throw new Error("Missing technologie category");

  const aiCat = await prisma.category.findUnique({ where: { slug: "ai" } });
  if (aiCat) {
    const moved = await prisma.article.updateMany({
      where: { categoryId: aiCat.id },
      data: { categoryId: technologieId },
    });
    console.log(`[merge] ai → technologie: ${moved.count} articles`);

    const remaining = await prisma.article.count({
      where: { categoryId: aiCat.id },
    });
    if (remaining === 0) {
      await prisma.category.delete({ where: { id: aiCat.id } });
      console.log("[delete] category ai removed");
    } else {
      console.warn(`[warn] ai category still has ${remaining} articles — not deleted`);
    }
  } else {
    console.log("[skip] no ai category in DB");
  }

  console.log(
    JSON.stringify({
      ok: true,
      categories: TARGET_CATEGORIES.length,
    })
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
