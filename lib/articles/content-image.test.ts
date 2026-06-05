import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatContentImageMarkdown,
  insertContentImageAtCaret,
  parseContentImageLine,
} from "@/lib/articles/content-image";
import {
  parseArticleBodyBlocks,
  parseParagraphToContentBlocks,
} from "@/lib/articles/parse-content-blocks";

describe("parseContentImageLine", () => {
  it("parses markdown image syntax", () => {
    assert.deepEqual(
      parseContentImageLine(
        "![Wykres metanu](https://cdn.example/chart.png)"
      ),
      { src: "https://cdn.example/chart.png", caption: "Wykres metanu" }
    );
  });

  it("parses ::image marker shorthand", () => {
    assert.deepEqual(
      parseContentImageLine("::image https://cdn.example/x.webp | Podpis NASA"),
      { src: "https://cdn.example/x.webp", caption: "Podpis NASA" }
    );
  });
});

describe("insertContentImageAtCaret", () => {
  it("wraps image line with blank lines", () => {
    const { value } = insertContentImageAtCaret(
      "Akapit przed.",
      13,
      13,
      "https://cdn.example/a.png",
      "Podpis"
    );
    assert.match(
      value,
      /Akapit przed\.\n\n!\[\]\(https:\/\/cdn\.example\/a\.png\)\nPodpis/
    );
  });
});

describe("parseParagraphToContentBlocks (figures)", () => {
  it("turns image-only paragraph into figure block", () => {
    const blocks = parseParagraphToContentBlocks(
      formatContentImageMarkdown("https://cdn.example/chart.png", "Infografika")
    );
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].kind, "figure");
    if (blocks[0].kind === "figure") {
      assert.equal(blocks[0].src, "https://cdn.example/chart.png");
      assert.equal(blocks[0].caption, "Infografika");
    }
  });

  it("reads caption from the line directly under the image URL", () => {
    const blocks = parseParagraphToContentBlocks(
      "![](https://cdn.example/chart.png)\nNASA / Webb — spektrum metanu"
    );
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].kind, "figure");
    if (blocks[0].kind === "figure") {
      assert.equal(blocks[0].caption, "NASA / Webb — spektrum metanu");
    }
  });

  it("splits embedded image lines out of a mixed paragraph", () => {
    const blocks = parseParagraphToContentBlocks(
      "Akapit przed grafiką.\n![](https://cdn.example/hubble.jpg)\nNASA / ESA"
    );
    assert.equal(blocks.length, 2);
    assert.equal(blocks[0].kind, "paragraph");
    assert.equal(blocks[1].kind, "figure");
    if (blocks[0].kind === "paragraph") {
      assert.equal(blocks[0].text, "Akapit przed grafiką.");
    }
    if (blocks[1].kind === "figure") {
      assert.equal(blocks[1].src, "https://cdn.example/hubble.jpg");
      assert.equal(blocks[1].caption, "NASA / ESA");
    }
  });
});

describe("parseArticleBodyBlocks figure caption merge", () => {
  it("merges a following single-line paragraph as caption", () => {
    const blocks = parseArticleBodyBlocks([
      "![](https://cdn.example/a.png)",
      "Podpis bezpośrednio pod grafiką",
      "Normalny akapit potem.",
    ]);
    assert.equal(blocks[0].kind, "figure");
    if (blocks[0].kind === "figure") {
      assert.equal(blocks[0].caption, "Podpis bezpośrednio pod grafiką");
    }
    assert.equal(blocks[1].kind, "paragraph");
  });
});
