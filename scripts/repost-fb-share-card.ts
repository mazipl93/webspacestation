/**
 * Ustawia tekst na grafice FB, czyści facebookPostId i ponownie publikuje post.
 *
 * Usage:
 *   npx tsx scripts/repost-fb-share-card.ts --slug=astoroida-zabila-dinozaury-chicxulub-8-milionow-lat-zycie
 */
import { config } from "dotenv";

config({ path: ".env.fb.test" });
config();

import { PrismaClient } from "@prisma/client";
import { buildFacebookCaption } from "../lib/social/facebook-caption";
import { getFacebookConfig } from "../lib/social/facebook-config";
import { getSiteUrl } from "../lib/site-url";
import { resolveShareCardCopy } from "../lib/social/share-card-copy";

const prisma = new PrismaClient();

const DEFAULT_SLUG =
  "asteroida-zabila-dinozaury-chicxulub-8-milionow-lat-zycie";

const DEFAULT_SOCIAL_TITLE = "Asteroida zabiła dinozaury";
const DEFAULT_SOCIAL_HOOK =
  "Pod Chicxulub mogły panować warunki sprzyjające życiu przez 8 mln lat.";

function argValue(prefix: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`${prefix}=`));
  return hit?.slice(prefix.length + 1);
}

function getShareCardUrl(slug: string): string {
  return `${getSiteUrl()}/api/social/share-card/${encodeURIComponent(slug)}`;
}

function getPublicArticleUrl(slug: string): string {
  return `${getSiteUrl()}/aktualnosci/${encodeURIComponent(slug)}`;
}

async function verifyShareCard(slug: string): Promise<void> {
  const url = getShareCardUrl(slug);
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch(url);
    console.log(`Share-card → HTTP ${res.status} (try ${attempt}/6)`);
    if (res.ok && (res.headers.get("content-type") ?? "").includes("image")) {
      return;
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  throw new Error("Share-card nie zwraca obrazu — poczekaj na deploy lub revalidację.");
}

async function main() {
  const slug = argValue("--slug") ?? DEFAULT_SLUG;
  const socialTitle = argValue("--title") ?? DEFAULT_SOCIAL_TITLE;
  const socialHook = argValue("--hook") ?? DEFAULT_SOCIAL_HOOK;

  const fb = getFacebookConfig();
  if (!fb) throw new Error("Brak FACEBOOK_AUTO_POST / token w .env.fb.test");

  const existing = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: { select: { slug: true, name: true } },
    },
  });
  if (!existing) throw new Error(`Brak artykułu: ${slug}`);
  if (existing.status !== "PUBLISHED") {
    throw new Error(`Artykuł nie jest opublikowany (${existing.status})`);
  }

  console.log("Aktualizuję tekst na grafice + reset facebookPostId…");
  const article = await prisma.article.update({
    where: { id: existing.id },
    data: {
      socialCardTitle: socialTitle,
      socialCardHook: socialHook,
      facebookPostId: null,
      facebookPostedAt: null,
    },
    include: {
      category: { select: { id: true, slug: true, name: true } },
    },
  });

  const cardCopy = resolveShareCardCopy({
    socialCardTitle: article.socialCardTitle,
    socialCardHook: article.socialCardHook,
    title: article.title,
    subtitle: article.subtitle,
  });
  console.log("Grafika FB:");
  console.log("  nagłówek:", cardCopy.title);
  console.log("  linia:", cardCopy.hook ?? "(brak)");

  await verifyShareCard(slug);

  const articleUrl = getPublicArticleUrl(slug);
  const shareCardUrl = getShareCardUrl(slug);
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

  console.log("Wysyłam post na Facebook…");
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
  if (!postId) throw new Error("Brak post_id w odpowiedzi FB");

  await prisma.article.update({
    where: { id: article.id },
    data: { facebookPostId: postId, facebookPostedAt: new Date() },
  });

  const verify = await fetch(
    `https://graph.facebook.com/${fb.graphVersion}/${postId}?fields=permalink_url&access_token=${encodeURIComponent(fb.accessToken)}`,
  );
  const verifyData = (await verify.json()) as { permalink_url?: string };

  console.log("\n✓ Post OK");
  console.log(`  FB: ${verifyData.permalink_url ?? postId}`);
  console.log(`  Artykuł: ${articleUrl}`);
  console.log(`  Share-card: ${shareCardUrl}`);
}

main()
  .catch((e) => {
    console.error("\n✗", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
