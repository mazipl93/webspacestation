import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ARTICLE_FEED_PAGE_SIZE,
  clampListingPage,
  listingPageHref,
  parseListingDepartment,
  parseListingPage,
} from "./article-listing";

describe("article listing pagination", () => {
  it("parseListingPage defaults invalid to 1", () => {
    assert.equal(parseListingPage(undefined), 1);
    assert.equal(parseListingPage("0"), 1);
    assert.equal(parseListingPage("-3"), 1);
    assert.equal(parseListingPage("abc"), 1);
  });

  it("parseListingPage accepts positive integers", () => {
    assert.equal(parseListingPage("2"), 2);
    assert.equal(parseListingPage(["3"]), 3);
  });

  it("parseListingDepartment validates category slugs", () => {
    assert.equal(parseListingDepartment("misje"), "misje");
    assert.equal(parseListingDepartment(undefined), undefined);
    assert.equal(parseListingDepartment("newsy"), undefined);
  });

  it("listingPageHref keeps page 1 clean", () => {
    assert.equal(listingPageHref("/aktualnosci", 1), "/aktualnosci");
    assert.equal(listingPageHref("/nauka", 2), "/nauka?strona=2");
  });

  it("listingPageHref preserves dzial filter on /aktualnosci", () => {
    assert.equal(
      listingPageHref("/aktualnosci", 1, { dzial: "misje" }),
      "/aktualnosci?dzial=misje",
    );
    assert.equal(
      listingPageHref("/aktualnosci", 2, { dzial: "misje" }),
      "/aktualnosci?dzial=misje&strona=2",
    );
  });

  it("clampListingPage bounds page", () => {
    assert.equal(clampListingPage(0, 5), 1);
    assert.equal(clampListingPage(9, 5), 5);
    assert.equal(clampListingPage(3, 5), 3);
  });

  it("ARTICLE_FEED_PAGE_SIZE is stable", () => {
    assert.equal(ARTICLE_FEED_PAGE_SIZE, 40);
  });
});
