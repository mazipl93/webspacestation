export const META_PIXEL_SCRIPT_ID = "wss-meta-pixel";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/** Meta Events Manager → Pixel ID (same numeric id as in base code snippet). */
export function getMetaPixelId(): string | null {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if (!id || !/^\d{5,20}$/.test(id)) return null;
  return id;
}

export function isMetaPixelReady(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

export function trackMetaPageView(): void {
  if (!isMetaPixelReady()) return;
  window.fbq!("track", "PageView");
}

export function clearMetaPixelCookies(): void {
  if (typeof document === "undefined") return;
  const hostParts = window.location.hostname.split(".");
  const domains = [
    undefined,
    window.location.hostname,
    hostParts.length > 1 ? `.${hostParts.slice(-2).join(".")}` : undefined,
  ].filter((d, i, arr) => d === undefined || arr.indexOf(d) === i);

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || (!name.startsWith("_fb") && name !== "fr")) continue;
    for (const domain of domains) {
      const domainAttr = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; path=/${domainAttr}`;
    }
  }
}

export function removeMetaPixelScripts(): void {
  if (typeof document === "undefined") return;
  document.getElementById(META_PIXEL_SCRIPT_ID)?.remove();
  document
    .querySelectorAll('script[src*="connect.facebook.net"]')
    .forEach((node) => node.remove());
  if (typeof window !== "undefined") {
    delete window.fbq;
    delete window._fbq;
  }
}
