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
  it("optimizes Supabase article-covers bucket", () => {
    assert.equal(
      shouldBypassImageOptimizer(
        "https://abc.supabase.co/storage/v1/object/public/article-covers/drafts/x.webp"
      ),
      false
    );
  });

  it("optimizes common RSS cover hosts (nasa.gov, wp.com, …)", () => {
    assert.equal(
      shouldBypassImageOptimizer(
        "https://www.nasa.gov/wp-content/uploads/2026/04/roman-option-3.jpg"
      ),
      false
    );
    assert.equal(
      shouldBypassImageOptimizer(
        "https://platform.theverge.com/wp-content/uploads/sites/2/2026/06/foo.jpg"
      ),
      false
    );
    assert.equal(
      shouldBypassImageOptimizer(
        "https://i0.wp.com/spacenews.com/wp-content/uploads/2026/06/iris2.jpg"
      ),
      false
    );
  });

  it("bypasses invalid and data URLs", () => {
    assert.equal(shouldBypassImageOptimizer(""), true);
    assert.equal(shouldBypassImageOptimizer("data:image/png;base64,abc"), true);
  });
});
