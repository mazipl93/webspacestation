"use client";

import { useEffect } from "react";

/**
 * Removes stale service workers (e.g. old PWA experiments) that intercept
 * navigations and break with "Failed to convert value to 'Response'".
 */
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        void registration.unregister();
      }
    });
  }, []);

  return null;
}
