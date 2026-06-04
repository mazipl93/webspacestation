import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/user";
import { getCurrentUser } from "@/lib/auth/session";
import { syncAppUserFromSupabase } from "@/lib/server/sync-user-profile";

export const dynamic = "force-dynamic";

/** After profile name/avatar change in Supabase metadata — mirror to Prisma User. */
export async function POST() {
  const { authenticated, user } = await getAuthContext();
  if (!authenticated || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supaUser = await getCurrentUser();
  await syncAppUserFromSupabase(user.id, supaUser);

  return NextResponse.json({ ok: true });
}
