import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveArticleImageCredit,
  resolveImageCreditFromForm,
} from "@/lib/articles/image-credit";

describe("image credit resolution", () => {
  it("prefers manual coverImageCredit over RSS auto", () => {
    assert.equal(
      resolveArticleImageCredit({
        coverImageCredit: "NASA / Kowsky",
        source: "SpaceNews",
        originalUrl: "https://spacenews.com/x",
        contentOrigin: "RSS",
      }),
      "NASA / Kowsky"
    );
  });

  it("falls back to RSS auto when manual empty", () => {
    const credit = resolveArticleImageCredit({
      coverImageCredit: "",
      source: "NASA",
      originalUrl: "https://nasa.gov/x",
      subtitle: "raw",
      contentOrigin: "RSS",
    });
    assert.ok(credit?.includes("NASA"));
  });

  it("resolveImageCreditFromForm returns manual caption", () => {
    assert.equal(
      resolveImageCreditFromForm({
        coverImageCredit: "WSS / redakcja",
      }),
      "WSS / redakcja"
    );
  });

  it("resolveImageCreditFromForm returns undefined when empty", () => {
    assert.equal(
      resolveImageCreditFromForm({ coverImageCredit: "" }),
      undefined
    );
  });
});
