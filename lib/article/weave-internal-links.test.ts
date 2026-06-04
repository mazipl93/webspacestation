import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildWovenBodySegments,
  countInternalLinksForParagraphs,
  pickInternalLinkInsertIndices,
} from "@/lib/article/weave-internal-links";

describe("countInternalLinksForParagraphs", () => {
  it("scales with article length", () => {
    assert.equal(countInternalLinksForParagraphs(0), 0);
    assert.equal(countInternalLinksForParagraphs(2), 1);
    assert.equal(countInternalLinksForParagraphs(6), 3);
    assert.equal(countInternalLinksForParagraphs(20), 5);
  });
});

describe("pickInternalLinkInsertIndices", () => {
  it("never inserts before 2nd paragraph when possible", () => {
    const idx = pickInternalLinkInsertIndices(6, 2);
    assert.ok(idx.every((i) => i >= 1));
  });

  it("keeps minimum gap between links", () => {
    const idx = pickInternalLinkInsertIndices(12, 4);
    for (let i = 1; i < idx.length; i++) {
      assert.ok(idx[i] - idx[i - 1] >= 2);
    }
  });
});

describe("buildWovenBodySegments", () => {
  const candidates = [
    { id: "a", slug: "a", title: "A", excerpt: "Ex A", category: "misje" as const },
    { id: "b", slug: "b", title: "B", excerpt: "Ex B", category: "misje" as const },
  ];

  it("interleaves paragraphs and links", () => {
    const segments = buildWovenBodySegments(
      [
        { kind: "paragraph", text: "p1" },
        { kind: "paragraph", text: "p2" },
        { kind: "paragraph", text: "p3" },
        { kind: "paragraph", text: "p4" },
        { kind: "paragraph", text: "p5" },
      ],
      candidates
    );
    const links = segments.filter((s) => s.kind === "internal-link");
    assert.ok(links.length >= 1);
    assert.ok(segments[0].kind === "paragraph");
  });
});
