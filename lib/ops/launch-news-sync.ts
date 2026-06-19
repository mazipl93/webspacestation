import "server-only";

import {
  ArticleContentKind,
  ArticleStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createArticle, updateArticle } from "@/lib/server/articles";
import { filterLaunchNewsCandidates } from "@/lib/ops/launch-news-candidates";
import {
  buildLaunchNewsDraftFields,
  extractLaunchSyncFingerprint,
  launchNewsSyncFingerprint,
} from "@/lib/ops/launch-news-template";
import { launchTagFor } from "@/lib/ops/launch-tag";
import type { OpsLaunch } from "@/lib/ops/types";

export type LaunchNewsSyncResult = {
  candidates: number;
  created: number;
  updated: number;
  skipped: number;
  skippedPublished: number;
};

const EDITABLE_STATUSES: ArticleStatus[] = [
  ArticleStatus.DRAFT,
  ArticleStatus.REVIEW,
];

async function getMisjeCategoryId(): Promise<string> {
  const category = await prisma.category.findUnique({
    where: { slug: "misje" },
    select: { id: true },
  });
  if (!category) {
    throw new Error("Brak kategorii misje — uruchom seed bazy.");
  }
  return category.id;
}

async function findArticleByLaunchTag(launchId: string) {
  return prisma.article.findFirst({
    where: { tags: { has: launchTagFor(launchId) } },
    select: {
      id: true,
      slug: true,
      status: true,
      content: true,
    },
  });
}

function shouldUpdateDraft(
  existingContent: string | null,
  launch: OpsLaunch,
): boolean {
  const stored = extractLaunchSyncFingerprint(existingContent);
  const next = launchNewsSyncFingerprint(launch);
  return stored !== next;
}

/**
 * Create or refresh Misje DRAFTs for upcoming launches (T+7d).
 * Never auto-publishes — editors review in CMS.
 */
export async function syncLaunchNewsDrafts(
  launches: OpsLaunch[],
  nowMs = Date.now(),
): Promise<LaunchNewsSyncResult> {
  const candidates = filterLaunchNewsCandidates(launches, nowMs);
  const result: LaunchNewsSyncResult = {
    candidates: candidates.length,
    created: 0,
    updated: 0,
    skipped: 0,
    skippedPublished: 0,
  };

  if (candidates.length === 0) return result;

  const categoryId = await getMisjeCategoryId();

  for (const launch of candidates) {
    try {
      const existing = await findArticleByLaunchTag(launch.id);
      const fields = buildLaunchNewsDraftFields(launch);

      if (existing?.status === ArticleStatus.PUBLISHED) {
        result.skippedPublished += 1;
        continue;
      }

      if (
        existing &&
        !EDITABLE_STATUSES.includes(existing.status)
      ) {
        result.skipped += 1;
        continue;
      }

      if (!existing) {
        await createArticle({
          slug: fields.slug,
          title: fields.title,
          subtitle: null,
          excerpt: fields.excerpt,
          socialCardTitle: null,
          socialCardHook: null,
          content: fields.content,
          contextNote:
            "Szkic zapowiedzi startu (LL2). Sprawdź NET i status przed publikacją.",
          coverImage: fields.coverImage,
          coverImageCredit: fields.coverImage ? LL2_IMAGE_CREDIT : null,
          authorByline: null,
          bylineUserId: null,
          categoryId,
          status: ArticleStatus.DRAFT,
          featured: false,
          heroPosition: 0,
          weekTopicPosition: 0,
          weekTopic: false,
          readingTime: fields.readingTime,
          tags: fields.tags,
          source: fields.source,
          originalUrl: fields.originalUrl,
          publishAt: null,
          contentKind: ArticleContentKind.NEWS,
        });
        result.created += 1;
        continue;
      }

      if (!shouldUpdateDraft(existing.content, launch)) {
        result.skipped += 1;
        continue;
      }

      await updateArticle(existing.id, {
        title: fields.title,
        excerpt: fields.excerpt,
        content: fields.content,
        coverImage: fields.coverImage,
        coverImageCredit: fields.coverImage ? LL2_IMAGE_CREDIT : null,
        readingTime: fields.readingTime,
        tags: fields.tags,
        source: fields.source,
        originalUrl: fields.originalUrl,
      });
      result.updated += 1;
    } catch (err) {
      console.error("[launch-news-sync] failed for", launch.id, err);
      result.skipped += 1;
    }
  }

  return result;
}

const LL2_IMAGE_CREDIT = "Launch Library 2 / The Space Devs";
