import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EDITORIAL_ARTICLE_LABEL,
  EXTERNAL_SOURCE_LABEL,
  articleKindLabel,
  hasExternalSource,
} from "@/lib/ui/article-kind";

describe("article-kind UI labels", () => {
  it("requires both source name and URL for external", () => {
    assert.equal(hasExternalSource("SpaceNews", "https://x.com/a"), true);
    assert.equal(hasExternalSource("SpaceNews", ""), false);
    assert.equal(hasExternalSource("", "https://x.com/a"), false);
  });

  it("maps to editorial or external labels only", () => {
    assert.equal(
      articleKindLabel("NASA", "https://nasa.gov/x"),
      EXTERNAL_SOURCE_LABEL
    );
    assert.equal(articleKindLabel("WSS", null), EDITORIAL_ARTICLE_LABEL);
  });
});
