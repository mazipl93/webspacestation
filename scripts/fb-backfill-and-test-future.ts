/**
 * 1) Backfill FB post for an already-published article (by slug).
 * 2) E2E test: DRAFT → articleStateTransition(PUBLISH) → FB post (prod code path).
 *
 * Usage:
 *   npx tsx scripts/fb-backfill-and-test-future.ts
 *   npx tsx scripts/fb-backfill-and-test-future.ts --slug=my-article-slug
 */
import { config } from "dotenv";

config({ path: ".env.fb.test" });
config();

import {
  ArticleContentOrigin,
  ArticleStatus,
  PrismaClient,
  Role,
} from "@prisma/client";
import { buildFacebookCaption } from "../lib/social/facebook-caption";
import { getFacebookConfig } from "../lib/social/facebook-config";
import { getSiteUrl } from "../lib/site-url";

const WSS_PAGE_ID = "915447778328996";
const BACKFILL_SLUG =
  "astoroida-zabila-dinozaury-chicxulub-8-milionow-lat-zycie";
const TEST_SLUG = "test-fb-autopost-future-czerwiec-2026";

const prisma = new PrismaClient();

const articleInclude = {
  category: { select: { id: true, slug: true, name: true, colorTheme: true } },
  author: { select: { id: true, name: true, role: true } },
  bylineUser: {
    select: { id: true, name: true, role: true, avatarUrl: true },
  },
} as const;

function getShareCardUrl(slug: string): string {
  return `${getSiteUrl()}/api/social/share-card/${encodeURIComponent(slug)}`;
}

function getPublicArticleUrl(slug: string): string {
  return `${getSiteUrl()}/aktualnosci/${encodeURIComponent(slug)}`;
}

function parseSlugArg(): string {
  const arg = process.argv.find((a) => a.startsWith("--slug="));
  return arg?.slice("--slug=".length) ?? BACKFILL_SLUG;
}

async function assertFbConfig() {
  const fb = getFacebookConfig();
  if (!fb) {
    throw new Error(
      "FB nie skonfigurowany — ustaw FACEBOOK_AUTO_POST=true w .env.fb.test",
    );
  }
  if (fb.pageId !== WSS_PAGE_ID) {
    throw new Error(`Zły PAGE_ID: ${fb.pageId}`);
  }

  const tokenCheck = await fetch(
    `https://graph.facebook.com/${fb.graphVersion}/me?fields=id,name&access_token=${encodeURIComponent(fb.accessToken)}`,
  );
  const tokenData = (await tokenCheck.json()) as {
    id?: string;
    name?: string;
    error?: { message?: string };
  };
  if (tokenData.error) {
    throw new Error(`Token FB: ${tokenData.error.message}`);
  }
  if (tokenData.id !== WSS_PAGE_ID) {
    throw new Error(`Token dla ${tokenData.name}, wymagane WSS`);
  }

  console.log("FB OK:", tokenData.name, `| site: ${getSiteUrl()}`);
  return fb;
}

async function verifyShareCard(slug: string): Promise<void> {
  const url = getShareCardUrl(slug);
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url);
    const ok =
      res.ok && (res.headers.get("content-type") ?? "").includes("image");
    console.log(`Share-card ${slug} → HTTP ${res.status} (try ${attempt}/5)`);
    if (ok) return;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Share-card nie działa dla ${slug}`);
}

async function postArticleToFacebook(article: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  subtitle: string | null;
  content: string | null;
  tags: string[];
  facebookPostId: string | null;
}) {
  const fb = getFacebookConfig();
  if (!fb) throw new Error("FB not configured");
  if (article.facebookPostId) {
    console.log(`  Już ma facebookPostId: ${article.facebookPostId}`);
    return article.facebookPostId;
  }

  await verifyShareCard(article.slug);

  const articleUrl = getPublicArticleUrl(article.slug);
  const shareCardUrl = getShareCardUrl(article.slug);
  const caption = buildFacebookCaption(
    {
      title: article.title,
      excerpt: article.excerpt,
      subtitle: article.subtitle,
      content: article.content,
      tags: article.tags,
    },
    articleUrl,
  );

  const endpoint = `https://graph.facebook.com/${fb.graphVersion}/${fb.pageId}/photos`;
  const body = new URLSearchParams({
    url: shareCardUrl,
    caption,
    access_token: fb.accessToken,
  });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as {
    id?: string;
    post_id?: string;
    error?: { message?: string; code?: number };
  };

  if (!res.ok || data.error) {
    throw new Error(
      `[facebook] ${data.error?.message ?? `HTTP ${res.status}`} (code ${data.error?.code ?? "?"})`,
    );
  }

  const postId = data.post_id ?? data.id;
  if (!postId) throw new Error("[facebook] Brak post_id");

  await prisma.article.update({
    where: { id: article.id },
    data: { facebookPostId: postId, facebookPostedAt: new Date() },
  });

  return postId;
}

async function verifyFacebookPost(
  postId: string,
  token: string,
  graphVersion: string,
): Promise<string> {
  const url = `https://graph.facebook.com/${graphVersion}/${postId}?fields=id,permalink_url&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    permalink_url?: string;
    error?: { message?: string };
  };
  if (data.error) throw new Error(data.error.message);
  return data.permalink_url ?? postId;
}

async function backfillSlug(slug: string, fb: NonNullable<ReturnType<typeof getFacebookConfig>>) {
  console.log(`\n=== Backfill: ${slug} ===`);

  const article = await prisma.article.findUnique({
    where: { slug },
    include: articleInclude,
  });

  if (!article) throw new Error(`Brak artykułu: ${slug}`);
  if (article.status !== ArticleStatus.PUBLISHED) {
    throw new Error(`Artykuł nie jest PUBLISHED (${article.status})`);
  }

  const postId = await postArticleToFacebook(article);
  const permalink = await verifyFacebookPost(
    postId,
    fb.accessToken,
    fb.graphVersion,
  );

  console.log("✓ Backfill OK");
  console.log(`  FB: ${permalink}`);
  console.log(`  URL: ${getPublicArticleUrl(slug)}`);
}

async function getDefaultAuthorId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!admin) throw new Error("Brak ADMIN");
  return admin.id;
}

async function getAstronomiaCategoryId(): Promise<string> {
  const cat = await prisma.category.findFirst({
    where: { slug: "astronomia" },
    select: { id: true },
  });
  if (!cat) throw new Error("Brak kategorii astronomia");
  return cat.id;
}

async function ensureTestDraft() {
  const authorId = await getDefaultAuthorId();
  const categoryId = await getAstronomiaCategoryId();

  const existing = await prisma.article.findUnique({
    where: { slug: TEST_SLUG },
    select: { id: true, facebookPostId: true },
  });

  if (existing) {
    await prisma.article.update({
      where: { id: existing.id },
      data: {
        status: ArticleStatus.DRAFT,
        publishedAt: null,
        publishAt: null,
        facebookPostId: null,
        facebookPostedAt: null,
      },
    });
    return existing.id;
  }

  const created = await prisma.article.create({
    data: {
      slug: TEST_SLUG,
      title: "Test: przyszły auto-post FB po publikacji w CMS",
      excerpt: "Krótki test ścieżki articleStateTransition → Facebook.",
      content:
        "<p>Test automatycznego posta na fanpage po pierwszej publikacji. Można usunąć po weryfikacji.</p>",
      tags: ["test", "WSS"],
      status: ArticleStatus.DRAFT,
      contentOrigin: ArticleContentOrigin.EDITORIAL,
      authorId,
      categoryId,
      coverImage:
        "https://images-assets.nasa.gov/image/PIA25434/PIA25434~orig.jpg",
      coverImageCredit: "NASA",
    },
    select: { id: true },
  });
  return created.id;
}

async function testFutureAutopost(
  fb: NonNullable<ReturnType<typeof getFacebookConfig>>,
) {
  console.log(`\n=== Test przyszłego auto-postu (${TEST_SLUG}) ===`);

  const articleId = await ensureTestDraft();
  console.log("Draft id:", articleId);

  // Publish as DRAFT first so articleStateTransition runs first-publish path
  await prisma.article.update({
    where: { id: articleId },
    data: { status: ArticleStatus.DRAFT, publishedAt: null },
  });

  await verifyShareCard(TEST_SLUG).catch(() => {
    console.log("(share-card przed publikacją może być 404 — OK)");
  });

  // Ten sam hook co lib/server/articles.ts po pierwszym PUBLISH (bez server-only w skrypcie).
  const before = await prisma.article.findUnique({
    where: { id: articleId },
    select: { status: true },
  });
  if (!before) throw new Error("Brak draftu testowego");

  console.log("Publikuję DRAFT → PUBLISHED + auto-post FB…");
  const published = await prisma.article.update({
    where: { id: articleId },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      publishAt: null,
    },
    include: articleInclude,
  });

  const isFirstPublish =
    before.status !== ArticleStatus.PUBLISHED && !published.facebookPostId;
  if (isFirstPublish) {
    await postArticleToFacebook(published);
  }

  const after = await prisma.article.findUnique({
    where: { id: articleId },
    select: { facebookPostId: true },
  });
  if (!after?.facebookPostId) {
    throw new Error(
      "Brak facebookPostId po PUBLISH — auto-post nie zadziałał (sprawdź FACEBOOK_AUTO_POST)",
    );
  }

  const permalink = await verifyFacebookPost(
    after.facebookPostId,
    fb.accessToken,
    fb.graphVersion,
  );

  console.log("✓ Test przyszłego auto-postu OK");
  console.log(`  FB: ${permalink}`);
  console.log(`  facebookPostId: ${after.facebookPostId}`);
  console.log(`  Artykuł (usuń ręcznie): ${getPublicArticleUrl(TEST_SLUG)}`);
}

async function main() {
  const fb = await assertFbConfig();
  const slug = parseSlugArg();

  await backfillSlug(slug, fb);
  await testFutureAutopost(fb);

  console.log("\n=== Wszystko OK ===");
}

main()
  .catch((e) => {
    console.error("\n✗ FAILED:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
