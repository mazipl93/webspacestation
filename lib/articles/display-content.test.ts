import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getArticleBodyBlocks } from "@/lib/articles/display-content";
import type { NewsArticle } from "@/types";

describe("getArticleBodyBlocks — CMS figures", () => {
  it("keeps paragraphs with image markdown (not RSS https boilerplate)", () => {
    const article = {
      content: [
        "Akapit przed grafiką.",
        "![](https://cdn.example/hubble.jpg)\nNASA / ESA",
        "Źródło: https://spacenews.com/example — tylko link RSS",
      ],
      contentOrigin: "EDITORIAL",
    } as NewsArticle;

    const blocks = getArticleBodyBlocks(article);
    const figures = blocks.filter((b) => b.kind === "figure");

    assert.equal(figures.length, 1);
    assert.equal(blocks.some((b) => b.kind === "paragraph" && b.text.includes("spacenews")), false);
    if (figures[0].kind === "figure") {
      assert.equal(figures[0].src, "https://cdn.example/hubble.jpg");
      assert.equal(figures[0].caption, "NASA / ESA");
    }
  });
});
