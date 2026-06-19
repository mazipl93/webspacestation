import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildArticleMetaDescription,
  isUsableMetaDescription,
  trimMetaDescription,
} from "@/lib/seo/article-meta-description";

describe("buildArticleMetaDescription", () => {
  it("prefers a unique CMS excerpt", () => {
    const description = buildArticleMetaDescription({
      title: "Start rakiety Falcon 9 z Cape Canaveral",
      excerpt:
        "SpaceX wyniosło kolejną partię satelitów Starlink na niską orbitę okołoziemską. Start przebiegł zgodnie z planem.",
      subtitle: "Krótki dek",
      content: ["Treść artykułu z dodatkowymi szczegółami misji."],
    });

    assert.match(description, /Starlink/);
    assert.notEqual(description, "Start rakiety Falcon 9 z Cape Canaveral");
  });

  it("falls back to trimmed content when excerpt duplicates title", () => {
    const title = "Co to jest czarna dziura?";
    const description = buildArticleMetaDescription({
      title,
      excerpt: title,
      content: [
        "Czarna dziura to region czasoprzestrzeni, w którym grawitacja jest tak silna, że nic — nawet światło — nie ucieknie na zewnątrz.",
        "Astronomowie obserwują je dzięki wpływowi na otaczającą materię.",
      ],
    });

    assert.match(description, /czasoprzestrzeni/i);
    assert.notEqual(description, title);
  });

  it("trims long excerpts to snippet length", () => {
    const long =
      "To jest bardzo długi lead artykułu, który przekracza typowy limit meta description i powinien zostać inteligentnie obcięty bez urwania w połowie słowa, tak aby nadal brzmiał naturalnie w wynikach wyszukiwania Google.";
    const trimmed = trimMetaDescription(long);
    assert.ok(trimmed.length <= 160);
    assert.ok(trimmed.endsWith("…") || trimmed.endsWith("."));
  });
});

describe("isUsableMetaDescription", () => {
  it("rejects near-duplicate of title", () => {
    assert.equal(
      isUsableMetaDescription(
        "Start rakiety Falcon 9 z Cape Canaveral — szczegóły",
        "Start rakiety Falcon 9 z Cape Canaveral",
      ),
      false,
    );
  });
});
