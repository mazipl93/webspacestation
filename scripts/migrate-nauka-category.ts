/**
 * Rename legacy category slugs → nauka (DB).
 *
 *   npm run category:migrate-nauka
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config();

const prisma = new PrismaClient({
  datasources: process.env.DIRECT_URL
    ? { db: { url: process.env.DIRECT_URL } }
    : undefined,
});

const LEGACY_SLUGS = ["popularnonaukowe", "wyjasniamy", "wiedza"] as const;

const NAUKA = {
  slug: "nauka",
  name: "Nauka",
  colorTheme: "#14b8a6",
  orderIndex: 2,
  description:
    "Popularna nauka i evergreeny — fizyka, chemia, kosmos od podstaw. Bez newsów z 24h.",
};

async function main() {
  let nauka = await prisma.category.findUnique({ where: { slug: "nauka" } });

  if (!nauka) {
    const legacy = await prisma.category.findFirst({
      where: { slug: { in: [...LEGACY_SLUGS] } },
    });

    if (legacy) {
      nauka = await prisma.category.update({
        where: { id: legacy.id },
        data: NAUKA,
      });
      console.log(`[rename] ${legacy.slug} → nauka`);
    } else {
      nauka = await prisma.category.create({ data: NAUKA });
      console.log("[create] nauka");
    }
  } else {
    await prisma.category.update({
      where: { id: nauka.id },
      data: NAUKA,
    });
    console.log("[update] nauka metadata");
  }

  for (const legacySlug of LEGACY_SLUGS) {
    const legacy = await prisma.category.findUnique({ where: { slug: legacySlug } });
    if (!legacy || legacy.id === nauka.id) continue;

    const moved = await prisma.article.updateMany({
      where: { categoryId: legacy.id },
      data: { categoryId: nauka.id },
    });
    console.log(`[merge] ${legacySlug} → nauka: ${moved.count} articles`);
    await prisma.category.delete({ where: { id: legacy.id } });
    console.log(`[delete] ${legacySlug}`);
  }

  console.log(JSON.stringify({ ok: true, naukaId: nauka.id }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
