/**
 * E2E: krótki artykuł testowy → share-card → post FB z hashtagami pod linkiem.
 * User usuwa post i artykuł ręcznie po weryfikacji.
 *
 * Usage: npx tsx scripts/test-fb-hashtags-live.ts
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
import { revalidateArticlesViaHttp } from "../lib/cache/revalidate-articles";
import { buildFacebookCaption } from "../lib/social/facebook-caption";
import { getFacebookConfig } from "../lib/social/facebook-config";
import { getSiteUrl } from "../lib/site-url";

const WSS_PAGE_ID = "915447778328996";
const TEST_SLUG = "test-fb-hashtagi-live-czerwiec-2026";

const TEST_TITLE = "Test FB: hashtagi pod linkiem w poście WSS";
const TEST_TAGS = ["NASA", "galaktyka", "WebSpaceStation"];
const TEST_CONTENT = `<p>Krótki test automatycznego posta na Facebooku po publikacji artykułu w CMS. Sprawdzamy share-card, link do artykułu i klikalne hashtagi z pola Tagi.</p>`;
const COVER_IMAGE =
  "https://images-assets.nasa.gov/image/PIA25434/PIA25434~orig.jpg";
const COVER_IMAGE_CREDIT = "NASA / Joel Kowsky";

const prisma = new PrismaClient();

function getShareCardUrl(slug: string): string {
  return `${getSiteUrl()}/api/social/share-card/${encodeURIComponent(slug)}`;
}

function getPublicArticleUrl(slug: string): string {
  return `${getSiteUrl()}/aktualnosci/${encodeURIComponent(slug)}`;
}

async function getDefaultAuthorId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!admin) throw new Error("Brak użytkownika ADMIN");
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

async function cleanupExistingTestArticle(): Promise<void> {
  const existing = await prisma.article.findUnique({
    where: { slug: TEST_SLUG },
    select: { id: true },
  });
  if (existing) {
    console.log("Usuwam poprzedni testowy artykuł o tym slugu…");
    await prisma.article.delete({ where: { id: existing.id } });
    await revalidateArticlesViaHttp();
  }
}

async function verifyShareCard(slug: string): Promise<boolean> {
  const url = getShareCardUrl(slug);
  const res = await fetch(url);
  console.log(
    `Share card ${url} → HTTP ${res.status}, type=${res.headers.get("content-type")}`,
  );
  return res.ok && (res.headers.get("content-type") ?? "").includes("image");
}

async function publishToFacebook(article: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  tags: string[];
  facebookPostId: string | null;
}) {
  const fb = getFacebookConfig();
  if (!fb) throw new Error("FB not configured");
  if (article.facebookPostId) return article.facebookPostId;

  const articleUrl = getPublicArticleUrl(article.slug);
  const shareCardUrl = getShareCardUrl(article.slug);
  const caption = buildFacebookCaption(
    {
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      tags: article.tags,
    },
    articleUrl,
  );

  console.log("\n--- Caption FB ---\n", caption, "\n------------------\n");

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
  if (!postId) throw new Error("[facebook] Brak post_id w odpowiedzi");

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
): Promise<string | null> {
  const url = `https://graph.facebook.com/${graphVersion}/${postId}?fields=id,permalink_url&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    permalink_url?: string;
    error?: { message?: string };
  };
  if (data.error) {
    console.error("Graph verify error:", data.error.message);
    return null;
  }
  return data.permalink_url ?? null;
}

async function main() {
  const fb = getFacebookConfig();
  if (!fb) throw new Error("Brak konfiguracji FB w .env.fb.test");
  if (fb.pageId !== WSS_PAGE_ID) {
    throw new Error(`Zły PAGE_ID: ${fb.pageId}`);
  }

  console.log("Site URL:", getSiteUrl());
  console.log("Test slug:", TEST_SLUG);

  await cleanupExistingTestArticle();

  const authorId = await getDefaultAuthorId();
  const categoryId = await getAstronomiaCategoryId();

  const created = await prisma.article.create({
    data: {
      slug: TEST_SLUG,
      title: TEST_TITLE,
      excerpt: "Lead testowy — pomijany gdy jest treść.",
      content: TEST_CONTENT,
      tags: TEST_TAGS,
      status: ArticleStatus.DRAFT,
      contentOrigin: ArticleContentOrigin.EDITORIAL,
      authorId,
      categoryId,
      coverImage: COVER_IMAGE,
      coverImageCredit: COVER_IMAGE_CREDIT,
      readingTime: 1,
    },
    select: { id: true },
  });

  const published = await prisma.article.update({
    where: { id: created.id },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      publishAt: null,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      tags: true,
      facebookPostId: true,
    },
  });

  console.log("Opublikowano w CMS. Revalidacja…");
  await revalidateArticlesViaHttp();

  let shareOk = false;
  for (let attempt = 1; attempt <= 6; attempt++) {
    shareOk = await verifyShareCard(TEST_SLUG);
    if (shareOk) break;
    await new Promise((r) => setTimeout(r, 2500));
  }
  if (!shareOk) throw new Error("Share-card nie odpowiada na prod");

  const postId = await publishToFacebook(published);
  const permalink = await verifyFacebookPost(
    postId,
    fb.accessToken,
    fb.graphVersion,
  );

  console.log("\n✓ Test OK — usuń ręcznie post FB i artykuł w CMS");
  console.log(`  Post FB: ${permalink ?? postId}`);
  console.log(`  Artykuł: ${getPublicArticleUrl(TEST_SLUG)}`);
  console.log(`  Slug CMS: ${TEST_SLUG}`);
}

main()
  .catch((e) => {
    console.error("\n✗ Test FAILED:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
