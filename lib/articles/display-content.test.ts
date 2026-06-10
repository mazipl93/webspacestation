import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getArticleBodyBlocks,
  splitArticleLeadAndBody,
} from "@/lib/articles/display-content";
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

describe("splitArticleLeadAndBody", () => {
  it("does not extract first paragraph when excerpt (zajawka) is set", () => {
    const article = {
      excerpt: "Lead na kartach i w hero.",
      content: ["Pierwszy akapit treści.", "Drugi akapit."],
      contentOrigin: "EDITORIAL",
    } as NewsArticle;
    const blocks = getArticleBodyBlocks(article);
    const { lead, restBlocks } = splitArticleLeadAndBody(article, blocks);
    assert.equal(lead, null);
    assert.equal(restBlocks.length, 2);
  });

  it("uses first paragraph as body lead when excerpt is empty", () => {
    const article = {
      excerpt: "",
      content: ["Pierwszy akapit treści.", "Drugi akapit."],
      contentOrigin: "EDITORIAL",
    } as NewsArticle;
    const blocks = getArticleBodyBlocks(article);
    const { lead, restBlocks } = splitArticleLeadAndBody(article, blocks);
    assert.equal(lead, "Pierwszy akapit treści.");
    assert.equal(restBlocks.length, 1);
  });
});
