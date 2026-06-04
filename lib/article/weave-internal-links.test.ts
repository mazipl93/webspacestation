import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  archiveResurfaceBias,
  buildWovenBodySegments,
  countInternalLinksForParagraphs,
  pickInternalLinkInsertIndices,
  pickWeaveInternalLinkCandidates,
} from "@/lib/article/weave-internal-links";

describe("countInternalLinksForParagraphs", () => {
  it("scales with article length", () => {
    assert.equal(countInternalLinksForParagraphs(0), 0);
    assert.equal(countInternalLinksForParagraphs(2), 1);
    assert.equal(countInternalLinksForParagraphs(6), 3);
    assert.equal(countInternalLinksForParagraphs(20), 4);
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

  it("can place 4 links in a long article", () => {
    const idx = pickInternalLinkInsertIndices(18, 4);
    assert.equal(idx.length, 4);
  });
});

describe("buildWovenBodySegments", () => {
  it("does not count list blocks toward link density", () => {
    const segments = buildWovenBodySegments(
      [
        { kind: "paragraph", text: "p1" },
        { kind: "list", items: ["a", "b"] },
        { kind: "paragraph", text: "p2" },
      ],
      [
        { id: "a", slug: "a", title: "A", excerpt: "Ex", category: "misje" },
      ]
    );
    const links = segments.filter((s) => s.kind === "internal-link");
    assert.equal(links.length, 1);
  });
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

describe("pickWeaveInternalLinkCandidates", () => {
  const now = Date.parse("2026-06-03T12:00:00.000Z");

  it("prefers same category and tag overlap", () => {
    const source = {
      id: "src",
      slug: "src",
      title: "Falcon 9 start rakiety SpaceX",
      excerpt: "",
      category: "misje" as const,
      tags: ["spacex", "falcon"],
      publishedAt: "2026-06-01T10:00:00.000Z",
      createdAt: "2026-06-01T10:00:00.000Z",
      score: 5,
    };
    const pool = [
      source,
      {
        id: "old",
        slug: "old",
        title: "Starship test Elon Musk",
        excerpt: "",
        category: "technologie" as const,
        tags: ["ai"],
        publishedAt: "2025-11-01T10:00:00.000Z",
        createdAt: "2025-11-01T10:00:00.000Z",
        score: 4,
      },
      {
        id: "match",
        slug: "match",
        title: "Falcon 9 rekordowy lot boostera",
        excerpt: "",
        category: "misje" as const,
        tags: ["spacex", "falcon"],
        publishedAt: "2026-05-28T10:00:00.000Z",
        createdAt: "2026-05-28T10:00:00.000Z",
        score: 6,
      },
    ];
    const picked = pickWeaveInternalLinkCandidates(source, pool, 2);
    assert.equal(picked[0]?.id, "match");
  });

  it("long technologie article can fill 4 weave slots (read-next overlap OK)", () => {
    const source = {
      id: "ps",
      slug: "playstation-state-of-play",
      title: "PlayStation State of Play 2026",
      excerpt: "",
      category: "technologie" as const,
      tags: ["playstation", "gry"],
      publishedAt: "2026-06-03T10:00:00.000Z",
      createdAt: "2026-06-03T10:00:00.000Z",
      score: 8,
    };
    const readNextIds = ["esa", "newglenn", "raptor", "ariane", "falcon"];
    const pool = [
      source,
      ...readNextIds.map((id, i) => ({
        id,
        slug: id,
        title: `Related technologie ${i}`,
        excerpt: "Ex",
        category: "technologie" as const,
        tags: ["playstation"],
        publishedAt: "2026-06-02T10:00:00.000Z",
        createdAt: "2026-06-02T10:00:00.000Z",
        score: 6,
      })),
      {
        id: "majorana",
        slug: "microsoft-majorana",
        title: "Microsoft Majorana 2 kwantowy",
        excerpt: "Ex",
        category: "technologie" as const,
        tags: ["microsoft"],
        publishedAt: "2026-06-01T10:00:00.000Z",
        createdAt: "2026-06-01T10:00:00.000Z",
        score: 5,
      },
    ];
    const picked = pickWeaveInternalLinkCandidates(source, pool, 4);
    assert.equal(picked.length, 4);
    const segments = buildWovenBodySegments(
      Array.from({ length: 16 }, (_, i) => ({
        kind: "paragraph" as const,
        text: `Paragraph ${i + 1} with enough text.`,
      })),
      picked
    );
    assert.equal(
      segments.filter((s) => s.kind === "internal-link").length,
      4
    );
  });

  it("archive bias raises older relevant articles", () => {
    const recent = archiveResurfaceBias("2026-05-20T00:00:00.000Z", now);
    const archive = archiveResurfaceBias("2025-10-01T00:00:00.000Z", now);
    assert.ok(archive > recent);
  });
});
