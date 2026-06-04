/**
 * Tylko okładki redakcyjnych artykułów (21 slugów) — minimalny load na pool DB.
 *
 *   npx tsx scripts/fix-editorial-covers.ts
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { ALL_EDITORIAL_JUNE_2026 } from "../lib/editorial/editorial-june-2026-all";
import { isEditorialCoverSlug } from "../lib/editorial/resolve-editorial-cover";
import { editorialCoverForSlug } from "../lib/editorial/nasa-cover";
import {
  isRozrywkaArticleSlug,
  rozrywkaCoverForSlug,
} from "../lib/editorial/rozrywka";

config();

const prisma = new PrismaClient({
  datasources: process.env.DIRECT_URL
    ? { db: { url: process.env.DIRECT_URL } }
    : undefined,
});

async function main() {
  let ok = 0;
  for (const draft of ALL_EDITORIAL_JUNE_2026) {
    const result = await prisma.article.updateMany({
      where: { slug: draft.slug },
      data: {
        coverImage: isRozrywkaArticleSlug(draft.slug)
          ? (rozrywkaCoverForSlug(draft.slug) ?? draft.coverImage)
          : isEditorialCoverSlug(draft.slug)
            ? editorialCoverForSlug(draft.slug)
            : draft.coverImage,
        coverImageCredit: draft.coverImageCredit,
      },
    });
    if (result.count > 0) {
      ok += 1;
      console.log(`[ok] ${draft.slug}`);
    } else {
      console.log(`[skip] ${draft.slug} — brak w DB`);
    }
  }
  console.log(JSON.stringify({ updated: ok, total: ALL_EDITORIAL_JUNE_2026.length }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
