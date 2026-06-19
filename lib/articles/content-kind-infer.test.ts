import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ArticleContentKind } from "@prisma/client";
import { inferContentKindForArticle } from "./content-kind-infer";

describe("content-kind-infer", () => {
  it("nauka is always evergreen unless guide", () => {
    assert.equal(
      inferContentKindForArticle({
        categorySlug: "nauka",
        title: "Dlaczego w kosmosie jest próżnia",
      }).kind,
      ArticleContentKind.EVERGREEN,
    );
  });

  it("detects explicit analysis in title", () => {
    assert.equal(
      inferContentKindForArticle({
        categorySlug: "astronomia",
        title:
          "Czy obce sondy mogą kryć się w Układzie Słonecznym? Nowa analiza NASA",
        readingTime: 5,
      }).kind,
      ArticleContentKind.ANALYSIS,
    );
  });

  it("classifies interpretive question as analysis", () => {
    assert.equal(
      inferContentKindForArticle({
        categorySlug: "astronomia",
        title: "Asteroida 2003 LN6 dziś mija Ziemię. Czy to zagrożenie?",
        readingTime: 5,
      }).kind,
      ArticleContentKind.ANALYSIS,
    );
  });

  it("keeps short mission news as news", () => {
    assert.equal(
      inferContentKindForArticle({
        categorySlug: "misje",
        title: "Starship Flight 14 — pełny sukces. SpaceX odzyskał oba stopnie",
        readingTime: 4,
      }).kind,
      ArticleContentKind.NEWS,
    );
  });

  it("classifies JWST mystery feature as analysis", () => {
    assert.equal(
      inferContentKindForArticle({
        categorySlug: "astronomia",
        title:
          "Słone chmury na Różowej Planecie. JWST rozwiązał zagadkę sprzed 13 lat",
        readingTime: 5,
      }).kind,
      ArticleContentKind.ANALYSIS,
    );
  });

  it("classifies long tech feature as analysis", () => {
    assert.equal(
      inferContentKindForArticle({
        categorySlug: "technologie",
        title:
          "Internet kwantowy jest bliżej niż myślisz. Naukowcy pokazali teleportację informacji",
        readingTime: 10,
      }).kind,
      ArticleContentKind.ANALYSIS,
    );
  });

  it("keeps company statement news as news despite length", () => {
    assert.equal(
      inferContentKindForArticle({
        categorySlug: "misje",
        title:
          "Blue Origin: New Glenn ma wrócić na pas do końca 2026 — deklaracja po SpaceNews",
        readingTime: 10,
      }).kind,
      ArticleContentKind.NEWS,
    );
  });

  it("does not treat półprzewodników in excerpt as guide", () => {
    assert.equal(
      inferContentKindForArticle({
        categorySlug: "technologie",
        title: "Commercial Space Federation wita nowych członków",
        excerpt: "Produkcja półprzewodników w przestrzeni kosmicznej",
        readingTime: 1,
      }).kind,
      ArticleContentKind.NEWS,
    );
  });
});
