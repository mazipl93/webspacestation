"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import type { CookieConsentChoice } from "@/lib/analytics/consent";
import {
  clearMetaPixelCookies,
  getMetaPixelId,
  META_PIXEL_SCRIPT_ID,
  removeMetaPixelScripts,
  trackMetaPageView,
} from "@/lib/analytics/meta-pixel";

type Props = {
  consent: CookieConsentChoice | null;
};

/** Meta Pixel — loads only after cookie consent (same gate as GA4). */
export default function MetaPixel({ consent }: Props) {
  const pixelId = getMetaPixelId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialPageViewSent = useRef(false);
  const skipNextRoutePageView = useRef(true);
  const analyticsGranted = consent?.analytics === true;
  const analyticsRejected = consent?.analytics === false;

  useEffect(() => {
    if (!pixelId || !analyticsRejected) return;
    removeMetaPixelScripts();
    clearMetaPixelCookies();
    initialPageViewSent.current = false;
  }, [analyticsRejected, pixelId]);

  useEffect(() => {
    if (!pixelId || !analyticsGranted || !initialPageViewSent.current) return;
    if (skipNextRoutePageView.current) {
      skipNextRoutePageView.current = false;
      return;
    }
    trackMetaPageView();
  }, [analyticsGranted, pathname, pixelId, searchParams]);

  if (!pixelId || !analyticsGranted) return null;

  return (
    <>
      <Script
        id={META_PIXEL_SCRIPT_ID}
        strategy="afterInteractive"
        onLoad={() => {
          initialPageViewSent.current = true;
        }}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
