import "server-only";

import { CATEGORY_INFO } from "@/lib/categories";
import { formatRelativePublishLabel } from "@/lib/articles/public-publish-time";
import { fetchUpcomingLaunches } from "@/lib/ops/launch-library";
import type { OpsLaunch } from "@/lib/ops/types";
import { getPublishedArticles } from "@/lib/server/articles";
import type { DepartmentSubscription } from "@/lib/departments/subscriptions-server";
import type { NotificationItem } from "@/lib/notifications";

const ARTICLE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const LAUNCH_MAX_AHEAD_MS = 7 * 24 * 60 * 60 * 1000;
const LAUNCH_IMMINENT_MS = 48 * 60 * 60 * 1000;
const MAX_ARTICLES = 8;
const MAX_LAUNCHES = 5;

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function formatUpcomingLaunchTime(netIso: string, nowMs: number): string {
  const diffMs = new Date(netIso).getTime() - nowMs;
  if (diffMs <= 0) return "okno startowe";
  const min = Math.floor(diffMs / 60_000);
  if (min < 60) return `za ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `za ${hours} godz.`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "jutro";
  return `za ${days} dni`;
}

type FeedRow = NotificationItem & { sortMs: number };

function launchNotification(launch: OpsLaunch, nowMs: number): FeedRow {
  const netMs = new Date(launch.net).getTime();
  const imminent = netMs - nowMs <= LAUNCH_IMMINENT_MS;
  const when = formatUpcomingLaunchTime(launch.net, nowMs);
  const rocket = launch.rocketName ? ` · ${launch.rocketName}` : "";

  return {
    id: `launch:${launch.id}`,
    icon: imminent ? "rocket" : "calendar",
    accent: `hsl(${launch.hue} 70% 55%)`,
    title: `Start ${when}: ${launch.mission}`,
    body: truncate(
      `${launch.provider}${rocket} — ${launch.site}. ${launch.statusLabel}`,
      140
    ),
    time: new Date(launch.net).toLocaleString("pl-PL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    href: "/starty",
    sortMs: netMs,
  };
}

function articleNotification(
  slug: string,
  title: string,
  excerpt: string,
  categorySlug: string,
  publishedAt: Date,
  nowMs: number
): FeedRow {
  const cat =
    CATEGORY_INFO[categorySlug as keyof typeof CATEGORY_INFO] ??
    CATEGORY_INFO.misje;

  return {
    id: `article:${slug}`,
    icon: "sparkles",
    accent: cat.color,
    title: `Nowy artykuł · ${cat.label}`,
    body: truncate(excerpt || title, 140),
    time: formatRelativePublishLabel(publishedAt, nowMs),
    href: `/aktualnosci/${slug}`,
    sortMs: publishedAt.getTime(),
  };
}

export async function buildNotificationFeed(
  departmentSubscriptions: DepartmentSubscription[] = []
): Promise<NotificationItem[]> {
  const nowMs = Date.now();
  const rows: FeedRow[] = [];
  const subscribedAtBySlug = new Map(
    departmentSubscriptions.map((s) => [s.slug, s.subscribedAt.getTime()])
  );

  const [launches, articles] = await Promise.all([
    fetchUpcomingLaunches(12).catch(() => [] as OpsLaunch[]),
    subscribedAtBySlug.size > 0
      ? getPublishedArticles().catch(() => [])
      : Promise.resolve([]),
  ]);

  let launchCount = 0;
  for (const launch of launches) {
    const netMs = new Date(launch.net).getTime();
    if (netMs < nowMs) continue;
    if (netMs - nowMs > LAUNCH_MAX_AHEAD_MS) continue;
    rows.push(launchNotification(launch, nowMs));
    launchCount += 1;
    if (launchCount >= MAX_LAUNCHES) break;
  }

  let articleCount = 0;
  for (const article of articles) {
    const publishedAt = article.publishedAt
      ? new Date(article.publishedAt)
      : null;
    if (!publishedAt) continue;

    const categorySlug = article.category?.slug ?? "";
    const subscribedAtMs = subscribedAtBySlug.get(categorySlug);
    if (subscribedAtMs == null) continue;

    const publishedMs = publishedAt.getTime();
    if (publishedMs < subscribedAtMs) continue;
    if (nowMs - publishedMs > ARTICLE_MAX_AGE_MS) continue;

    const slug = article.slug;
    rows.push(
      articleNotification(
        slug,
        article.title,
        article.excerpt ?? "",
        categorySlug,
        publishedAt,
        nowMs
      )
    );
    articleCount += 1;
    if (articleCount >= MAX_ARTICLES) break;
  }

  rows.sort((a, b) => b.sortMs - a.sortMs);

  return rows.map(({ sortMs: _sortMs, ...item }) => item);
}
