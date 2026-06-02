import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { listUsers } from "@/lib/server/users";
import { jsonError } from "@/lib/server/http";

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const users = await listUsers();
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("[GET /api/users]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load users.");
  }
}
