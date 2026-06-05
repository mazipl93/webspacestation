import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getDeleteAccountBlockReason } from "@/lib/auth/delete-account-eligibility";

describe("getDeleteAccountBlockReason", () => {
  it("allows delete when user has no authored articles", () => {
    assert.equal(getDeleteAccountBlockReason(0), null);
  });

  it("blocks delete when user is article author in CMS", () => {
    const reason = getDeleteAccountBlockReason(1);
    assert.ok(reason);
    assert.match(reason, /artykuł/i);
  });
});
