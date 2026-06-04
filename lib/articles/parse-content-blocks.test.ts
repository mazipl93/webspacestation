import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseParagraphToContentBlocks } from "@/lib/articles/parse-content-blocks";

describe("parseParagraphToContentBlocks", () => {
  it("keeps a normal single-line paragraph", () => {
    const blocks = parseParagraphToContentBlocks("Jeden akapit bez listy.");
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].kind, "paragraph");
    if (blocks[0].kind === "paragraph") {
      assert.equal(blocks[0].text, "Jeden akapit bez listy.");
    }
  });

  it("parses legacy hyphen lines without blank lines (Sony-style)", () => {
    const blocks = parseParagraphToContentBlocks("-Gra A\n-Gra B\n-Gra C");
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].kind, "list");
    if (blocks[0].kind === "list") {
      assert.deepEqual(blocks[0].items, ["Gra A", "Gra B", "Gra C"]);
    }
  });

  it("parses CMS bullet marker lines", () => {
    const blocks = parseParagraphToContentBlocks("• Punkt 1\n• Punkt 2");
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].kind, "list");
    if (blocks[0].kind === "list") {
      assert.deepEqual(blocks[0].items, ["Punkt 1", "Punkt 2"]);
    }
  });

  it("splits paragraph then list in one stored block", () => {
    const blocks = parseParagraphToContentBlocks(
      "Wstęp do listy.\n• A\n• B"
    );
    assert.equal(blocks.length, 2);
    assert.equal(blocks[0].kind, "paragraph");
    assert.equal(blocks[1].kind, "list");
  });
});
