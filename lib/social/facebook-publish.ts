import "server-only";

import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { buildFacebookCaption } from "@/lib/social/facebook-caption";
import { getFacebookConfig } from "@/lib/social/facebook-config";
import type { ArticleWithRelations } from "@/lib/server/articles";

type FacebookPhotoResponse = {
  id?: string;
  post_id?: string;
  error?: { message?: string; type?: string; code?: number };
};

export function getShareCardUrl(slug: string): string {
  return `${getSiteUrl()}/api/social/share-card/${encodeURIComponent(slug)}`;
}

export function getPublicArticleUrl(slug: string): string {
  return `${getSiteUrl()}/aktualnosci/${encodeURIComponent(slug)}`;
}

/**
 * Posts a branded photo + caption to the Facebook Page.
 * No-op when FACEBOOK_AUTO_POST is not configured.
 */
export async function publishArticleToFacebook(
  article: ArticleWithRelations,
): Promise<void> {
  const config = getFacebookConfig();
  if (!config) return;

  if (article.facebookPostId) return;

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

  const endpoint = `https://graph.facebook.com/${config.graphVersion}/${config.pageId}/photos`;
  const body = new URLSearchParams({
    url: shareCardUrl,
    caption,
    access_token: config.accessToken,
  });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as FacebookPhotoResponse;

  if (!res.ok || data.error) {
    const message =
      data.error?.message ?? `Facebook API HTTP ${res.status}`;
    throw new Error(`[facebook] ${message}`);
  }

  const postId = data.post_id ?? data.id;
  if (!postId) {
    throw new Error("[facebook] Brak post_id w odpowiedzi API.");
  }

  await prisma.article.update({
    where: { id: article.id },
    data: {
      facebookPostId: postId,
      facebookPostedAt: new Date(),
    },
  });
}

export async function publishArticleToFacebookSafe(
  article: ArticleWithRelations,
): Promise<void> {
  try {
    await publishArticleToFacebook(article);
  } catch (error) {
    console.error(
      "[facebook] Auto-post failed:",
      article.slug,
      error instanceof Error ? error.message : error,
    );
  }
}
