import "server-only";

import { createClient } from "@/lib/supabase/server";
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

  return (data ?? [])
    .filter((row) => isSubscribableDepartment(row.category_slug))
    .map((row) => ({
      slug: row.category_slug,
      subscribedAt: new Date(row.created_at),
    }));
}
