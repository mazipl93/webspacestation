/**
 * Post one published article to Facebook + Instagram (reset post ids first).
 * Usage: npx tsx scripts/test-social-post-by-slug.ts <slug>
 */
import { config } from "dotenv";

config({ path: ".env.fb.test" });
config();

import { PrismaClient } from "@prisma/client";
import { getPublishedArticleBySlug } from "../lib/server/articles";
import { publishArticleToFacebook } from "../lib/social/facebook-publish";
import { publishArticleToInstagram } from "../lib/social/instagram-publish";
import { getFacebookConfig } from "../lib/social/facebook-config";
import { getInstagramConfig } from "../lib/social/instagram-config";

const slug = process.argv[2]?.trim();
if (!slug) {
  console.error("Usage: npx tsx scripts/test-social-post-by-slug.ts <slug>");
  process.exitCode = 1;
  process.exit();
}

const prisma = new PrismaClient();

async function main() {
  const fb = getFacebookConfig();
  const ig = getInstagramConfig();
  console.log("FB configured:", !!fb);
  console.log("IG configured:", !!ig);

  const row = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
  if (!row) throw new Error(`Brak artykułu: ${slug}`);

  await prisma.article.update({
    where: { id: row.id },
    data: {
      facebookPostId: null,
      facebookPostedAt: null,
      instagramPostId: null,
      instagramPostedAt: null,
    },
  });
  console.log("Reset facebookPostId + instagramPostId");

  let article = await getPublishedArticleBySlug(slug);
  if (!article) throw new Error("Artykuł nie jest opublikowany lub brak w DB");

  if (fb) {
    await publishArticleToFacebook(article);
    const afterFb = await prisma.article.findUnique({
      where: { id: row.id },
      select: { facebookPostId: true },
    });
    console.log("FB post id:", afterFb?.facebookPostId ?? "(brak)");
  }

  article = await getPublishedArticleBySlug(slug);
  if (!article) throw new Error("Nie udało się wczytać artykułu (IG)");

  if (ig) {
    await publishArticleToInstagram(article);
    const afterIg = await prisma.article.findUnique({
      where: { id: row.id },
      select: { instagramPostId: true },
    });
    console.log("IG media id:", afterIg?.instagramPostId ?? "(brak)");
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
