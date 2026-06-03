import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ArticleStatus } from "@prisma/client";
import {
  calculateArticleScore,
  resolveAiScore,
} from "@/lib/ai/article-score";

const BASE: Parameters<typeof calculateArticleScore>[0] = {
  title: "Starship launch",
  content: "x".repeat(1200),
  coverImage: "https://example.com/cover.jpg",
  tags: ["Space", "NASA"],
  featured: true,
  status: ArticleStatus.PUBLISHED,
  createdAt: new Date(),
};

describe("calculateArticleScore (read-only intelligence)", () => {
  it("returns 0–100 deterministically for rich published article", () => {
    const a = calculateArticleScore(BASE);
    const b = calculateArticleScore(BASE);
    assert.equal(a, b);
    assert.ok(a >= 0 && a <= 100);
    assert.ok(a >= 70);
  });

  it("scores lower without image, tags, or content", () => {
    const sparse = calculateArticleScore({
      title: "Minimal",
      content: "",
      coverImage: null,
      tags: [],
      featured: false,
      status: ArticleStatus.REVIEW,
      createdAt: new Date(Date.now() - 120 * 86_400_000),
    });
    const rich = calculateArticleScore(BASE);
    assert.ok(sparse < rich);
  });

  it("resolveAiScore is null for DRAFT", () => {
    assert.equal(
      resolveAiScore({ ...BASE, status: ArticleStatus.DRAFT }),
      null
    );
  });

  it("resolveAiScore is null when title missing", () => {
    assert.equal(resolveAiScore({ ...BASE, title: "  " }), null);
  });

  it("resolveAiScore returns number for REVIEW and PUBLISHED", () => {
    assert.equal(typeof resolveAiScore(BASE), "number");
    assert.equal(
      typeof resolveAiScore({ ...BASE, status: ArticleStatus.REVIEW }),
      "number"
    );
  });
});
