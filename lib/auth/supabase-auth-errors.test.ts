import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapSupabaseAuthError } from "@/lib/auth/supabase-auth-errors";

describe("mapSupabaseAuthError", () => {
  it("maps email rate limit", () => {
    assert.ok(
      mapSupabaseAuthError("email rate limit exceeded").includes("godzinę")
    );
  });
});
