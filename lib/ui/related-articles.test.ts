import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateRelatedScore,
  pickReadNext,
  pickReadNextArticles,
  pickRelatedArticles,
  pickSameCategoryRelated,
  type RelatableArticle,
} from "@/lib/article/related-articles";

const NOW = Date.parse("2026-06-03T12:00:00.000Z");

function article(
  id: string,
  overrides: Partial<RelatableArticle> = {}
): RelatableArticle {
  return {
    id,
    slug: id,
    category: "misje",
    publishedAt: "2026-06-01T10:00:00.000Z",
    createdAt: "2026-06-01T10:00:00.000Z",
    score: 5,
    ...overrides,
  };
}

describe("calculateRelatedScore (PR9)", () => {
  it("adds +3 per shared tag and +2 for same category", () => {
    const source = article("src", { tags: ["nasa", "mars"], category: "misje" });
    const tagged = article("tagged", {
      tags: ["nasa", "moon"],
      category: "astronomia",
    });
    const categoryOnly = article("cat", { tags: [], category: "misje" });
    const taggedScore = calculateRelatedScore(source, tagged, NOW);
    const categoryScore = calculateRelatedScore(source, categoryOnly, NOW);
    assert.ok(taggedScore >= 3 + 2);
    assert.ok(taggedScore > categoryScore);
  });

  it("applies recency bias to newer candidates", () => {
    const source = article("src", { tags: [] });
    const newer = article("new", {
      category: "misje",
      publishedAt: "2026-06-03T08:00:00.000Z",
      createdAt: "2026-06-03T08:00:00.000Z",
    });
    const older = article("old", {
      category: "misje",
      publishedAt: "2026-05-01T08:00:00.000Z",
      createdAt: "2026-05-01T08:00:00.000Z",
    });
    assert.ok(
      calculateRelatedScore(source, newer, NOW) >
        calculateRelatedScore(source, older, NOW)
    );
  });

  it("adds optional score overlap when both articles have score", () => {
    const source = article("src", { score: 10, tags: [] });
    const close = article("close", { score: 11, category: "astronomia" });
    const far = article("far", { score: 1, category: "astronomia" });
    assert.ok(
      calculateRelatedScore(source, close, NOW) >
        calculateRelatedScore(source, far, NOW)
    );
  });
});

describe("pickRelatedArticles (PR9)", () => {
  it("prefers tag matches over category-only matches", () => {
    const source = article("src", { tags: ["spacex"] });
    const pool = [
      source,
      article("cat-only", { category: "misje", tags: [] }),
      article("tag-match", { category: "ai", tags: ["spacex", "launch"] }),
    ];
    const related = pickRelatedArticles(source, pool, { max: 2 });
    assert.equal(related[0]?.id, "tag-match");
  });

  it("returns up to max and excludes source", () => {
    const source = article("src");
    const pool = [source, ...Array.from({ length: 8 }, (_, i) => article(`a${i}`))];
    const related = pickRelatedArticles(source, pool, { max: 6 });
    assert.equal(related.length, 6);
    assert.ok(related.every((a) => a.id !== "src"));
  });
});

describe("pickSameCategoryRelated", () => {
  it("returns only articles from the source category", () => {
    const source = article("src", { category: "misje" });
    const pool = [
      source,
      article("same", { category: "misje" }),
      article("other", { category: "ai" }),
    ];
    const related = pickSameCategoryRelated(source, pool, 3);
    assert.ok(related.every((a) => a.category === "misje"));
    assert.ok(related.every((a) => a.id !== "src"));
  });
});

describe("pickReadNextArticles", () => {
  it("prefers same category before feed order", () => {
    const source = article("src", { category: "misje" });
    const sameCat = article("same", {
      category: "misje",
      createdAt: "2026-06-01T10:00:00.000Z",
      publishedAt: "2026-06-01T10:00:00.000Z",
    });
    const otherCat = article("other", {
      category: "iss",
      createdAt: "2026-06-03T10:00:00.000Z",
      publishedAt: "2026-06-03T10:00:00.000Z",
    });
    const list = pickReadNextArticles(source, [otherCat, source, sameCat], {
      limit: 3,
    });
    assert.ok(list.some((a) => a.id === "same"));
    assert.equal(list[0]?.id, "same");
  });

  it("returns up to limit without duplicates", () => {
    const source = article("src");
    const pool = [
      source,
      article("a"),
      article("b"),
      article("c"),
      article("d"),
      article("e"),
      article("f"),
    ];
    const list = pickReadNextArticles(source, pool, { limit: 5 });
    assert.equal(list.length, 5);
    assert.ok(list.every((a) => a.id !== "src"));
    assert.equal(new Set(list.map((a) => a.id)).size, 5);
  });
});

describe("pickReadNext (PR9)", () => {
  it("returns the next older article in newest-first feed order", () => {
    const newest = article("new", {
      createdAt: "2026-06-03T10:00:00.000Z",
      publishedAt: "2026-06-03T10:00:00.000Z",
    });
    const current = article("cur", {
      createdAt: "2026-06-02T10:00:00.000Z",
      publishedAt: "2026-06-02T10:00:00.000Z",
    });
    const older = article("old", {
      createdAt: "2026-06-01T10:00:00.000Z",
      publishedAt: "2026-06-01T10:00:00.000Z",
    });
    const next = pickReadNext(current, [newest, current, older]);
    assert.equal(next?.id, "old");
  });

  it("falls back to popular when current is the oldest in feed", () => {
    const current = article("cur", {
      createdAt: "2026-06-01T10:00:00.000Z",
      publishedAt: "2026-06-01T10:00:00.000Z",
      score: 1,
    });
    const popular = article("pop", {
      createdAt: "2026-06-03T10:00:00.000Z",
      publishedAt: "2026-06-03T10:00:00.000Z",
      score: 50,
      featured: true,
    });
    const next = pickReadNext(current, [popular, current]);
    assert.equal(next?.id, "pop");
  });
});
