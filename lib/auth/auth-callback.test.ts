import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  mapAuthCallbackLoginError,
  parseAuthCallbackParams,
} from "@/lib/auth/auth-callback";

describe("parseAuthCallbackParams", () => {
  it("parses token_hash signup link with safe next path", () => {
    const params = parseAuthCallbackParams(
      new URLSearchParams(
        "token_hash=abc&type=signup&next=%2Fprofil"
      )
    );
    assert.equal(params.tokenHash, "abc");
    assert.equal(params.type, "signup");
    assert.equal(params.next, "/profil");
    assert.equal(params.code, null);
  });

  it("rejects open redirect in next", () => {
    const params = parseAuthCallbackParams(
      new URLSearchParams("code=xyz&next=//evil.example")
    );
    assert.equal(params.next, "/");
  });
});

describe("mapAuthCallbackLoginError", () => {
  it("maps auth callback errors", () => {
    assert.ok(mapAuthCallbackLoginError("auth")?.includes("innej przeglądarce"));
    assert.ok(
      mapAuthCallbackLoginError("email_not_confirmed")?.includes("Potwierdź")
    );
    assert.equal(mapAuthCallbackLoginError(null), null);
  });
});
