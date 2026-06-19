import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractLaunchIdFromTags,
  hasLaunchTag,
  launchTagFor,
} from "@/lib/ops/launch-tag";

describe("launch-tag", () => {
  it("builds and parses launch tags", () => {
    const tag = launchTagFor("abc-123");
    assert.equal(tag, "launch:abc-123");
    assert.equal(extractLaunchIdFromTags([tag, "spacex"]), "abc-123");
    assert.ok(hasLaunchTag([tag], "abc-123"));
  });
});
