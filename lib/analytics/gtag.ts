export const GA_SCRIPT_ID = "wss-google-analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    google_tag_manager?: unknown;
    __wssConsentInit?: boolean;
  }
}

export function getGaMeasurementId(): string | null {
  const id = (
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA_ID
  )?.trim();
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return null;
  return id;
}

function ensureGtagStub(): void {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
}

const CONSENT_DENIED = {
  analytics_storage: "denied" as const,
  ad_storage: "denied" as const,
  ad_user_data: "denied" as const,
  ad_personalization: "denied" as const,
};

export function initGoogleConsentMode(): void {
  if (typeof window === "undefined" || window.__wssConsentInit) return;
  ensureGtagStub();
  window.gtag!("consent", "default", {
    ...CONSENT_DENIED,
    wait_for_update: 500,
  });
  window.__wssConsentInit = true;
}

export function grantAnalyticsConsent(): void {
  ensureGtagStub();
  window.gtag!("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function denyAnalyticsConsent(): void {
  if (!window.gtag) return;
  window.gtag("consent", "update", CONSENT_DENIED);
}

export function configureGoogleAnalytics(measurementId: string): void {
  ensureGtagStub();
  window.gtag!("js", new Date());
  window.gtag!("config", measurementId, {
    anonymize_ip: true,
    ...(process.env.NODE_ENV === "development" ? { debug_mode: true } : {}),
  });
}

export function clearGaClientCookies(): void {
  if (typeof document === "undefined") return;
  const hostParts = window.location.hostname.split(".");
  const domains = [
    undefined,
    window.location.hostname,
    hostParts.length > 1 ? `.${hostParts.slice(-2).join(".")}` : undefined,
  ].filter((d, i, arr) => d === undefined || arr.indexOf(d) === i);

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !name.startsWith("_ga")) continue;
    for (const domain of domains) {
      const domainAttr = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; path=/${domainAttr}`;
    }
  }
}

let gaScriptPromise: Promise<void> | null = null;
let gaScriptForId: string | null = null;

function resetGaScriptLoader(): void {
  gaScriptPromise = null;
  gaScriptForId = null;
}

function isGtagRuntimeReady(): boolean {
  return typeof window.google_tag_manager !== "undefined";
}

export function removeGaScripts(): void {
  document.getElementById(GA_SCRIPT_ID)?.remove();
  document.getElementById("_next-ga-init")?.remove();
  document.getElementById("_next-ga")?.remove();
  resetGaScriptLoader();
}

/** Singleton loader — survives React Strict Mode double-mount in dev. */
export function loadGoogleAnalyticsScript(measurementId: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();

  const existing = document.getElementById(GA_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing?.getAttribute("data-loaded") === "true" || isGtagRuntimeReady()) {
    existing?.setAttribute("data-loaded", "true");
    return Promise.resolve();
  }

  if (gaScriptPromise && gaScriptForId === measurementId) {
    return gaScriptPromise;
  }

  gaScriptForId = measurementId;
  gaScriptPromise = new Promise((resolve, reject) => {
    const finish = (script: HTMLScriptElement) => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };

    const waitFor = (script: HTMLScriptElement) => {
      if (script.getAttribute("data-loaded") === "true" || isGtagRuntimeReady()) {
        finish(script);
        return;
      }
      script.addEventListener("load", () => finish(script), { once: true });
      script.addEventListener("error", () => reject(new Error("GA script failed")), {
        once: true,
      });
    };

    if (existing) {
      waitFor(existing);
      return;
    }

    const script = document.createElement("script");
    script.id = GA_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    waitFor(script);
    document.head.appendChild(script);
  });

  return gaScriptPromise;
}

export function sendGaPageView(path: string): void {
  if (!window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
