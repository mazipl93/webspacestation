/** Cookie / analytics consent — stored in browser only (not CMS). */
export const COOKIE_CONSENT_KEY = "wss_cookie_consent";
export const COOKIE_CONSENT_VERSION = "2026-06-10";
export const COOKIE_CONSENT_OPEN_EVENT = "wss:cookie-consent-open";
export const COOKIE_CONSENT_CHANGED_EVENT = "wss:cookie-consent-changed";

export type CookieConsentChoice = {
  version: string;
  essential: true;
  analytics: boolean;
  decidedAt: string;
};

export function readCookieConsent(): CookieConsentChoice | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    if (record.version !== COOKIE_CONSENT_VERSION) return null;
    if (record.essential !== true) return null;
    if (typeof record.analytics !== "boolean") return null;
    if (typeof record.decidedAt !== "string") return null;
    return {
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      analytics: record.analytics,
      decidedAt: record.decidedAt,
    };
  } catch {
    return null;
  }
}

export function writeCookieConsent(analytics: boolean): CookieConsentChoice {
  const choice: CookieConsentChoice = {
    version: COOKIE_CONSENT_VERSION,
    essential: true,
    analytics,
    decidedAt: new Date().toISOString(),
  };
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(choice));
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
  }
  return choice;
}

export function hasAnalyticsConsent(): boolean {
  return readCookieConsent()?.analytics === true;
}

export function openCookieConsentSettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}
