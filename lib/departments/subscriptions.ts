import type { NewsCategory } from "@/types";

/** Działy redakcyjne — można dodać do ulubionych (powiadomienia o nowych artykułach). */
export const SUBSCRIBABLE_DEPARTMENT_SLUGS = [
  "misje",
  "astronomia",
  "technologie",
  "rozrywka",
  "ai",
  "ziemia-z-kosmosu",
  "iss",
] as const satisfies readonly NewsCategory[];

export type SubscribableDepartmentSlug =
  (typeof SUBSCRIBABLE_DEPARTMENT_SLUGS)[number];

const SLUG_SET = new Set<string>(SUBSCRIBABLE_DEPARTMENT_SLUGS);

export function isSubscribableDepartment(
  slug: string | null | undefined
): slug is SubscribableDepartmentSlug {
  return Boolean(slug && SLUG_SET.has(slug));
}

export const DEPARTMENT_SUBSCRIPTIONS_CHANGE_EVENT =
  "wss:department-subscriptions-changed";
