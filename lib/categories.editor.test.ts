import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { prepareCategoriesForEditor } from "@/lib/categories";

describe("prepareCategoriesForEditor", () => {
  it("returns editorial order with Nauka label", () => {
    const rows = prepareCategoriesForEditor([
      { id: "1", slug: "iss", name: "ISS", orderIndex: 4 },
      { id: "2", slug: "misje", name: "Misje", orderIndex: 0 },
      { id: "3", slug: "nauka", name: "Old name", orderIndex: 2 },
      { id: "4", slug: "astronomia", name: "Astronomia", orderIndex: 1 },
      { id: "5", slug: "technologie", name: "Technologie", orderIndex: 3 },
      { id: "6", slug: "ziemia-z-kosmosu", name: "Ziemia", orderIndex: 5 },
      { id: "7", slug: "rozrywka", name: "Rozrywka", orderIndex: 6 },
      { id: "8", slug: "ai", name: "AI", orderIndex: 99 },
    ] as const);

    assert.deepEqual(
      rows.map((r) => r.slug),
      [
        "misje",
        "astronomia",
        "nauka",
        "technologie",
        "iss",
        "ziemia-z-kosmosu",
        "rozrywka",
      ]
    );
    assert.equal(rows.find((r) => r.slug === "nauka")?.name, "Nauka");
    assert.equal(rows.some((r) => r.slug === "ai"), false);
  });

  it("maps legacy popularnonaukowe row as Nauka when nauka slug missing", () => {
    const rows = prepareCategoriesForEditor([
      { id: "legacy", slug: "popularnonaukowe", name: "Popularnonaukowe", orderIndex: 2 },
      { id: "1", slug: "misje", name: "Misje", orderIndex: 0 },
    ] as const);

    assert.equal(rows.length, 2);
    assert.equal(rows[1].slug, "popularnonaukowe");
    assert.equal(rows[1].id, "legacy");
    assert.equal(rows[1].name, "Nauka");
  });
});
