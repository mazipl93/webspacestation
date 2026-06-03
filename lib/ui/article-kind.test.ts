import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CMS_EDITORIAL_TYPE_LABEL,
  CMS_EXTERNAL_SOURCE_TYPE_LABEL,
  cmsArticleTypeLabel,
  hasCitationFields,
  hasSourceAttribution,
  isRssArticle,
} from "@/lib/ui/article-kind";

describe("article-kind — CMS type (PR7)", () => {
  it("Typ requires both source name and URL", () => {
    assert.equal(hasCitationFields("SpaceNews", "https://x.com/a"), true);
    assert.equal(hasCitationFields("SpaceNews", ""), false);
    assert.equal(hasCitationFields("", "https://x.com/a"), false);
  });

  it("maps citation fields to Artykuł or Źródło zewnętrzne only", () => {
    assert.equal(
      cmsArticleTypeLabel("NASA", "https://nasa.gov/x"),
      CMS_EXTERNAL_SOURCE_TYPE_LABEL
    );
    assert.equal(cmsArticleTypeLabel("WSS", null), CMS_EDITORIAL_TYPE_LABEL);
    assert.equal(cmsArticleTypeLabel(null, null), CMS_EDITORIAL_TYPE_LABEL);
  });

  it("attribution link is URL-only", () => {
    assert.equal(hasSourceAttribution("https://nasa.gov/x"), true);
    assert.equal(hasSourceAttribution(""), false);
  });
});

describe("article-kind — public layout (contentOrigin, not CMS copy)", () => {
  it("isRssArticle for public rendering only", () => {
    assert.equal(isRssArticle("RSS"), true);
    assert.equal(isRssArticle("EDITORIAL"), false);
    assert.equal(isRssArticle(undefined), false);
  });
});
