import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formToPreviewArticle,
  previewSubtitle,
} from "@/lib/admin/preview-article";
import type { ArticleFormValues, AdminCategory } from "@/lib/admin/types";

const CATEGORIES: AdminCategory[] = [
  {
    id: "cat-misje",
    slug: "misje",
    name: "Misje",
    description: null,
    colorTheme: null,
    orderIndex: 0,
  },
];

const BASE_FORM: ArticleFormValues = {
  title: "Starship Flight 8",
  slug: "starship-flight-8",
  subtitle: "Podtytuł testowy",
  excerpt: "Lead artykułu dla podglądu.",
  content: "Pierwszy akapit treści.\n\nDrugi akapit treści.",
  contextNote: "",
  coverImage: "https://example.com/cover.jpg",
  categoryId: "cat-misje",
  featured: false,
  readingTime: 4,
  tagsText: "SpaceX, Starship",
  sourceName: "SpaceNews",
  sourceUrl: "https://spacenews.com/example",
  publishAtLocal: "",
};

describe("formToPreviewArticle (PR11 — live preview)", () => {
  it("maps form fields to NewsArticle without API", () => {
    const article = formToPreviewArticle({
      form: BASE_FORM,
      categories: CATEGORIES,
      contentOrigin: "RSS",
      articleId: "abc",
    });

    assert.equal(article.title, "Starship Flight 8");
    assert.equal(article.category, "misje");
    assert.equal(article.content?.length, 2);
    assert.equal(article.tags?.join(","), "SpaceX,Starship");
    assert.equal(article.source, "SpaceNews");
    assert.equal(article.originalUrl, "https://spacenews.com/example");
    assert.equal(article.contentOrigin, "RSS");
    assert.equal(article.imageUrl, "https://example.com/cover.jpg");
  });

  it("uses category fallback cover when coverImage empty", () => {
    const article = formToPreviewArticle({
      form: { ...BASE_FORM, coverImage: "" },
      categories: CATEGORIES,
    });
    assert.ok(article.imageUrl.startsWith("https://"));
  });

  it("builds image credit when source URL present", () => {
    const article = formToPreviewArticle({
      form: BASE_FORM,
      categories: CATEGORIES,
    });
    assert.ok(article.imageCredit?.includes("SpaceNews"));
  });

  it("previewSubtitle returns trimmed subtitle", () => {
    assert.equal(previewSubtitle(BASE_FORM), "Podtytuł testowy");
    assert.equal(
      previewSubtitle({ ...BASE_FORM, subtitle: "  " }),
      null
    );
  });
});

describe("useDebouncedValue contract (PR11)", () => {
  it("module exports debounce hook", async () => {
    const mod = await import("@/lib/ui/use-debounced-value");
    assert.equal(typeof mod.useDebouncedValue, "function");
  });
});
