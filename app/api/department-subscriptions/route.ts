import { NextResponse } from "next/server";
import { isSubscribableDepartment } from "@/lib/departments/subscriptions";
import {
  getSupabaseAuthUserId,
  getUserDepartmentSubscriptions,
} from "@/lib/departments/subscriptions-server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSupabaseAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await getUserDepartmentSubscriptions(userId);
  return NextResponse.json({
    slugs: subscriptions.map((s) => s.slug),
    subscriptions: subscriptions.map((s) => ({
      slug: s.slug,
      subscribedAt: s.subscribedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const userId = await getSupabaseAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { categorySlug?: string };
  try {
    body = (await request.json()) as { categorySlug?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = body.categorySlug?.trim().toLowerCase();
  if (!isSubscribableDepartment(slug)) {
    return NextResponse.json({ error: "Invalid department" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("toggle_department_subscription", {
    p_category_slug: slug,
  });

  if (error) {
    console.error("[department-subscriptions] toggle", error.message);
    const hint =
      error.message.includes("does not exist") ||
      error.message.includes("Could not find")
        ? "Uruchom supabase/user_department_subscriptions.sql w SQL Editor."
        : error.message;
    return NextResponse.json({ error: hint }, { status: 500 });
  }

  const payload = data as { subscribed?: boolean; slugs?: string[] } | null;
  return NextResponse.json({
    subscribed: Boolean(payload?.subscribed),
    slugs: Array.isArray(payload?.slugs) ? payload.slugs : [],
  });
}
