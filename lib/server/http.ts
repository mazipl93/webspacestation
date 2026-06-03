import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Slugs are lowercase alphanumeric words separated by single hyphens.
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(value: string | null | undefined): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 200 && SLUG_REGEX.test(value);
}

/** Non-empty bounded identifier (cuid or slug) check for path params. */
export function isValidId(value: string | null | undefined): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 64;
}

/** Consistent JSON error envelope: { error: { code, message } }. */
export function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** 401 — no valid session. */
export function unauthorized() {
  return jsonError(401, "UNAUTHORIZED", "Not authenticated");
}

/** 403 — authenticated but lacking the required permission. */
export function forbidden() {
  return jsonError(403, "FORBIDDEN", "Insufficient permissions");
}

/** Parse a JSON request body, returning undefined on malformed JSON. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/**
 * Map common Prisma errors to clean HTTP responses. Returns null when the
 * error is not a recognised Prisma error (caller should 500 in that case).
 */
export function mapPrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return jsonError(409, "CONFLICT", "Artykuł z tym slugiem już istnieje.");
      case "P2003":
        return jsonError(400, "INVALID_REFERENCE", "Referenced record does not exist (check categoryId).");
      case "P2025":
        return jsonError(404, "NOT_FOUND", "Record not found.");
    }
  }
  return null;
}
