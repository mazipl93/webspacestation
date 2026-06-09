import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getArticleBodyBlocks } from "@/lib/articles/display-content";
import type { NewsArticle } from "@/types";

describe("getArticleBodyBlocks — CMS figures", () => {
  it("keeps editorial paragraphs with https:// links", () => {
    const article = {
      content: [
        "Akapit przed grafiką.",
        "![](https://cdn.example/hubble.jpg)\nNASA / ESA",
        "Więcej na https://spacenews.com/example — link w tekście.",
      ],
      contentOrigin: "EDITORIAL",
    } as NewsArticle;

    const blocks = getArticleBodyBlocks(article);
    const figures = blocks.filter((b) => b.kind === "figure");

    assert.equal(figures.length, 1);
    assert.equal(
      blocks.some((b) => b.kind === "paragraph" && b.text.includes("spacenews")),
      true
    );
    if (figures[0].kind === "figure") {
      assert.equal(figures[0].src, "https://cdn.example/hubble.jpg");
      assert.equal(figures[0].caption, "NASA / ESA");
    }
  });

  it("strips RSS-only https boilerplate paragraphs", () => {
    const article = {
      content: ["Źródło: https://spacenews.com/example"],
      contentOrigin: "RSS",
    } as NewsArticle;

    const blocks = getArticleBodyBlocks(article);
    assert.equal(blocks.length, 0);
  });
});
