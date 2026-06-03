import { ArticleStatus } from "@prisma/client";
import { normalizeArticleTags } from "@/lib/rss/article-tags";

const PL_CHARS = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g;
const PL_MAP: Record<string, string> = {
  ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
  Ą: "a", Ć: "c", Ę: "e", Ł: "l", Ń: "n", Ó: "o", Ś: "s", Ź: "z", Ż: "z",
};

/** Slugify a title into a URL-safe slug (handles Polish diacritics). */
export function slugify(input: string): string {
  return input
    .normalize("NFC")
    .replace(PL_CHARS, (c) => PL_MAP[c] ?? c)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export const ARTICLE_STATUSES: ArticleStatus[] = [
  ArticleStatus.DRAFT,
  ArticleStatus.REVIEW,
  ArticleStatus.PUBLISHED,
  ArticleStatus.SCHEDULED,
  ArticleStatus.ARCHIVED,
];

export function isArticleStatus(value: unknown): value is ArticleStatus {
  return (
    typeof value === "string" &&
    (ARTICLE_STATUSES as string[]).includes(value)
  );
}

export type Validated<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asTrimmedString(v: unknown): string | undefined {
  return typeof v === "string" ? v.trim() : undefined;
}

function parseTagsField(body: Record<string, unknown>): string[] | undefined {
  if (body.tags === undefined) return undefined;
  if (Array.isArray(body.tags)) return normalizeArticleTags(body.tags);
  if (typeof body.tags === "string") {
    return normalizeArticleTags(
      body.tags.split(",").map((t) => t.trim()).filter(Boolean)
    );
  }
  return [];
}

function parseSourceField(body: Record<string, unknown>): string | null | undefined {
  if (body.source !== undefined) return asTrimmedString(body.source) ?? null;
  if (body.sourceName !== undefined) return asTrimmedString(body.sourceName) ?? null;
  return undefined;
}

function parseOriginalUrlField(
  body: Record<string, unknown>
): string | null | undefined {
  if (body.originalUrl !== undefined) return asTrimmedString(body.originalUrl) ?? null;
  if (body.sourceUrl !== undefined) return asTrimmedString(body.sourceUrl) ?? null;
  return undefined;
}

// ─── Article inputs ───────────────────────────────────────────────────────--

export interface ArticleCreateInput {
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string | null;
  contextNote: string | null;
  coverImage: string | null;
  categoryId: string;
  status: ArticleStatus;
  featured: boolean;
  readingTime: number | null;
  tags: string[];
  source: string | null;
  originalUrl: string | null;
}

export type ArticleUpdateInput = Partial<ArticleCreateInput>;

export function parseArticleCreate(body: unknown): Validated<ArticleCreateInput> {
  if (!isPlainObject(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const title = asTrimmedString(body.title);
  if (!title) {
    return { ok: false, message: "'title' is required." };
  }

  const categoryId = asTrimmedString(body.categoryId);
  if (!categoryId) {
    return { ok: false, message: "'categoryId' is required." };
  }

  const status = body.status === undefined ? ArticleStatus.DRAFT : body.status;
  if (!isArticleStatus(status)) {
    return { ok: false, message: "'status' is invalid." };
  }

  const slug = asTrimmedString(body.slug) || slugify(title);
  if (!slug) {
    return { ok: false, message: "Could not derive a valid slug from title." };
  }

  if (body.readingTime !== undefined && body.readingTime !== null) {
    if (typeof body.readingTime !== "number" || body.readingTime < 0) {
      return { ok: false, message: "'readingTime' must be a positive number." };
    }
  }

  return {
    ok: true,
    value: {
      title,
      slug,
      subtitle: asTrimmedString(body.subtitle) ?? null,
      excerpt: asTrimmedString(body.excerpt) ?? null,
      content: typeof body.content === "string" ? body.content : null,
      contextNote: asTrimmedString(body.contextNote) ?? null,
      coverImage: asTrimmedString(body.coverImage) ?? null,
      categoryId,
      status,
      featured: body.featured === true,
      readingTime:
        typeof body.readingTime === "number" ? body.readingTime : null,
      tags: parseTagsField(body) ?? [],
      source: parseSourceField(body) ?? null,
      originalUrl: parseOriginalUrlField(body) ?? null,
    },
  };
}

export function parseArticleUpdate(body: unknown): Validated<ArticleUpdateInput> {
  if (!isPlainObject(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const out: ArticleUpdateInput = {};

  if (body.title !== undefined) {
    const title = asTrimmedString(body.title);
    if (!title) return { ok: false, message: "'title' cannot be empty." };
    out.title = title;
  }
  if (body.slug !== undefined) {
    const slug = asTrimmedString(body.slug);
    if (!slug) return { ok: false, message: "'slug' cannot be empty." };
    out.slug = slugify(slug);
  }
  if (body.categoryId !== undefined) {
    const categoryId = asTrimmedString(body.categoryId);
    if (!categoryId) return { ok: false, message: "'categoryId' cannot be empty." };
    out.categoryId = categoryId;
  }
  if (body.status !== undefined) {
    if (!isArticleStatus(body.status)) {
      return { ok: false, message: "'status' is invalid." };
    }
    out.status = body.status;
  }
  if (body.subtitle !== undefined) out.subtitle = asTrimmedString(body.subtitle) ?? null;
  if (body.excerpt !== undefined) out.excerpt = asTrimmedString(body.excerpt) ?? null;
  if (body.content !== undefined) {
    out.content = typeof body.content === "string" ? body.content : null;
  }
  if (body.contextNote !== undefined) {
    out.contextNote = asTrimmedString(body.contextNote) ?? null;
  }
  if (body.coverImage !== undefined) out.coverImage = asTrimmedString(body.coverImage) ?? null;
  if (body.featured !== undefined) out.featured = body.featured === true;
  if (body.readingTime !== undefined) {
    if (body.readingTime !== null && (typeof body.readingTime !== "number" || body.readingTime < 0)) {
      return { ok: false, message: "'readingTime' must be a positive number." };
    }
    out.readingTime = typeof body.readingTime === "number" ? body.readingTime : null;
  }
  const tags = parseTagsField(body);
  if (tags !== undefined) out.tags = tags;
  const source = parseSourceField(body);
  if (source !== undefined) out.source = source;
  const originalUrl = parseOriginalUrlField(body);
  if (originalUrl !== undefined) out.originalUrl = originalUrl;

  return { ok: true, value: out };
}

// ─── Category inputs ───────────────────────────────────────────────────────-

export interface CategoryCreateInput {
  name: string;
  slug: string;
  description: string | null;
  colorTheme: string | null;
  orderIndex: number;
}

export type CategoryUpdateInput = Partial<CategoryCreateInput>;

export function parseCategoryCreate(body: unknown): Validated<CategoryCreateInput> {
  if (!isPlainObject(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }
  const name = asTrimmedString(body.name);
  if (!name) return { ok: false, message: "'name' is required." };

  const slug = asTrimmedString(body.slug) || slugify(name);
  if (!slug) return { ok: false, message: "Could not derive a valid slug from name." };

  if (body.orderIndex !== undefined && typeof body.orderIndex !== "number") {
    return { ok: false, message: "'orderIndex' must be a number." };
  }

  return {
    ok: true,
    value: {
      name,
      slug,
      description: asTrimmedString(body.description) ?? null,
      colorTheme: asTrimmedString(body.colorTheme) ?? null,
      orderIndex: typeof body.orderIndex === "number" ? body.orderIndex : 0,
    },
  };
}

export function parseCategoryUpdate(body: unknown): Validated<CategoryUpdateInput> {
  if (!isPlainObject(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }
  const out: CategoryUpdateInput = {};
  if (body.name !== undefined) {
    const name = asTrimmedString(body.name);
    if (!name) return { ok: false, message: "'name' cannot be empty." };
    out.name = name;
  }
  if (body.slug !== undefined) {
    const slug = asTrimmedString(body.slug);
    if (!slug) return { ok: false, message: "'slug' cannot be empty." };
    out.slug = slugify(slug);
  }
  if (body.description !== undefined) out.description = asTrimmedString(body.description) ?? null;
  if (body.colorTheme !== undefined) out.colorTheme = asTrimmedString(body.colorTheme) ?? null;
  if (body.orderIndex !== undefined) {
    if (typeof body.orderIndex !== "number") {
      return { ok: false, message: "'orderIndex' must be a number." };
    }
    out.orderIndex = body.orderIndex;
  }
  return { ok: true, value: out };
}
