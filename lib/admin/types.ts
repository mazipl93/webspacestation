// Client-facing shapes mirroring the JSON returned by the API layer.
// Dates are serialized as ISO strings over HTTP.

import type { UserRole } from "@/lib/auth/permissions";

export type { UserRole };

export type ArticleStatus =
  | "DRAFT"
  | "REVIEW"
  | "PUBLISHED"
  | "SCHEDULED"
  | "ARCHIVED";

/** Mirrors Prisma ArticleContentOrigin — exposed on article API responses. */
export type ArticleContentOrigin = "EDITORIAL" | "RSS" | "AI_DRAFT";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  colorTheme: string | null;
  orderIndex: number;
}

export interface AdminArticleCategory {
  id: string;
  slug: string;
  name: string;
  colorTheme: string | null;
}

export interface AdminArticleAuthor {
  id: string;
  name: string;
  role: string;
}

export interface AdminArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string | null;
  contextNote: string | null;
  coverImage: string | null;
  coverImageCredit: string | null;
  status: ArticleStatus;
  featured: boolean;
  weekTopic: boolean;
  readingTime: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  publishAt: string | null;
  source?: string | null;
  originalUrl?: string | null;
  contentOrigin: ArticleContentOrigin;
  /** Read-only intelligence score (0–100), computed on API — not persisted. */
  aiScore?: number | null;
  category: AdminArticleCategory;
  author: AdminArticleAuthor;
}

export interface ArticleFormValues {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: string;
  contextNote: string;
  coverImage: string;
  coverImageCredit: string;
  categoryId: string;
  featured: boolean;
  weekTopic: boolean;
  readingTime: number | null;
  /** Comma-separated in the form; normalized to Article.tags on save. */
  tagsText: string;
  sourceName: string;
  sourceUrl: string;
  /** ISO datetime-local value for scheduled publish. */
  publishAtLocal: string;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  colorTheme: string;
  orderIndex: number;
}
