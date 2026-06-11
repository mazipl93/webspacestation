import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampSocialCardHook,
  clampSocialCardTitle,
  resolveShareCardCopy,
  SOCIAL_CARD_HOOK_MAX,
  SOCIAL_CARD_TITLE_MAX,
} from "./share-card-copy";

describe("resolveShareCardCopy", () => {
  it("uses explicit CMS fields when set", () => {
    const copy = resolveShareCardCopy({
      socialCardTitle: "Asteroida zabiła dinozaury",
      socialCardHook: "Warunki sprzyjające życiu przez 8 milionów lat.",
      title: "Długi SEO tytuł artykułu, który nie powinien trafić na grafikę",
    });
    assert.equal(copy.title, "Asteroida zabiła dinozaury");
    assert.equal(
      copy.hook,
      "Warunki sprzyjające życiu przez 8 milionów lat.",
    );
  });

  it("falls back to subtitle when short enough", () => {
    const copy = resolveShareCardCopy({
      title: "Bardzo długi tytuł artykułu SEO",
      subtitle: "Krótki podtytuł na stronę",
    });
    assert.equal(copy.title, "Krótki podtytuł na stronę");
    assert.equal(copy.hook, null);
  });

  it("uses article title when no social fields or subtitle", () => {
    const copy = resolveShareCardCopy({
      title: "Tytuł",
    });
    assert.equal(copy.title, "Tytuł");
    assert.equal(copy.hook, null);
  });
});

describe("clampSocialCard fields", () => {
  it("enforces title max length", () => {
    const long = "a".repeat(SOCIAL_CARD_TITLE_MAX + 10);
    assert.equal(clampSocialCardTitle(long).length, SOCIAL_CARD_TITLE_MAX);
  });

  it("enforces hook max length", () => {
    const long = "b".repeat(SOCIAL_CARD_HOOK_MAX + 5);
    assert.equal(clampSocialCardHook(long).length, SOCIAL_CARD_HOOK_MAX);
  });
});
