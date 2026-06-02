import type {
  AdminArticle,
  AdminCategory,
  AdminUser,
  ArticleStatus,
  UserRole,
} from "@/lib/admin/types";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    // empty / non-JSON body
  }

  if (!res.ok) {
    const err = (payload as { error?: { code?: string; message?: string } })?.error;
    throw new ApiError(
      res.status,
      err?.code ?? "UNKNOWN",
      err?.message ?? `Request failed (${res.status}).`
    );
  }

  return (payload as { data: T }).data;
}

// ─── Articles ───────────────────────────────────────────────────────────────

export interface ArticleWritePayload {
  title?: string;
  slug?: string;
  subtitle?: string | null;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  categoryId?: string;
  status?: ArticleStatus;
  featured?: boolean;
  readingTime?: number | null;
}

export const adminApi = {
  listArticles(opts: { status?: string; category?: string } = {}) {
    const params = new URLSearchParams();
    // Always pass a status so the API returns every status (admin view).
    params.set("status", opts.status && opts.status !== "all" ? opts.status : "ALL");
    if (opts.category) params.set("category", opts.category);
    return request<AdminArticle[]>(`/api/articles?${params.toString()}`);
  },

  getArticle(id: string) {
    return request<AdminArticle>(`/api/articles/${id}?byId=1`);
  },

  createArticle(payload: ArticleWritePayload) {
    return request<AdminArticle>(`/api/articles`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateArticle(id: string, payload: ArticleWritePayload) {
    return request<AdminArticle>(`/api/articles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  archiveArticle(id: string) {
    return request<AdminArticle>(`/api/articles/${id}`, { method: "DELETE" });
  },

  // ─── Categories ─────────────────────────────────────────────────────────--

  listCategories() {
    return request<AdminCategory[]>(`/api/categories`);
  },

  createCategory(payload: {
    name: string;
    slug?: string;
    description?: string | null;
    colorTheme?: string | null;
    orderIndex?: number;
  }) {
    return request<AdminCategory>(`/api/categories`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateCategory(
    id: string,
    payload: {
      name?: string;
      slug?: string;
      description?: string | null;
      colorTheme?: string | null;
      orderIndex?: number;
    }
  ) {
    return request<AdminCategory>(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  listUsers() {
    return request<AdminUser[]>(`/api/users`);
  },

  updateUserRole(id: string, role: UserRole) {
    return request<AdminUser>(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },
};
