/**
 * E2E test: publish draft → Facebook Page post (production DB + FB API).
 * Usage: npx tsx scripts/test-facebook-auto-post.ts
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

const prisma = new PrismaClient();
const TEST_SLUG = "test-fb-auto-post-czerwiec-2026";

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

async function getDefaultCategoryId(): Promise<string> {
  const cat = await prisma.category.findFirst({
    orderBy: { name: "asc" },
    select: { id: true },
  });
  if (!cat) throw new Error("Brak kategorii");
  return cat.id;
}

async function ensureTestDraft() {
  const authorId = await getDefaultAuthorId();
  const categoryId = await getDefaultCategoryId();

  const existing = await prisma.article.findUnique({
    where: { slug: TEST_SLUG },
    select: { id: true, status: true, facebookPostId: true },
  });

  if (existing?.facebookPostId) {
    console.log("Reset facebookPostId for re-test…");
    await prisma.article.update({
      where: { id: existing.id },
      data: {
        facebookPostId: null,
        facebookPostedAt: null,
        status: ArticleStatus.DRAFT,
        publishedAt: null,
      },
    });
    return existing.id;
  }

  if (existing) {
    if (existing.status !== ArticleStatus.DRAFT) {
      await prisma.article.update({
        where: { id: existing.id },
        data: {
          status: ArticleStatus.DRAFT,
          publishedAt: null,
          facebookPostId: null,
          facebookPostedAt: null,
        },
      });
    }
    return existing.id;
  }

  const created = await prisma.article.create({
    data: {
      slug: TEST_SLUG,
      title: "Test auto-post Facebook — Web Space Station",
      excerpt:
        "Krótki test integracji CMS → Facebook. Ten artykuł można usunąć po weryfikacji.",
      content:
        "<p>Test automatycznej publikacji na fanpage Web Space Station po opublikowaniu artykułu w CMS.</p>",
      status: ArticleStatus.DRAFT,
      contentOrigin: ArticleContentOrigin.EDITORIAL,
      authorId,
      categoryId,
      coverImage:
        "https://images-assets.nasa.gov/image/PIA04291/PIA04291~orig.jpg",
    },
    select: { id: true },
  });
  return created.id;
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
  facebookPostId: string | null;
  category: { name: string };
}) {
  const fb = getFacebookConfig();
  if (!fb) throw new Error("FB not configured");
  if (article.facebookPostId) return article.facebookPostId;

  const articleUrl = getPublicArticleUrl(article.slug);
  const shareCardUrl = getShareCardUrl(article.slug);
  const caption = buildFacebookCaption(article, articleUrl);

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
    error?: { message?: string; code?: number; type?: string };
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
  const url = `https://graph.facebook.com/${graphVersion}/${postId}?fields=id,permalink_url,created_time&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    id?: string;
    permalink_url?: string;
    error?: { message?: string };
  };
  if (data.error) {
    console.error("Graph verify error:", data.error.message);
    return null;
  }
  console.log("Facebook post verified:", data.id, data.permalink_url ?? "");
  return data.permalink_url ?? data.id ?? null;
}

async function main() {
  const fb = getFacebookConfig();
  console.log("FB config:", {
    enabled: fb?.enabled ?? false,
    pageId: fb?.pageId ?? "(missing)",
    graphVersion: fb?.graphVersion ?? "(missing)",
    hasToken: !!fb?.accessToken,
    autoPostEnv: JSON.stringify(process.env.FACEBOOK_AUTO_POST),
    siteUrl: getSiteUrl(),
  });

  if (!fb) {
    throw new Error(
      "Facebook auto-post nie skonfigurowany — ustaw FACEBOOK_AUTO_POST=true oraz PAGE_ID/TOKEN",
    );
  }

  if (fb.pageId !== WSS_PAGE_ID) {
    throw new Error(
      `FACEBOOK_PAGE_ID musi być Web Space Station (${WSS_PAGE_ID}), jest: ${fb.pageId}`,
    );
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
    throw new Error(`Token FB nieprawidłowy: ${tokenData.error.message}`);
  }
  if (tokenData.id !== WSS_PAGE_ID) {
    throw new Error(
      `Token należy do strony ${tokenData.name} (${tokenData.id}), wymagane Web Space Station (${WSS_PAGE_ID})`,
    );
  }
  console.log("Target page:", tokenData.name, `(${tokenData.id})`);

  const articleId = await ensureTestDraft();
  console.log("Test article id:", articleId, "slug:", TEST_SLUG);

  console.log("Publishing article (DRAFT → PUBLISHED)…");
  const published = await prisma.article.update({
    where: { id: articleId },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      publishAt: null,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  console.log("Revalidating article cache on production…");
  await revalidateArticlesViaHttp();

  // share-card uses getArticleBySlug → only published + cached articles
  let shareOk = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    shareOk = await verifyShareCard(TEST_SLUG);
    if (shareOk) break;
    console.log(`Share-card retry ${attempt}/5…`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  if (!shareOk) {
    throw new Error("Share-card endpoint nie zwraca obrazu po publikacji");
  }

  console.log("Posting to Facebook…");
  const postId = await publishToFacebook(published);

  const permalink = await verifyFacebookPost(postId, fb.accessToken, fb.graphVersion);
  if (!permalink) throw new Error("Nie udało się zweryfikować posta w Graph API");

  console.log("\n✓ Test OK");
  console.log(`  Post: ${permalink}`);
  console.log(`  Artykuł: ${getPublicArticleUrl(TEST_SLUG)}`);
}

main()
  .catch((e) => {
    console.error("\n✗ Test FAILED:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
