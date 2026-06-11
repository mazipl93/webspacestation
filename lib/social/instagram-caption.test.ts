import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildInstagramCaption } from "./instagram-caption";

describe("buildInstagramCaption", () => {
  it("includes title, lead, url and hashtags", () => {
    const caption = buildInstagramCaption(
      {
        title: "JWST widzi nową galaktykę",
        excerpt: "Teleskop uchwycił strukturę sprzed miliardów lat.",
        tags: ["astronomia", "jwst"],
      },
      "https://webspacestation.pl/aktualnosci/jwst-galaktyka",
    );

    assert.match(caption, /JWST widzi nową galaktykę/);
    assert.match(caption, /webspacestation\.pl\/aktualnosci\/jwst-galaktyka/);
    assert.match(caption, /#astronomia/);
    assert.match(caption, /#jwst/);
  });
});
