import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { insertListItemAtCaret } from "@/lib/articles/content-list";

describe("insertListItemAtCaret", () => {
  it("appends first list item at end", () => {
    const r = insertListItemAtCaret("Wstęp.", 6, 6);
    assert.equal(r.value, "Wstęp.\n• ");
    assert.equal(r.selectionStart, r.value.length);
  });

  it("inserts bullet line when caret is at start of a line", () => {
    const r = insertListItemAtCaret("Linia A\nLinia B", 8, 8);
    assert.equal(r.value, "Linia A\n• \nLinia B");
  });

  it("adds newline before bullet when caret is mid-line", () => {
    const r = insertListItemAtCaret("Tekst", 5, 5);
    assert.equal(r.value, "Tekst\n• ");
  });
});
