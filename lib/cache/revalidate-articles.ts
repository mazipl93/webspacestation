import { getSiteUrl } from "@/lib/site-url";

/**
 * Invalidate Next.js Data Cache for published articles (homepage ISR).
 * Scripts call POST /api/revalidate-articles on prod (or SITE_URL / NEXT_PUBLIC_SITE_URL).
 */
export async function revalidateArticlesViaHttp(): Promise<void> {
  const base =
    process.env.SITE_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    getSiteUrl();

  const headers: HeadersInit = {};
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) headers.Authorization = `Bearer ${secret}`;

  const url = `${base}/api/revalidate-articles`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
    });
    const text = await res.text();
    if (!res.ok) {
      console.warn(`[revalidate] HTTP ${res.status} (${url}): ${text.slice(0, 200)}`);
      return;
    }
    console.log(`[revalidate] OK (${base}) — odśwież stronę (Ctrl+F5)`);
  } catch (err) {
    console.warn(`[revalidate] Błąd połączenia z ${url}`);
    console.warn(err instanceof Error ? err.message : err);
  }
}
