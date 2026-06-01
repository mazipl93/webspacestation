import { NextRequest, NextResponse } from "next/server";

import { getCategoryById, updateCategory } from "@/lib/server/categories";
import { isValidId, jsonError, mapPrismaError, readJson } from "@/lib/server/http";
import { parseCategoryUpdate } from "@/lib/server/validation";
import { requirePermission } from "@/lib/auth/guard";
import { canManageCategories } from "@/lib/auth/permissions";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/categories/[id] → single category (admin convenience)
export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return jsonError(400, "INVALID_PARAM", "Invalid category id.");
    }
    const category = await getCategoryById(id);
    if (!category) return jsonError(404, "NOT_FOUND", "Category not found.");
    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("[GET /api/categories/[id]]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load category.");
  }
}

// PATCH /api/categories/[id] → update a category (ADMIN only)
export async function PATCH(request: NextRequest, { params }: Ctx) {
  try {
    const guard = await requirePermission(canManageCategories);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    if (!isValidId(id)) {
      return jsonError(400, "INVALID_PARAM", "Invalid category id.");
    }

    const body = await readJson(request);
    if (body === undefined) {
      return jsonError(400, "INVALID_BODY", "Request body must be valid JSON.");
    }

    const parsed = parseCategoryUpdate(body);
    if (!parsed.ok) {
      return jsonError(400, "VALIDATION_ERROR", parsed.message);
    }

    const category = await updateCategory(id, parsed.value);
    if (!category) return jsonError(404, "NOT_FOUND", "Category not found.");
    return NextResponse.json({ data: category });
  } catch (error) {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    console.error("[PATCH /api/categories/[id]]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to update category.");
  }
}
