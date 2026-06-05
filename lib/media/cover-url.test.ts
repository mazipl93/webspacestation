import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeCoverImageUrl,
  shouldBypassImageOptimizer,
} from "@/lib/media/cover-url";

describe("normalizeCoverImageUrl", () => {
  it("trims and keeps https URLs", () => {
    assert.equal(
      normalizeCoverImageUrl("  https://example.com/a.png  "),
      "https://example.com/a.png"
    );
  });

  it("prepends https when missing", () => {
    assert.equal(
      normalizeCoverImageUrl("example.com/photo.png"),
      "https://example.com/photo.png"
    );
  });

  it("supports protocol-relative URLs", () => {
    assert.equal(
      normalizeCoverImageUrl("//cdn.example.com/x.png"),
      "https://cdn.example.com/x.png"
    );
  });

  it("returns null for empty or non-url text", () => {
    assert.equal(normalizeCoverImageUrl(""), null);
    assert.equal(normalizeCoverImageUrl("not a url"), null);
  });
});

describe("shouldBypassImageOptimizer", () => {
  it("trusts Supabase article-covers bucket", () => {
    assert.equal(
      shouldBypassImageOptimizer(
        "https://abc.supabase.co/storage/v1/object/public/article-covers/drafts/x.webp"
      ),
      false
    );
  });

  it("bypasses arbitrary external PNG hosts", () => {
    assert.equal(
      shouldBypassImageOptimizer("https://cdn.example.com/press-kit.png"),
      true
    );
  });
});
