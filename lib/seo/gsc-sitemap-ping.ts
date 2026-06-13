import { getGscSitemapUrl } from "@/lib/seo/gsc-priority";

export type SitemapPingResult = {
  engine: string;
  url: string;
  ok: boolean;
  status: number;
  detail?: string;
};

/** Powiadom wyszukiwarki o odświeżeniu sitemap (po deploy / publikacji). */
export async function pingSearchEngineSitemaps(
  sitemapUrl = getGscSitemapUrl(),
): Promise<SitemapPingResult[]> {
  const encoded = encodeURIComponent(sitemapUrl);
  const targets = [
    {
      engine: "Google",
      url: `https://www.google.com/ping?sitemap=${encoded}`,
    },
    {
      engine: "Bing",
      url: `https://www.bing.com/ping?sitemap=${encoded}`,
    },
  ];

  const results: SitemapPingResult[] = [];

  for (const target of targets) {
    try {
      const res = await fetch(target.url, { method: "GET" });
      results.push({
        engine: target.engine,
        url: target.url,
        ok: res.ok,
        status: res.status,
        detail: res.ok ? undefined : (await res.text()).slice(0, 200),
      });
    } catch (error) {
      results.push({
        engine: target.engine,
        url: target.url,
        ok: false,
        status: 0,
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}
