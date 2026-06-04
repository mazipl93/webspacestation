import { NextResponse } from "next/server";
import {
  getSupabaseAuthUserId,
  getUserDepartmentSubscriptions,
} from "@/lib/departments/subscriptions-server";
import { getAuthContext } from "@/lib/auth/user";
import { buildNotificationFeed } from "@/lib/notifications/build-feed";

export const dynamic = "force-dynamic";

export async function GET() {
  const { authenticated } = await getAuthContext();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = await getSupabaseAuthUserId();
    const subscriptions = userId
      ? await getUserDepartmentSubscriptions(userId)
      : [];
    const items = await buildNotificationFeed(subscriptions);
    return NextResponse.json({
      items,
      subscribedDepartments: subscriptions.map((s) => s.slug),
    });
  } catch (error) {
    console.error("[api/notifications]", error);
    return NextResponse.json(
      { error: "Failed to load notifications" },
      { status: 500 }
    );
  }
}
