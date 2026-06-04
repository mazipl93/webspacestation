import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildHomepageHeroSlides, pickHeroLead } from "@/lib/home/hero-slides";
import type { NewsArticle } from "@/types";

function article(id: string, overrides: Partial<NewsArticle> = {}): NewsArticle {
  return {
    id,
    slug: id,
    title: id,
    excerpt: "",
    category: "misje",
    publishedAt: "2026-06-01T10:00:00.000Z",
    timeLabel: "1 dzień temu",
    image: "/x.jpg",
    heroPosition: 0,
    ...overrides,
  };
}

describe("buildHomepageHeroSlides", () => {
  it("uses CMS-ordered slides when heroPosition is set", () => {
    const cms = [
      article("s1", { heroPosition: 1 }),
      article("s2", { heroPosition: 2 }),
    ];
    const slides = buildHomepageHeroSlides(cms, []);
    assert.deepEqual(
      slides.map((s) => s.id),
      ["s1", "s2"]
    );
  });

  it("falls back to lead + important pool when CMS list is empty", () => {
    const pool = [
      article("a", { contentOrigin: "EDITORIAL", isTopPriority: true }),
      article("b"),
    ];
    const slides = buildHomepageHeroSlides([], pool, 3);
    assert.equal(slides[0]?.id, "a");
    assert.equal(slides.length, 2);
  });
});

describe("pickHeroLead", () => {
  it("prefers editorial top priority", () => {
    const pool = [
      article("rss", { contentOrigin: "RSS", isTopPriority: true }),
      article("ed", { contentOrigin: "EDITORIAL", isTopPriority: true }),
    ];
    assert.equal(pickHeroLead(pool)?.id, "ed");
  });
});
