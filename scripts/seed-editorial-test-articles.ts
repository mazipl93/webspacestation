/**
 * Wstawia 2 artykuły redakcyjne (czerwiec 2026) do bazy.
 *
 * Usage:
 *   npx tsx scripts/seed-editorial-test-articles.ts          # REVIEW
 *   npx tsx scripts/seed-editorial-test-articles.ts --publish
 */
import { config } from "dotenv";
import {
  ArticleContentOrigin,
  ArticleStatus,
  PrismaClient,
  Role,
} from "@prisma/client";
import { EDITORIAL_TEST_ARTICLES_JUNE_2026 } from "../lib/editorial/test-articles-june-2026";

config();

const prisma = new PrismaClient();
const publishNow = process.argv.includes("--publish");

async function getDefaultAuthorId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!admin) throw new Error("Brak użytkownika ADMIN — uruchom npm run db:seed");
  return admin.id;
}

/** `originalUrl` jest @unique — RSS mógł już zająć ten link. */
async function resolveOriginalUrlForSeed(
  url: string,
  slug: string
): Promise<string | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const taken = await prisma.article.findUnique({
    where: { originalUrl: trimmed },
    select: { slug: true },
  });
  if (taken && taken.slug !== slug) {
    console.warn(
      `[warn] ${slug}: originalUrl zajęty przez „${taken.slug}” (np. RSS) — zapis bez originalUrl; źródło zostaje w polu source`
    );
    return null;
  }
  return trimmed;
}

async function main() {
  const authorId = await getDefaultAuthorId();
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const bySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const results: {
    slug: string;
    id: string;
    status: string;
    created: boolean;
    preview: string;
  }[] = [];

  for (const draft of EDITORIAL_TEST_ARTICLES_JUNE_2026) {
    const categoryId = bySlug.get(draft.categorySlug);
    if (!categoryId) {
      throw new Error(`Brak kategorii: ${draft.categorySlug}`);
    }

    const existing = await prisma.article.findUnique({
      where: { slug: draft.slug },
      select: { id: true, status: true, slug: true },
    });

    if (existing) {
      results.push({
        slug: draft.slug,
        id: existing.id,
        status: existing.status,
        created: false,
        preview: `/admin/articles/${existing.id}/edit`,
      });
      console.log(`[skip] ${draft.slug} — już istnieje`);
      continue;
    }

    const status = publishNow ? ArticleStatus.PUBLISHED : ArticleStatus.REVIEW;
    const now = new Date();
    const originalUrl = await resolveOriginalUrlForSeed(
      draft.originalUrl,
      draft.slug
    );

    const article = await prisma.article.create({
      data: {
        slug: draft.slug,
        title: draft.title,
        subtitle: draft.subtitle,
        excerpt: draft.excerpt,
        content: draft.content,
        contextNote: draft.contextNote,
        coverImage: draft.coverImage,
        coverImageCredit: draft.coverImageCredit,
        authorByline: "Redakcja WSS",
        categoryId,
        authorId,
        status,
        contentOrigin: ArticleContentOrigin.EDITORIAL,
        featured: draft.featured ?? false,
        heroPosition: draft.heroPosition ?? 0,
        weekTopic: false,
        readingTime: draft.readingTime,
        tags: draft.tags,
        source: draft.source,
        originalUrl,
        publishedAt: publishNow ? now : null,
        publishAt: null,
      },
      select: { id: true, slug: true, status: true },
    });

    results.push({
      slug: article.slug,
      id: article.id,
      status: article.status,
      created: true,
      preview: `/admin/articles/${article.id}/edit`,
    });
    console.log(`[ok] ${article.slug} → ${article.status}`);
  }

  console.log("\nPodgląd CMS:");
  for (const r of results) {
    console.log(`  ${r.slug}: ${r.preview}`);
  }
  if (publishNow) {
    console.log(
      "\nOpublikowano w DB. Na prod uruchom: npm run cache:revalidate"
    );
  } else {
    console.log(
      "\nStatus REVIEW — w CMS: Do sprawdzenia → podgląd → Opublikuj"
    );
  }
  console.log(JSON.stringify({ publishNow, results }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
