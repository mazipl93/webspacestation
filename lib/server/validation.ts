import { ArticleStatus } from "@prisma/client";
import {
  SOCIAL_CARD_HOOK_MAX,
  SOCIAL_CARD_TITLE_MAX,
} from "@/lib/social/share-card-copy";
import { normalizeArticleTags } from "@/lib/rss/article-tags";
import {
  parseCoverImageForCreate,
  parseCoverImageForUpdate,
} from "@/lib/server/article-fields";

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

function parseSocialCardField(
  value: unknown,
  max: number,
  fieldName: string,
): Validated<string | null> | undefined {
  if (value === undefined) return undefined;
  const trimmed = asTrimmedString(value);
  if (!trimmed) return { ok: true, value: null };
  if (trimmed.length > max) {
    return {
      ok: false,
      message: `'${fieldName}' — maksymalnie ${max} znaków.`,
    };
  }
  return { ok: true, value: trimmed };
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

function parseSlotPositionField(
  body: Record<string, unknown>,
  field: "heroPosition" | "weekTopicPosition"
): number | undefined | null {
  if (body[field] === undefined) return undefined;
  const raw = body[field];
  const n =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number.parseInt(raw, 10)
        : NaN;
  if (!Number.isInteger(n) || n < 0 || n > 4) return null;
  return n;
}

function parseHeroPositionField(
  body: Record<string, unknown>
): number | undefined | null {
  return parseSlotPositionField(body, "heroPosition");
}

function parseWeekTopicPositionField(
  body: Record<string, unknown>
): number | undefined | null {
  return parseSlotPositionField(body, "weekTopicPosition");
}

function parseBylineUserIdField(
  body: Record<string, unknown>
): string | null | undefined {
  if (body.bylineUserId === undefined) return undefined;
  if (body.bylineUserId === null || body.bylineUserId === "") return null;
  if (typeof body.bylineUserId === "string" && body.bylineUserId.trim()) {
    return body.bylineUserId.trim();
  }
  return null;
}

function parsePublishAtField(
  body: Record<string, unknown>
): Date | null | undefined {
  if (body.publishAt === undefined) return undefined;
  if (body.publishAt === null || body.publishAt === "") return null;
  if (typeof body.publishAt !== "string") {
    return null;
  }
  const d = new Date(body.publishAt);
  return Number.isFinite(d.getTime()) ? d : null;
}

// ─── Article inputs ───────────────────────────────────────────────────────--

export interface ArticleCreateInput {
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  socialCardTitle: string | null;
  socialCardHook: string | null;
  content: string | null;
  contextNote: string | null;
  coverImage: string | null;
  coverImageCredit: string | null;
  authorByline: string | null;
  bylineUserId: string | null;
  categoryId: string;
  status: ArticleStatus;
  featured: boolean;
  heroPosition: number;
  weekTopicPosition: number;
  weekTopic: boolean;
  readingTime: number | null;
  tags: string[];
  source: string | null;
  originalUrl: string | null;
  publishAt: Date | null;
}

export type ArticleUpdateInput = Partial<ArticleCreateInput>;

export function parseArticleCreate(body: unknown): Validated<ArticleCreateInput> {
  if (!isPlainObject(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  if (body.publishedAt !== undefined) {
    return {
      ok: false,
      message:
        "publishedAt is set only on first publish (Opublikuj). It cannot be sent in the editor payload.",
    };
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

  const heroPosition = parseHeroPositionField(body);
  if (heroPosition === null) {
    return {
      ok: false,
      message: "'heroPosition' must be an integer from 0 to 4.",
    };
  }

  const weekTopicPosition = parseWeekTopicPositionField(body);
  if (weekTopicPosition === null) {
    return {
      ok: false,
      message: "'weekTopicPosition' must be an integer from 0 to 4.",
    };
  }

  const resolvedWeekTopicPosition =
    weekTopicPosition ?? (body.weekTopic === true ? 1 : 0);

  const socialCardTitle = parseSocialCardField(
    body.socialCardTitle,
    SOCIAL_CARD_TITLE_MAX,
    "socialCardTitle",
  );
  if (socialCardTitle && !socialCardTitle.ok) return socialCardTitle;

  const socialCardHook = parseSocialCardField(
    body.socialCardHook,
    SOCIAL_CARD_HOOK_MAX,
    "socialCardHook",
  );
  if (socialCardHook && !socialCardHook.ok) return socialCardHook;

  return {
    ok: true,
    value: {
      title,
      slug,
      subtitle: asTrimmedString(body.subtitle) ?? null,
      excerpt: asTrimmedString(body.excerpt) ?? null,
      socialCardTitle: socialCardTitle?.ok ? socialCardTitle.value : null,
      socialCardHook: socialCardHook?.ok ? socialCardHook.value : null,
      content: typeof body.content === "string" ? body.content : null,
      contextNote: asTrimmedString(body.contextNote) ?? null,
      coverImage: parseCoverImageForCreate(body),
      coverImageCredit: asTrimmedString(body.coverImageCredit) ?? null,
      authorByline: asTrimmedString(body.authorByline) ?? null,
      bylineUserId: parseBylineUserIdField(body) ?? null,
      categoryId,
      status,
      featured: body.featured === true,
      heroPosition: heroPosition ?? 0,
      weekTopicPosition: resolvedWeekTopicPosition,
      weekTopic: resolvedWeekTopicPosition >= 1,
      readingTime:
        typeof body.readingTime === "number" ? body.readingTime : null,
      tags: parseTagsField(body) ?? [],
      source: parseSourceField(body) ?? null,
      originalUrl: parseOriginalUrlField(body) ?? null,
      publishAt: parsePublishAtField(body) ?? null,
    },
  };
}

export function parseArticleUpdate(body: unknown): Validated<ArticleUpdateInput> {
  if (!isPlainObject(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  if (body.publishedAt !== undefined) {
    return {
      ok: false,
      message:
        "publishedAt is set only on first publish (Opublikuj). It cannot be sent in the editor payload.",
    };
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

  const socialCardTitle = parseSocialCardField(
    body.socialCardTitle,
    SOCIAL_CARD_TITLE_MAX,
    "socialCardTitle",
  );
  if (socialCardTitle !== undefined) {
    if (!socialCardTitle.ok) return socialCardTitle;
    out.socialCardTitle = socialCardTitle.value;
  }

  const socialCardHook = parseSocialCardField(
    body.socialCardHook,
    SOCIAL_CARD_HOOK_MAX,
    "socialCardHook",
  );
  if (socialCardHook !== undefined) {
    if (!socialCardHook.ok) return socialCardHook;
    out.socialCardHook = socialCardHook.value;
  }
  if (body.content !== undefined) {
    out.content = typeof body.content === "string" ? body.content : null;
  }
  if (body.contextNote !== undefined) {
    out.contextNote = asTrimmedString(body.contextNote) ?? null;
  }
  if (body.coverImageCredit !== undefined) {
    out.coverImageCredit = asTrimmedString(body.coverImageCredit) ?? null;
  }
  if (body.authorByline !== undefined) {
    out.authorByline = asTrimmedString(body.authorByline) ?? null;
  }
  const bylineUserId = parseBylineUserIdField(body);
  if (bylineUserId !== undefined) out.bylineUserId = bylineUserId;
  const coverImage = parseCoverImageForUpdate(body);
  if (coverImage !== undefined) out.coverImage = coverImage;
  if (body.featured !== undefined) out.featured = body.featured === true;
  const heroPosition = parseHeroPositionField(body);
  if (heroPosition === null) {
    return {
      ok: false,
      message: "'heroPosition' must be an integer from 0 to 4.",
    };
  }
  if (heroPosition !== undefined) out.heroPosition = heroPosition;
  const weekTopicPosition = parseWeekTopicPositionField(body);
  if (weekTopicPosition === null) {
    return {
      ok: false,
      message: "'weekTopicPosition' must be an integer from 0 to 4.",
    };
  }
  if (weekTopicPosition !== undefined) {
    out.weekTopicPosition = weekTopicPosition;
    out.weekTopic = weekTopicPosition >= 1;
  } else if (body.weekTopic !== undefined) {
    out.weekTopic = body.weekTopic === true;
    if (!out.weekTopic) out.weekTopicPosition = 0;
    else if (out.weekTopicPosition === undefined) out.weekTopicPosition = 1;
  }
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
  const publishAt = parsePublishAtField(body);
  if (publishAt !== undefined) out.publishAt = publishAt;

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
