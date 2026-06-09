import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    },
  });
});

import {
  isAccountLikedLocally,
  replaceAccountLikedSlugs,
  setAccountLikedSlug,
} from "@/lib/likes/browser-liked-cache";

describe("browser-liked-cache", () => {
  it("tracks account likes per slug", () => {
    replaceAccountLikedSlugs([]);
    setAccountLikedSlug("alpha", true);
    assert.equal(isAccountLikedLocally("alpha"), true);
    assert.equal(isAccountLikedLocally("beta"), false);
    setAccountLikedSlug("alpha", false);
    assert.equal(isAccountLikedLocally("alpha"), false);
  });

  it("replaces full slug list", () => {
    replaceAccountLikedSlugs(["a", "b", "a"]);
    assert.equal(isAccountLikedLocally("a"), true);
    assert.equal(isAccountLikedLocally("b"), true);
  });
});
