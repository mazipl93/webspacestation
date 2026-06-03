import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasCoverImageKeys,
  parseCoverImageForCreate,
  parseCoverImageForUpdate,
  resolveCoverImageFromBody,
} from "@/lib/server/article-fields";

describe("article write — cover image mapping", () => {
  it("resolveCoverImageFromBody prefers coverImage then imageUrl then image", () => {
    assert.equal(
      resolveCoverImageFromBody({
        coverImage: "https://a.com/1.jpg",
        imageUrl: "https://b.com/2.jpg",
      }),
      "https://a.com/1.jpg"
    );
    assert.equal(
      resolveCoverImageFromBody({
        imageUrl: "https://b.com/2.jpg",
        image: "https://c.com/3.jpg",
      }),
      "https://b.com/2.jpg"
    );
    assert.equal(
      resolveCoverImageFromBody({ image: "https://c.com/3.jpg" }),
      "https://c.com/3.jpg"
    );
  });

  it("parseCoverImageForCreate returns null when no image fields", () => {
    assert.equal(parseCoverImageForCreate({ title: "x" }), null);
  });

  it("parseCoverImageForUpdate omits cover when no image keys (preserve DB)", () => {
    assert.equal(parseCoverImageForUpdate({ title: "x" }), undefined);
    assert.equal(hasCoverImageKeys({ title: "x" }), false);
  });

  it("parseCoverImageForUpdate resolves when any image key is sent", () => {
    assert.equal(
      parseCoverImageForUpdate({ imageUrl: "https://cdn/x.webp" }),
      "https://cdn/x.webp"
    );
    assert.equal(parseCoverImageForUpdate({ coverImage: "" }), null);
  });
});
