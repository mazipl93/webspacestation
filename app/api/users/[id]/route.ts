import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { isAssignableRole, updateUserRole } from "@/lib/server/users";
import { isValidId, jsonError, readJson } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const { id } = await params;
    if (!isValidId(id)) {
      return jsonError(400, "INVALID_PARAM", "Invalid user id.");
    }

    const body = (await readJson(request)) as { role?: string } | undefined;
    const role = body?.role;
    if (!role || !isAssignableRole(role)) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid role.");
    }

    // Never allow self-demotion via API (ADMIN must manage others).
    if (guard.user.id === id && role !== "ADMIN") {
      return jsonError(403, "FORBIDDEN", "Cannot change your own role.");
    }

    const updated = await updateUserRole(id, role);
    if (!updated) {
      return jsonError(404, "NOT_FOUND", "User not found.");
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/users/[id]]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to update user.");
  }
}
