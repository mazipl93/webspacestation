import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formToPreviewArticle,
  previewSubtitle,
  resolvePreviewImageFromForm,
} from "@/lib/admin/preview-article";
import {
  resolveHeroDisplayUrl,
  resolveImage,
} from "@/lib/articles/resolve-image";
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
  coverImageCredit: "",
  authorByline: "",
  bylineUserId: "",
  categoryId: "cat-misje",
  featured: false,
  heroPosition: 0,
  weekTopic: false,
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
    assert.equal(article.image, "https://example.com/cover.jpg");
  });

  it("resolvePreviewImageFromForm prefers coverImage and aliases", () => {
    assert.equal(
      resolvePreviewImageFromForm(BASE_FORM),
      "https://example.com/cover.jpg"
    );
    const withUrl = {
      ...BASE_FORM,
      coverImage: "",
      imageUrl: "https://cdn.example/hero.jpg",
    } as typeof BASE_FORM & { imageUrl: string };
    assert.equal(
      resolvePreviewImageFromForm(withUrl),
      "https://cdn.example/hero.jpg"
    );
  });

  it("does not inject category fallback when cover field is empty (CMS preview)", () => {
    const article = formToPreviewArticle({
      form: { ...BASE_FORM, coverImage: "" },
      categories: CATEGORIES,
      contentOrigin: "RSS",
    });
    assert.equal(article.image, "");
  });

  it("resolveImage shows gradient path when cover empty and no fallback", () => {
    assert.equal(
      resolveImage({ image: "", category: "misje" }, { withFallback: false }),
      null
    );
  });

  it("builds image credit when source URL present", () => {
    const article = formToPreviewArticle({
      form: BASE_FORM,
      categories: CATEGORIES,
    });
    assert.ok(article.imageCredit?.includes("SpaceNews"));
  });

  it("uses manual coverImageCredit when set", () => {
    const article = formToPreviewArticle({
      form: { ...BASE_FORM, coverImageCredit: "NASA / Joel Kowsky" },
      categories: CATEGORIES,
    });
    assert.equal(article.imageCredit, "NASA / Joel Kowsky");
  });

  it("previewSubtitle returns trimmed subtitle", () => {
    assert.equal(previewSubtitle(BASE_FORM), "Podtytuł testowy");
    assert.equal(
      previewSubtitle({ ...BASE_FORM, subtitle: "  " }),
      null
    );
  });
});

describe("resolveHeroDisplayUrl (CMS preview hero)", () => {
  it("returns http(s) cover from image field", () => {
    assert.equal(
      resolveHeroDisplayUrl({ image: "https://cdn.example/cover.jpg" }),
      "https://cdn.example/cover.jpg"
    );
  });

  it("returns null for empty cover (gradient-only hero)", () => {
    assert.equal(resolveHeroDisplayUrl({ image: "" }), null);
  });
});

describe("resolveImage (preview/public parity)", () => {
  it("uses coverImage / image from DB first", () => {
    assert.equal(
      resolveImage({
        image: "https://db/cover.jpg",
        coverImage: "https://ignored-if-image-set.com/x.jpg",
      }),
      "https://db/cover.jpg"
    );
    assert.equal(
      resolveImage({ coverImage: "https://db/cover.jpg" }),
      "https://db/cover.jpg"
    );
  });

  it("returns null without fallback when cover missing", () => {
    assert.equal(resolveImage({ image: null }, { withFallback: false }), null);
  });
});

describe("useDebouncedValue contract (PR11)", () => {
  it("module exports debounce hook", async () => {
    const mod = await import("@/lib/ui/use-debounced-value");
    assert.equal(typeof mod.useDebouncedValue, "function");
  });
});
