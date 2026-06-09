import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  insertContentVideoAtCaret,
  parseContentVideoLine,
  resolveVideoEmbedUrl,
} from "@/lib/articles/content-video";
import { parseParagraphToContentBlocks } from "@/lib/articles/parse-content-blocks";

describe("parseContentVideoLine", () => {
  it("parses ::video marker", () => {
    assert.deepEqual(
      parseContentVideoLine("::video https://www.youtube.com/watch?v=abc123"),
      { src: "https://www.youtube.com/watch?v=abc123", caption: undefined }
    );
  });
});

describe("resolveVideoEmbedUrl", () => {
  it("embeds YouTube watch URLs", () => {
    assert.equal(
      resolveVideoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("embeds youtu.be URLs", () => {
    assert.equal(
      resolveVideoEmbedUrl("https://youtu.be/dQw4w9WgXcQ"),
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("embeds Vimeo URLs", () => {
    assert.equal(
      resolveVideoEmbedUrl("https://vimeo.com/123456789"),
      "https://player.vimeo.com/video/123456789"
    );
  });
});

describe("insertContentVideoAtCaret", () => {
  it("wraps video block with blank lines", () => {
    const { value } = insertContentVideoAtCaret(
      "Akapit.",
      7,
      7,
      "https://www.youtube.com/watch?v=abc",
      "Opis"
    );
    assert.match(
      value,
      /Akapit\.\n\n::video https:\/\/www\.youtube\.com\/watch\?v=abc\nOpis/
    );
  });
});

describe("parseParagraphToContentBlocks (video)", () => {
  it("turns ::video paragraph into video block", () => {
    const blocks = parseParagraphToContentBlocks(
      "::video https://www.youtube.com/watch?v=abc\nPodpis wideo"
    );
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].kind, "video");
    if (blocks[0].kind === "video") {
      assert.equal(blocks[0].caption, "Podpis wideo");
    }
  });
});
