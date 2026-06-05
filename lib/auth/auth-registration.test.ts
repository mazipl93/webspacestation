import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildPrivacyConsentMetadata,
  hasPrivacyConsent,
  PRIVACY_POLICY_VERSION,
} from "@/lib/auth/privacy-consent";
import { isEmailVerified } from "@/lib/auth/email-verified";

describe("privacy consent", () => {
  it("builds metadata with current policy version", () => {
    const meta = buildPrivacyConsentMetadata();
    assert.equal(meta.privacy_policy_version, PRIVACY_POLICY_VERSION);
    assert.ok(meta.privacy_policy_accepted_at);
  });

  it("detects valid consent in user metadata", () => {
    assert.equal(hasPrivacyConsent(buildPrivacyConsentMetadata()), true);
    assert.equal(hasPrivacyConsent({ privacy_policy_accepted_at: "x" }), false);
    assert.equal(hasPrivacyConsent(undefined), false);
  });
});

describe("isEmailVerified", () => {
  it("requires email_confirmed_at", () => {
    assert.equal(isEmailVerified({ email_confirmed_at: undefined }), false);
    assert.equal(
      isEmailVerified({ email_confirmed_at: "2026-06-05T12:00:00.000Z" }),
      true
    );
  });
});
