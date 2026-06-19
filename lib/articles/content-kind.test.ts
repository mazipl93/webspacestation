import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ArticleContentKind } from "@prisma/client";
import {
  defaultContentKindForCategory,
  isFreshContentKind,
  validateContentKindForCategory,
} from "./content-kind";

describe("content-kind", () => {
  it("nauka defaults to evergreen", () => {
    assert.equal(
      defaultContentKindForCategory("nauka"),
      ArticleContentKind.EVERGREEN,
    );
  });

  it("misje defaults to news", () => {
    assert.equal(
      defaultContentKindForCategory("misje"),
      ArticleContentKind.NEWS,
    );
  });

  it("blocks news/analysis in nauka", () => {
    assert.equal(
      validateContentKindForCategory("nauka", ArticleContentKind.NEWS).ok,
      false,
    );
    assert.equal(
      validateContentKindForCategory("nauka", ArticleContentKind.ANALYSIS).ok,
      false,
    );
    assert.equal(
      validateContentKindForCategory("nauka", ArticleContentKind.EVERGREEN).ok,
      true,
    );
  });

  it("allows news in misje", () => {
    assert.equal(
      validateContentKindForCategory("misje", ArticleContentKind.NEWS).ok,
      true,
    );
  });

  it("fresh kinds for news sitemap", () => {
    assert.equal(isFreshContentKind(ArticleContentKind.NEWS), true);
    assert.equal(isFreshContentKind(ArticleContentKind.ANALYSIS), true);
    assert.equal(isFreshContentKind(ArticleContentKind.EVERGREEN), false);
  });
});
