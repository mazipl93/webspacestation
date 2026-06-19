import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isIssPositionStale } from "./iss-stale";

describe("isIssPositionStale", () => {
  it("returns true when iss is null", () => {
    assert.equal(isIssPositionStale(null, 60_000), true);
  });

  it("returns true when timestamp is older than max age", () => {
    const old = Math.floor((Date.now() - 300_000) / 1000);
    assert.equal(
      isIssPositionStale({ latitude: 0, longitude: 0, timestamp: old }, 120_000),
      true,
    );
  });

  it("returns false for fresh position", () => {
    const now = Math.floor(Date.now() / 1000);
    assert.equal(
      isIssPositionStale({ latitude: 50, longitude: 20, timestamp: now }, 120_000),
      false,
    );
  });
});
