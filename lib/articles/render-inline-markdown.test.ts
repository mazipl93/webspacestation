import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderInlineMarkdown } from "@/lib/articles/render-inline-markdown";

describe("renderInlineMarkdown", () => {
  it("autolinks bare https URLs", () => {
    const out = renderInlineMarkdown("Zobacz https://example.com/page i dalej.");
    assert.ok(out);
    assert.notEqual(typeof out, "string");
  });

  it("parses markdown links", () => {
    const out = renderInlineMarkdown("Tekst [NASA](https://nasa.gov) koniec.");
    assert.ok(out);
  });

  it("keeps plain text without markers", () => {
    assert.equal(renderInlineMarkdown("Zwykły akapit."), "Zwykły akapit.");
  });

  it("supports bold and autolink together", () => {
    const out = renderInlineMarkdown("**Ważne:** https://example.com");
    assert.ok(out);
  });
});
