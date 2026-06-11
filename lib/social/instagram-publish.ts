import "server-only";

import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { buildInstagramCaption } from "@/lib/social/instagram-caption";
import { getInstagramConfig } from "@/lib/social/instagram-config";
import type { ArticleWithRelations } from "@/lib/server/articles";

type GraphError = { message?: string; type?: string; code?: number };

type MediaContainerResponse = {
  id?: string;
  error?: GraphError;
};

type MediaPublishResponse = {
  id?: string;
  error?: GraphError;
};

type ContainerStatusResponse = {
  status_code?: "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";
  error?: GraphError;
};

const CONTAINER_POLL_MS = 1500;
const CONTAINER_POLL_MAX = 12;

export function getInstagramCardUrl(slug: string): string {
  return `${getSiteUrl()}/api/social/instagram-card/${encodeURIComponent(slug)}`;
}

export function getPublicArticleUrl(slug: string): string {
  return `${getSiteUrl()}/aktualnosci/${encodeURIComponent(slug)}`;
}

async function waitForContainerReady(
  containerId: string,
  config: { accessToken: string; graphVersion: string },
): Promise<void> {
  for (let attempt = 0; attempt < CONTAINER_POLL_MAX; attempt++) {
    const url =
      `https://graph.facebook.com/${config.graphVersion}/${containerId}` +
      `?fields=status_code&access_token=${encodeURIComponent(config.accessToken)}`;

    const res = await fetch(url);
    const data = (await res.json()) as ContainerStatusResponse;

    if (data.error) {
      throw new Error(`[instagram] Container status: ${data.error.message}`);
    }

    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR" || data.status_code === "EXPIRED") {
      throw new Error(
        `[instagram] Container ${containerId} failed: ${data.status_code}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, CONTAINER_POLL_MS));
  }

  throw new Error("[instagram] Timeout waiting for media container.");
}

/**
 * Posts branded 1080×1350 image + caption to Instagram Business account.
 * No-op when INSTAGRAM_AUTO_POST is not configured.
 */
export async function publishArticleToInstagram(
  article: ArticleWithRelations,
): Promise<void> {
  const config = getInstagramConfig();
  if (!config) return;

  if (article.instagramPostId) return;

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

  const createEndpoint =
    `https://graph.facebook.com/${config.graphVersion}/${config.businessAccountId}/media`;
  const createBody = new URLSearchParams({
    image_url: cardUrl,
    caption,
    access_token: config.accessToken,
  });

  const createRes = await fetch(createEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: createBody,
  });

  const createData = (await createRes.json()) as MediaContainerResponse;

  if (!createRes.ok || createData.error) {
    const message =
      createData.error?.message ?? `Instagram API HTTP ${createRes.status}`;
    throw new Error(`[instagram] ${message}`);
  }

  const containerId = createData.id;
  if (!containerId) {
    throw new Error("[instagram] Brak id kontenera w odpowiedzi API.");
  }

  await waitForContainerReady(containerId, config);

  const publishEndpoint =
    `https://graph.facebook.com/${config.graphVersion}/${config.businessAccountId}/media_publish`;
  const publishBody = new URLSearchParams({
    creation_id: containerId,
    access_token: config.accessToken,
  });

  const publishRes = await fetch(publishEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: publishBody,
  });

  const publishData = (await publishRes.json()) as MediaPublishResponse;

  if (!publishRes.ok || publishData.error) {
    const message =
      publishData.error?.message ?? `Instagram publish HTTP ${publishRes.status}`;
    throw new Error(`[instagram] ${message}`);
  }

  const postId = publishData.id;
  if (!postId) {
    throw new Error("[instagram] Brak media id po publikacji.");
  }

  await prisma.article.update({
    where: { id: article.id },
    data: {
      instagramPostId: postId,
      instagramPostedAt: new Date(),
    },
  });
}

export async function publishArticleToInstagramSafe(
  article: ArticleWithRelations,
): Promise<void> {
  try {
    await publishArticleToInstagram(article);
  } catch (error) {
    console.error(
      "[instagram] Auto-post failed:",
      article.slug,
      error instanceof Error ? error.message : error,
    );
  }
}
