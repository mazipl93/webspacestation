import { NextResponse } from "next/server";
import { canAccessCms } from "@/lib/auth/permissions";
import { getCurrentUser as getSupabaseUser } from "@/lib/auth/session";
import { toSessionUser } from "@/lib/auth/session-user";
import { getAuthContext } from "@/lib/auth/user";

/** Server-side session probe — reads httpOnly cookies without dynamic root layout. */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [ctx, supaUser] = await Promise.all([
      getAuthContext(),
      getSupabaseUser(),
    ]);
    if (!ctx.authenticated) {
      return NextResponse.json({ user: null });
    }
    const base = toSessionUser(supaUser);
    if (!base) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({
      user: {
        ...base,
        name: ctx.displayName,
        avatarUrl: ctx.avatarUrl ?? base.avatarUrl,
        canAccessCms: canAccessCms(ctx.user?.role),
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
