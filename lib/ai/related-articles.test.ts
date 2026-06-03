import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getRelatedArticles } from "@/lib/ai/related-articles";

describe("getRelatedArticles (scaffold)", () => {
  const pool = [
    { id: "1", slug: "a", title: "A", tags: ["Space", "NASA"] },
    { id: "2", slug: "b", title: "B", tags: ["Space"] },
    { id: "3", slug: "c", title: "C", tags: ["AI"] },
  ];

  it("returns [] when article has no tags", () => {
    assert.deepEqual(
      getRelatedArticles({ id: "x", slug: "x", title: "X", tags: [] }, pool),
      []
    );
  });

  it("returns tag-overlap matches sorted by overlap", () => {
    const related = getRelatedArticles(pool[0], pool);
    assert.equal(related.length, 1);
    assert.equal(related[0].id, "2");
  });
});
