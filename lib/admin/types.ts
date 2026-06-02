// Client-facing shapes mirroring the JSON returned by the API layer.
// Dates are serialized as ISO strings over HTTP.

import type { UserRole } from "@/lib/auth/permissions";

export type { UserRole };

export type ArticleStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";

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
  status: ArticleStatus;
  featured: boolean;
  readingTime: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  source?: string | null;
  originalUrl?: string | null;
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
  categoryId: string;
  featured: boolean;
  readingTime: number | null;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  colorTheme: string;
  orderIndex: number;
}
