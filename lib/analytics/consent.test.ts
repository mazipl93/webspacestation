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
  COOKIE_CONSENT_VERSION,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/analytics/consent";

describe("cookie consent", () => {
  it("returns null when undecided", () => {
    assert.equal(readCookieConsent(), null);
  });

  it("persists analytics choice", () => {
    writeCookieConsent(true);
    const stored = readCookieConsent();
    assert.equal(stored?.analytics, true);
    assert.equal(stored?.version, COOKIE_CONSENT_VERSION);
  });

  it("persists essential-only choice", () => {
    writeCookieConsent(false);
    assert.equal(readCookieConsent()?.analytics, false);
  });
});
