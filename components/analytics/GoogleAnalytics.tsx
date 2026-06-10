"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { CookieConsentChoice } from "@/lib/analytics/consent";
import {
  clearGaClientCookies,
  denyAnalyticsConsent,
  getGaMeasurementId,
  grantAnalyticsConsent,
  removeGaScripts,
  sendGaPageView,
} from "@/lib/analytics/gtag";

type Props = {
  consent: CookieConsentChoice | null;
};

/**
 * GA4 after consent — @next/third-parties loads gtag reliably in Next dev.
 * grantAnalyticsConsent() must run in render before <NextGoogleAnalytics /> mounts.
 */
export default function GoogleAnalytics({ consent }: Props) {
  const measurementId = getGaMeasurementId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const analyticsGranted = consent?.analytics === true;
  const analyticsRejected = consent?.analytics === false;

  useEffect(() => {
    if (!measurementId || !analyticsRejected) return;
    denyAnalyticsConsent();
    clearGaClientCookies();
    removeGaScripts();
  }, [analyticsRejected, measurementId]);

  useEffect(() => {
    if (!measurementId || !analyticsGranted) return;
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const timer = window.setTimeout(() => sendGaPageView(path), 1500);
    return () => window.clearTimeout(timer);
  }, [analyticsGranted, measurementId, pathname, searchParams]);

  if (!measurementId || !analyticsGranted) return null;

  grantAnalyticsConsent();

  return <NextGoogleAnalytics gaId={measurementId} />;
}
