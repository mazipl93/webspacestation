"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import CookieConsentBanner from "@/components/consent/CookieConsentBanner";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_OPEN_EVENT,
  readCookieConsent,
  type CookieConsentChoice,
} from "@/lib/analytics/consent";
import { initGoogleConsentMode } from "@/lib/analytics/gtag";

function SiteAnalyticsInner() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<CookieConsentChoice | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    initGoogleConsentMode();
    const stored = readCookieConsent();
    setConsent(stored);
    setBannerOpen(stored === null);
    setReady(true);
  }, []);

  useEffect(() => {
    const onChanged = () => {
      const stored = readCookieConsent();
      setConsent(stored);
      setBannerOpen(false);
    };
    const onOpen = () => setBannerOpen(true);
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChanged);
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChanged);
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
    };
  }, []);

  if (isAdmin || !ready) return null;

  return (
    <>
      {bannerOpen ? (
        <CookieConsentBanner
          onDecide={(choice) => {
            setConsent(choice);
            setBannerOpen(false);
          }}
        />
      ) : null}
      <GoogleAnalytics consent={consent} />
    </>
  );
}

/** Public-site analytics — root layout only, never CMS editor. */
export default function SiteAnalytics() {
  return (
    <Suspense fallback={null}>
      <SiteAnalyticsInner />
    </Suspense>
  );
}
