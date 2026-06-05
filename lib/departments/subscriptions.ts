import type { NewsCategory } from "@/types";
import { canonicalDepartmentSlug } from "@/lib/categories";

/** Działy redakcyjne — można dodać do ulubionych (powiadomienia o nowych artykułach). */
export const SUBSCRIBABLE_DEPARTMENT_SLUGS = [
  "misje",
  "astronomia",
  "nauka",
  "technologie",
  "iss",
  "ziemia-z-kosmosu",
  "rozrywka",
] as const satisfies readonly NewsCategory[];

export type SubscribableDepartmentSlug =
  (typeof SUBSCRIBABLE_DEPARTMENT_SLUGS)[number];

const SLUG_SET = new Set<string>(SUBSCRIBABLE_DEPARTMENT_SLUGS);

export function isSubscribableDepartment(
  slug: string | null | undefined
): slug is SubscribableDepartmentSlug {
  const canonical = canonicalDepartmentSlug(slug);
  return Boolean(canonical && SLUG_SET.has(canonical));
}

/** Normalize legacy category slugs before subscribe/toggle. */
export function normalizeSubscribableDepartment(
  slug: string | null | undefined
): SubscribableDepartmentSlug | null {
  const canonical = canonicalDepartmentSlug(slug);
  return isSubscribableDepartment(canonical) ? canonical : null;
}

export const DEPARTMENT_SUBSCRIPTIONS_CHANGE_EVENT =
  "wss:department-subscriptions-changed";
