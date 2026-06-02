import { NextRequest, NextResponse } from "next/server";

import { getCategories } from "@/lib/server/articles";
import { createCategory } from "@/lib/server/categories";
import { jsonError, mapPrismaError, readJson } from "@/lib/server/http";
import { parseCategoryCreate } from "@/lib/server/validation";
import { requirePermission } from "@/lib/auth/guard";
import { canManageCategories } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load categories.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requirePermission(canManageCategories);
    if (!guard.ok) return guard.response;

    const body = await readJson(request);
    if (body === undefined) {
      return jsonError(400, "INVALID_BODY", "Request body must be valid JSON.");
    }

    const parsed = parseCategoryCreate(body);
    if (!parsed.ok) {
      return jsonError(400, "VALIDATION_ERROR", parsed.message);
    }

    const category = await createCategory(parsed.value);
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    console.error("[POST /api/categories]", error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to create category.");
  }
}
