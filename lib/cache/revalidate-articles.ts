/**
 * Invalidate Next.js Data Cache for published articles (homepage ISR).
 * Works from API routes; scripts call the HTTP endpoint when the dev server runs.
 */
export async function revalidateArticlesViaHttp(): Promise<void> {
  const base =
    process.env.SITE_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const headers: HeadersInit = {};
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) headers.Authorization = `Bearer ${secret}`;

  try {
    const res = await fetch(`${base}/api/revalidate-articles`, {
      method: "POST",
      headers,
    });
    const text = await res.text();
    if (!res.ok) {
      console.warn(`[revalidate] HTTP ${res.status}: ${text.slice(0, 200)}`);
      return;
    }
    console.log("[revalidate] OK — odśwież stronę (Ctrl+F5)");
  } catch (err) {
    console.warn(
      "[revalidate] Pominięto (uruchom dev i: npm run cache:revalidate albo zrestartuj npm run dev)"
    );
    console.warn(err instanceof Error ? err.message : err);
  }
}
