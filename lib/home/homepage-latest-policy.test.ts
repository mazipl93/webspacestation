import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  excludeBySlugs,
  pickHomepageLatest,
  rankLatest,
} from "@/lib/home/rank-articles";

const BASE = {
  slug: "a",
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  score: 5,
};

describe("homepage Najnowsze policy", () => {
  it("newest publish is first when hero slug is not excluded", () => {
    const newest = new Date().toISOString();
    const older = new Date(Date.now() - 86_400_000).toISOString();
    const all = [
      { ...BASE, slug: "in-hero", publishedAt: newest, featured: true },
      { ...BASE, slug: "other", publishedAt: older },
    ];
    const latest = pickHomepageLatest(all, 2);
    assert.equal(latest[0]?.slug, "in-hero");
  });

  it("excluding hero slugs would wrongly drop the freshest post (anti-pattern)", () => {
    const newest = new Date().toISOString();
    const older = new Date(Date.now() - 86_400_000).toISOString();
    const all = [
      { ...BASE, slug: "in-hero", publishedAt: newest },
      { ...BASE, slug: "other", publishedAt: older },
    ];
    const used = new Set(["in-hero"]);
    const wrong = pickHomepageLatest(excludeBySlugs(all, used), 2);
    assert.equal(wrong[0]?.slug, "other");
    assert.notEqual(wrong[0]?.slug, "in-hero");
  });

  it("category feed head matches rankLatest on pool", () => {
    const t1 = new Date("2026-06-04T12:00:00Z").toISOString();
    const t0 = new Date("2026-06-03T12:00:00Z").toISOString();
    const pool = [
      { ...BASE, slug: "old", publishedAt: t0 },
      { ...BASE, slug: "new", publishedAt: t1 },
    ];
    assert.equal(rankLatest(pool, 1)[0]?.slug, "new");
  });
});
