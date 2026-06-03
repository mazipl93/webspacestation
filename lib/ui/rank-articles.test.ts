import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  rankArticles,
  rankImportantNow,
  rankLatest,
  rankPopular,
  rankScore,
  withSectionFallback,
} from "@/lib/home/rank-articles";

const BASE = {
  slug: "a",
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  score: 5,
};

describe("rankArticles (PR8 — homepage)", () => {
  it("boosts featured and score", () => {
    const now = Date.now();
    const plain = rankScore({ ...BASE, slug: "plain", featured: false, score: 2 }, now);
    const featured = rankScore(
      { ...BASE, slug: "feat", featured: true, score: 2 },
      now
    );
    assert.ok(featured > plain);
  });

  it("rankImportantNow orders by composite score", () => {
    const old = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const ranked = rankImportantNow([
      { ...BASE, slug: "old", publishedAt: old, createdAt: old, score: 20, featured: false },
      { ...BASE, slug: "new-f", publishedAt: BASE.publishedAt, featured: true, score: 3 },
    ], 2);
    assert.equal(ranked[0]?.slug, "new-f");
  });

  it("rankLatest sorts by publishedAt desc (RSS republish uses fresh publish date)", () => {
    const olderPublish = new Date(Date.now() - 86_400_000).toISOString();
    const freshPublish = new Date().toISOString();
    const ranked = rankLatest([
      {
        ...BASE,
        slug: "old-rss",
        createdAt: olderPublish,
        publishedAt: freshPublish,
      },
      {
        ...BASE,
        slug: "stale",
        createdAt: BASE.createdAt,
        publishedAt: olderPublish,
      },
    ]);
    assert.equal(ranked[0]?.slug, "old-rss");
  });

  it("rankPopular uses engagement map when provided", () => {
    const likes = new Map([["liked", 10], ["plain", 0]]);
    const ranked = rankPopular(
      [
        { ...BASE, slug: "plain", score: 50 },
        { ...BASE, slug: "liked", score: 1 },
      ],
      { engagementBySlug: likes }
    );
    assert.equal(ranked[0]?.slug, "liked");
  });

  it("rankArticles respects limit", () => {
    const items = [1, 2, 3, 4, 5].map((n) => ({
      ...BASE,
      slug: `s${n}`,
      score: n,
    }));
    assert.equal(rankArticles(items, { limit: 3 }).length, 3);
  });

  it("withSectionFallback uses rankLatest when section result is empty", () => {
    const items = [
      { ...BASE, slug: "only", createdAt: BASE.createdAt, publishedAt: BASE.publishedAt },
    ];
    const fallback = withSectionFallback([], items, 3);
    assert.equal(fallback.length, 1);
    assert.equal(fallback[0]?.slug, "only");
  });

  it("rankPopular falls back to latest when pool has one item", () => {
    const ranked = rankPopular([{ ...BASE, slug: "solo", score: 0 }], { limit: 6 });
    assert.equal(ranked.length, 1);
    assert.equal(ranked[0]?.slug, "solo");
  });
});
