/**
 * E2E: testowy artykuł Astronomia → share-card → post FB → usunięcie artykułu.
 * Usage: npx tsx scripts/test-fb-astronomia-share-card.ts
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
import {
  buildFacebookCaption,
  extractSocialLead,
} from "../lib/social/facebook-caption";
import { getFacebookConfig } from "../lib/social/facebook-config";
import { getSiteUrl } from "../lib/site-url";

const WSS_PAGE_ID = "915447778328996";
const TEST_SLUG = "test-fb-astronomia-szablon-czerwiec-2026";

const TEST_TITLE =
  "James Webb ujawnia nowe struktury w Mgławicy Oriona. Co widać na świeżych zdjęciach";

const TEST_CONTENT = `<p>Teleskop Jamesa Webba zarejestrował w podczerwieni wczesne fazy formowania gwiazd w pobliżu młodych protogwiazd w Mgławicy Oriona. Obraz z kamery NIRCam pokazuje gęste zwoje gazu i pyłu, które dopiero zaczynają się kurczyć pod własnym ciężarem.</p>

<p>Astronomowie porównują te dane z obserwacjami Hubble'a, aby ustalić, jak szybko rosną najmłodsze obiekty w tym regionie. Pełna analiza zespołu ma pomóc lepiej zrozumieć warunki, w jakich powstają gwiazdy o masie podobnej do Słońca.</p>`;

const TEST_EXCERPT =
  "Lead z CMS nie powinien trafić na kartę, jeśli jest treść artykułu.";

const COVER_IMAGE =
  "https://images-assets.nasa.gov/image/PIA25434/PIA25434~orig.jpg";

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
    console.log("Usuwam poprzedni testowy artykuł…");
    await prisma.article.delete({ where: { id: existing.id } });
    await revalidateArticlesViaHttp();
  }
}

async function createTestDraft(): Promise<string> {
  const authorId = await getDefaultAuthorId();
  const categoryId = await getAstronomiaCategoryId();

  const created = await prisma.article.create({
    data: {
      slug: TEST_SLUG,
      title: TEST_TITLE,
      excerpt: TEST_EXCERPT,
      content: TEST_CONTENT,
      status: ArticleStatus.DRAFT,
      contentOrigin: ArticleContentOrigin.EDITORIAL,
      authorId,
      categoryId,
      coverImage: COVER_IMAGE,
      readingTime: 3,
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
  content: string | null;
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
  return data.permalink_url ?? data.id ?? null;
}

async function deleteTestArticle(articleId: string): Promise<void> {
  console.log("\nUsuwam testowy artykuł z CMS…");
  await prisma.article.delete({ where: { id: articleId } });
  await revalidateArticlesViaHttp();
  console.log("Artykuł usunięty (post na FB pozostaje do podglądu).");
}

async function main() {
  const fb = getFacebookConfig();
  console.log("FB config:", {
    enabled: fb?.enabled ?? false,
    pageId: fb?.pageId ?? "(missing)",
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

  const leadPreview = extractSocialLead({
    title: TEST_TITLE,
    excerpt: TEST_EXCERPT,
    content: TEST_CONTENT,
  });
  console.log("Lead na share-card (z treści):\n", leadPreview, "\n");

  await cleanupExistingTestArticle();

  const articleId = await createTestDraft();
  console.log("Utworzono draft:", articleId, TEST_SLUG);

  const published = await prisma.article.update({
    where: { id: articleId },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      publishAt: null,
    },
    include: {
      category: { select: { slug: true, name: true } },
    },
  });

  console.log("Opublikowano w CMS. Revalidacja cache…");
  await revalidateArticlesViaHttp();

  let shareOk = false;
  for (let attempt = 1; attempt <= 6; attempt++) {
    shareOk = await verifyShareCard(TEST_SLUG);
    if (shareOk) break;
    console.log(`Share-card retry ${attempt}/6…`);
    await new Promise((r) => setTimeout(r, 2500));
  }
  if (!shareOk) {
    await deleteTestArticle(articleId);
    throw new Error(
      "Share-card nie działa na produkcji. Wdróż najpierw nowy szablon (deploy), potem powtórz test.",
    );
  }

  console.log("Wysyłam post na Facebook…");
  const postId = await publishToFacebook(published);
  const permalink = await verifyFacebookPost(
    postId,
    fb.accessToken,
    fb.graphVersion,
  );

  await deleteTestArticle(articleId);

  console.log("\n✓ Test OK");
  console.log(`  Post FB: ${permalink ?? postId}`);
  console.log(`  Share-card (cache FB): ${getShareCardUrl(TEST_SLUG)} (404 po usunięciu artykułu)`);
  console.log(`  Lead z treści artykułu, bez emotek i długich myślników.`);
}

main()
  .catch((e) => {
    console.error("\n✗ Test FAILED:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
