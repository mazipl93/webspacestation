/** Wersja polityki — bump przy istotnych zmianach (zapis w user_metadata). */
export const PRIVACY_POLICY_VERSION = "2026-06-06";

export const PRIVACY_POLICY_PATH = "/polityka-prywatnosci";

export type PrivacyConsentMetadata = {
  privacy_policy_accepted_at: string;
  privacy_policy_version: string;
};

export function buildPrivacyConsentMetadata(): PrivacyConsentMetadata {
  return {
    privacy_policy_accepted_at: new Date().toISOString(),
    privacy_policy_version: PRIVACY_POLICY_VERSION,
  };
}

export function hasPrivacyConsent(
  metadata: Record<string, unknown> | undefined
): boolean {
  if (!metadata) return false;
  const acceptedAt = metadata.privacy_policy_accepted_at;
  const version = metadata.privacy_policy_version;
  return (
    typeof acceptedAt === "string" &&
    acceptedAt.length > 0 &&
    version === PRIVACY_POLICY_VERSION
  );
}
