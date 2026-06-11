/**
 * Post one published article to Facebook + Instagram (reset post ids first).
 * Usage: npx tsx scripts/test-social-post-by-slug.ts --slug=<slug>
 */
import { config } from "dotenv";

config({ path: ".env.fb.test" });
config();

import { PrismaClient } from "@prisma/client";
import { buildFacebookCaption } from "../lib/social/facebook-caption";
import { buildInstagramCaption } from "../lib/social/instagram-caption";
import { getFacebookConfig } from "../lib/social/facebook-config";
import { getInstagramConfig } from "../lib/social/instagram-config";
import { getSiteUrl } from "../lib/site-url";

const prisma = new PrismaClient();

function argValue(prefix: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`${prefix}=`));
  return hit?.slice(prefix.length + 1);
}

const slug =
  argValue("--slug") ??
  process.argv.find((a) => !a.startsWith("-") && !a.includes("tsx") && !a.includes("test-social")) ??
  "";

if (!slug) {
  console.error("Usage: npx tsx scripts/test-social-post-by-slug.ts --slug=<slug>");
  process.exit(1);
}

function getShareCardUrl(s: string): string {
  return `${getSiteUrl()}/api/social/share-card/${encodeURIComponent(s)}`;
}

function getInstagramCardUrl(s: string): string {
  return `${getSiteUrl()}/api/social/instagram-card/${encodeURIComponent(s)}`;
}

function getPublicArticleUrl(s: string): string {
  return `${getSiteUrl()}/aktualnosci/${encodeURIComponent(s)}`;
}

async function verifyImageUrl(url: string, label: string): Promise<void> {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch(url);
    console.log(`${label} → HTTP ${res.status} (try ${attempt}/6)`);
    if (res.ok && (res.headers.get("content-type") ?? "").includes("image")) return;
    await new Promise((r) => setTimeout(r, 2500));
  }
  throw new Error(`${label} nie zwraca obrazu`);
}

async function postFacebook(article: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  subtitle: string | null;
  content: unknown;
  tags: string[];
}): Promise<string> {
  const fb = getFacebookConfig();
  if (!fb) throw new Error("FB not configured");

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

  const body = new URLSearchParams({
    url: shareCardUrl,
    caption,
    access_token: fb.accessToken,
  });

  const res = await fetch(
    `https://graph.facebook.com/${fb.graphVersion}/${fb.pageId}/photos`,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body },
  );
  const data = (await res.json()) as { id?: string; post_id?: string; error?: { message?: string } };
  if (!res.ok || data.error) {
    throw new Error(`[facebook] ${data.error?.message ?? `HTTP ${res.status}`}`);
  }
  const postId = data.post_id ?? data.id;
  if (!postId) throw new Error("[facebook] Brak post_id");

  await prisma.article.update({
    where: { id: article.id },
    data: { facebookPostId: postId, facebookPostedAt: new Date() },
  });
  return postId;
}

async function waitForIgContainer(
  containerId: string,
  accessToken: string,
  graphVersion: string,
): Promise<void> {
  for (let i = 0; i < 12; i++) {
    const res = await fetch(
      `https://graph.facebook.com/${graphVersion}/${containerId}?fields=status_code&access_token=${encodeURIComponent(accessToken)}`,
    );
    const data = (await res.json()) as { status_code?: string; error?: { message?: string } };
    if (data.error) throw new Error(`[instagram] ${data.error.message}`);
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR" || data.status_code === "EXPIRED") {
      throw new Error(`[instagram] Container ${data.status_code}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("[instagram] Timeout kontenera");
}

async function postInstagram(article: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  subtitle: string | null;
  content: unknown;
  tags: string[];
}): Promise<string> {
  const ig = getInstagramConfig();
  if (!ig) throw new Error("IG not configured");

  const articleUrl = getPublicArticleUrl(article.slug);
  const cardUrl = getInstagramCardUrl(article.slug);
  const caption = buildInstagramCaption(
    {
      title: article.title,
      excerpt: article.excerpt,
      subtitle: article.subtitle,
      content: article.content,
      tags: article.tags,
    },
    articleUrl,
  );

  const createRes = await fetch(
    `https://graph.facebook.com/${ig.graphVersion}/${ig.businessAccountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        image_url: cardUrl,
        caption,
        access_token: ig.accessToken,
      }),
    },
  );
  const createData = (await createRes.json()) as { id?: string; error?: { message?: string } };
  if (!createRes.ok || createData.error) {
    throw new Error(`[instagram] ${createData.error?.message ?? `HTTP ${createRes.status}`}`);
  }
  const containerId = createData.id;
  if (!containerId) throw new Error("[instagram] Brak container id");

  await waitForIgContainer(containerId, ig.accessToken, ig.graphVersion);

  const publishRes = await fetch(
    `https://graph.facebook.com/${ig.graphVersion}/${ig.businessAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        creation_id: containerId,
        access_token: ig.accessToken,
      }),
    },
  );
  const publishData = (await publishRes.json()) as { id?: string; error?: { message?: string } };
  if (!publishRes.ok || publishData.error) {
    throw new Error(`[instagram] ${publishData.error?.message ?? `HTTP ${publishRes.status}`}`);
  }
  const mediaId = publishData.id;
  if (!mediaId) throw new Error("[instagram] Brak media id");

  await prisma.article.update({
    where: { id: article.id },
    data: { instagramPostId: mediaId, instagramPostedAt: new Date() },
  });
  return mediaId;
}

async function main() {
  console.log("Site URL:", getSiteUrl());
  console.log("Slug:", slug);

  const existing = await prisma.article.findUnique({ where: { slug } });
  if (!existing) throw new Error(`Brak artykułu: ${slug}`);
  if (existing.status !== "PUBLISHED") {
    throw new Error(`Artykuł nie opublikowany (${existing.status})`);
  }

  await prisma.article.update({
    where: { id: existing.id },
    data: {
      facebookPostId: null,
      facebookPostedAt: null,
      instagramPostId: null,
      instagramPostedAt: null,
    },
  });
  console.log("Reset post ids OK");

  await verifyImageUrl(getShareCardUrl(slug), "FB share-card");
  await verifyImageUrl(getInstagramCardUrl(slug), "IG share-card");

  const article = await prisma.article.findUniqueOrThrow({ where: { slug } });

  const fbId = await postFacebook(article);
  console.log("FB post id:", fbId);

  const igId = await postInstagram(article);
  console.log("IG media id:", igId);

  const fbPermalink = await fetch(
    `https://graph.facebook.com/v21.0/${fbId}?fields=permalink_url&access_token=${encodeURIComponent(getFacebookConfig()!.accessToken)}`,
  ).then((r) => r.json()) as { permalink_url?: string };
  console.log("FB permalink:", fbPermalink.permalink_url ?? "(brak)");

  console.log("IG profile: https://www.instagram.com/webspacestation/");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
