import "server-only";

import { createClient } from "@/lib/supabase/server";
import { canonicalDepartmentSlug } from "@/lib/categories";
import { isSubscribableDepartment } from "@/lib/departments/subscriptions";

export type DepartmentSubscription = {
  slug: string;
  subscribedAt: Date;
};

export async function getSupabaseAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getUserDepartmentSubscriptions(
  userId: string
): Promise<DepartmentSubscription[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_department_subscriptions")
    .select("category_slug, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[department-subscriptions] load failed", error.message);
    return [];
  }

  const seen = new Set<string>();
  const out: DepartmentSubscription[] = [];

  for (const row of data ?? []) {
    const slug = canonicalDepartmentSlug(row.category_slug);
    if (!isSubscribableDepartment(slug) || seen.has(slug)) continue;
    seen.add(slug);
    out.push({
      slug,
      subscribedAt: new Date(row.created_at),
    });
  }

  return out;
}
