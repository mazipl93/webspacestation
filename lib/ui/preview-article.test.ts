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
  weekTopicPosition: 0,
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
    assert.equal(article.coverImageCredit, "NASA / Joel Kowsky");
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

  it("adds https when protocol missing", () => {
    assert.equal(
      resolveHeroDisplayUrl({ image: "cdn.example/cover.png" }),
      "https://cdn.example/cover.png"
    );
  });

  it("shows unsplash in preview (no broken-url filter)", () => {
    assert.equal(
      resolveHeroDisplayUrl({
        image: "https://images.unsplash.com/photo-123/file.png",
      }),
      "https://images.unsplash.com/photo-123/file.png"
    );
  });

  it("returns null for empty cover (gradient-only hero)", () => {
    assert.equal(resolveHeroDisplayUrl({ image: "" }), null);
  });

  it("ignores editorial NASA override for mapped slug", () => {
    assert.equal(
      resolveHeroDisplayUrl({
        image: "https://cdn.example/custom-cover.jpg",
        slug: "roman-space-telescope-start-30-sierpnia-2026",
      }),
      "https://cdn.example/custom-cover.jpg"
    );
  });
});

describe("resolveImage (editorial cover from DB)", () => {
  it("prefers DB coverImage over editorial NASA map", () => {
    assert.equal(
      resolveImage({
        coverImage: "https://cdn.example/cms-cover.jpg",
        slug: "roman-space-telescope-start-30-sierpnia-2026",
      }),
      "https://cdn.example/cms-cover.jpg"
    );
  });

  it("uses NASA map only when DB cover is missing", () => {
    const url = resolveImage({
      coverImage: "",
      slug: "roman-space-telescope-start-30-sierpnia-2026",
    });
    assert.ok(url?.includes("images-assets.nasa.gov"));
  });

  it("uses DB cover for rozrywka slug when set in CMS", () => {
    assert.equal(
      resolveImage({
        coverImage: "https://cdn.example/state-of-play.jpg",
        slug: "playstation-state-of-play-czerwiec-2026-wolverine-god-of-war-laufey",
      }),
      "https://cdn.example/state-of-play.jpg"
    );
  });

  it("uses CMS cover on editorial slug even when host is legacy broken CDN", () => {
    const cmsUrl =
      "https://assets.science.nasa.gov/content/dam/science/webb/spectrum.png";
    assert.equal(
      resolveImage({
        coverImage: cmsUrl,
        slug: "webb-metan-kometa-miedzygwiezdna-3i-atlas-czerwiec-2026",
      }),
      cmsUrl
    );
  });
});

describe("useDebouncedValue contract (PR11)", () => {
  it("module exports debounce hook", async () => {
    const mod = await import("@/lib/ui/use-debounced-value");
    assert.equal(typeof mod.useDebouncedValue, "function");
  });
});
