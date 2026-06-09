import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidAnonLikeId } from "@/lib/likes/anon-id";

describe("isValidAnonLikeId", () => {
  it("accepts UUID v4", () => {
    assert.equal(
      isValidAnonLikeId("550e8400-e29b-41d4-a716-446655440000"),
      true
    );
  });

  it("rejects garbage", () => {
    assert.equal(isValidAnonLikeId(""), false);
    assert.equal(isValidAnonLikeId("not-a-uuid"), false);
  });
});
