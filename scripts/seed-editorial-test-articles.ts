/**
 * Wstawia / aktualizuje artykuły redakcyjne (czerwiec 2026, 21 szt.) w bazie.
 *
 * Usage:
 *   npx tsx scripts/seed-editorial-test-articles.ts              # nowe → REVIEW
 *   npx tsx scripts/seed-editorial-test-articles.ts --update     # nadpisz treść istniejących slugów
 *   npx tsx scripts/seed-editorial-test-articles.ts --publish    # nowe → PUBLISHED
 *   npx tsx scripts/seed-editorial-test-articles.ts --update --publish
 */
import { config } from "dotenv";
import {
  ArticleContentOrigin,
  ArticleStatus,
  PrismaClient,
  Role,
} from "@prisma/client";
import { ALL_EDITORIAL_JUNE_2026 } from "../lib/editorial/editorial-june-2026-all";
import { isEditorialCoverSlug } from "../lib/editorial/resolve-editorial-cover";
import { editorialCoverForSlug } from "../lib/editorial/nasa-cover";

config();

const prisma = new PrismaClient();
const publishNow = process.argv.includes("--publish");
const forceUpdate = process.argv.includes("--update");

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

function draftToData(
  draft: (typeof ALL_EDITORIAL_JUNE_2026)[number],
  categoryId: string,
  authorId: string,
  status: ArticleStatus,
  originalUrl: string | null,
  publishedAt: Date | null
) {
  return {
    title: draft.title,
    subtitle: draft.subtitle,
    excerpt: draft.excerpt,
    content: draft.content,
    contextNote: draft.contextNote,
    coverImage: isEditorialCoverSlug(draft.slug)
      ? editorialCoverForSlug(draft.slug)
      : draft.coverImage,
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
    publishedAt,
    publishAt: null as Date | null,
  };
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
    updated: boolean;
    preview: string;
  }[] = [];

  for (const draft of ALL_EDITORIAL_JUNE_2026) {
    const categoryId = bySlug.get(draft.categorySlug);
    if (!categoryId) {
      throw new Error(`Brak kategorii: ${draft.categorySlug}`);
    }

    const existing = await prisma.article.findUnique({
      where: { slug: draft.slug },
      select: { id: true, status: true, slug: true },
    });

    const status = publishNow ? ArticleStatus.PUBLISHED : ArticleStatus.REVIEW;
    const now = new Date();
    const originalUrl = await resolveOriginalUrlForSeed(
      draft.originalUrl,
      draft.slug
    );

    if (existing) {
      if (!forceUpdate) {
        results.push({
          slug: draft.slug,
          id: existing.id,
          status: existing.status,
          created: false,
          updated: false,
          preview: `/admin/articles/${existing.id}/edit`,
        });
        console.log(
          `[skip] ${draft.slug} — już istnieje (użyj --update aby nadpisać treść)`
        );
        continue;
      }

      const data = draftToData(
        draft,
        categoryId,
        authorId,
        publishNow ? ArticleStatus.PUBLISHED : existing.status,
        originalUrl,
        publishNow ? now : null
      );

      const article = await prisma.article.update({
        where: { id: existing.id },
        data: {
          ...data,
          publishedAt: publishNow
            ? now
            : existing.status === ArticleStatus.PUBLISHED
              ? undefined
              : undefined,
        },
        select: { id: true, slug: true, status: true },
      });

      results.push({
        slug: article.slug,
        id: article.id,
        status: article.status,
        created: false,
        updated: true,
        preview: `/admin/articles/${article.id}/edit`,
      });
      console.log(`[update] ${article.slug} → ${article.status}`);
      continue;
    }

    const article = await prisma.article.create({
      data: {
        slug: draft.slug,
        ...draftToData(
          draft,
          categoryId,
          authorId,
          status,
          originalUrl,
          publishNow ? now : null
        ),
      },
      select: { id: true, slug: true, status: true },
    });

    results.push({
      slug: article.slug,
      id: article.id,
      status: article.status,
      created: true,
      updated: false,
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
  console.log(
    JSON.stringify({ publishNow, forceUpdate, count: results.length, results }, null, 2)
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
