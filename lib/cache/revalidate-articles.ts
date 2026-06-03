import { getSiteUrl } from "@/lib/site-url";

/**
 * Invalidate Next.js Data Cache for published articles (homepage ISR).
 * Scripts call POST /api/revalidate-articles on prod (or SITE_URL / NEXT_PUBLIC_SITE_URL).
 */
async function postRevalidate(base: string, headers: HeadersInit): Promise<boolean> {
  const url = `${base}/api/revalidate-articles`;
  try {
    const res = await fetch(url, { method: "POST", headers });
    const text = await res.text();
    if (!res.ok) {
      console.warn(`[revalidate] HTTP ${res.status} (${url}): ${text.slice(0, 200)}`);
      return false;
    }
    console.log(`[revalidate] OK (${base})`);
    return true;
  } catch (err) {
    console.warn(`[revalidate] Błąd połączenia z ${url}`);
    console.warn(err instanceof Error ? err.message : err);
    return false;
  }
}

export async function revalidateArticlesViaHttp(): Promise<void> {
  const prod =
    process.env.SITE_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    getSiteUrl();

  const headers: HeadersInit = {};
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) headers.Authorization = `Bearer ${secret}`;

  const targets = [prod];
  if (process.env.NODE_ENV !== "production") {
    targets.unshift("http://127.0.0.1:3000");
  }

  for (const base of [...new Set(targets)]) {
    await postRevalidate(base, headers);
  }
  console.log("Odśwież stronę (Ctrl+F5).");
}
