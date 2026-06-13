/**
 * Pakiet GSC (Krok 6): priorytetowe URL-e, feedy, ping sitemap.
 *
 * Usage:
 *   npx tsx scripts/gsc-priority-urls.ts
 *   npx tsx scripts/gsc-priority-urls.ts --tier=1
 *   npx tsx scripts/gsc-priority-urls.ts --ping
 *   npx tsx scripts/gsc-priority-urls.ts --plain   # same URL-e, jeden na linię (bulk)
 */
import { config } from "dotenv";
import {
  GSC_SEARCH_INTENTS,
  buildGscUrlEntries,
  getGscFeedUrls,
  getGscSitemapUrl,
  type GscUrlTier,
} from "@/lib/seo/gsc-priority";
import { pingSearchEngineSitemaps } from "@/lib/seo/gsc-sitemap-ping";

config({ path: ".env.local" });
config();

function parseTier(): GscUrlTier {
  const arg = process.argv.find((a) => a.startsWith("--tier="));
  if (!arg) return "all";
  const value = arg.split("=")[1];
  if (value === "1" || value === "2" || value === "3") return Number(value) as 1 | 2 | 3;
  if (value === "intents") return "intents";
  return "all";
}

const plain = process.argv.includes("--plain");
const doPing = process.argv.includes("--ping");

async function main() {
  const tier = parseTier();
  const entries = buildGscUrlEntries(tier);
  const sitemapUrl = getGscSitemapUrl();
  const feeds = getGscFeedUrls();
  const hasGoogleVerification = Boolean(process.env.GOOGLE_SITE_VERIFICATION?.trim());

  if (plain) {
    for (const entry of entries) {
      console.log(entry.url);
    }
    return;
  }

  console.log("# WSS — Google Search Console · pakiet indeksacji (Krok 6)\n");
  console.log(`Sitemap: ${sitemapUrl}`);
  console.log(
    `GOOGLE_SITE_VERIFICATION: ${hasGoogleVerification ? "ustawione w env" : "BRAK — dodaj w Vercel Production"}`,
  );
  console.log("");

  console.log("## 1. GSC → Sitemaps → Dodaj / odśwież");
  console.log(sitemapUrl);
  console.log("");

  console.log("## 2. URL Inspection → Request indexing (tier", tier, ")\n");
  for (const entry of entries) {
    console.log(entry.url);
    if (entry.note) console.log(`  ↳ ${entry.note}`);
  }
  console.log("");

  console.log("## 3. Feedy RSS (dystrybucja + discovery)\n");
  for (const feed of feeds) {
    console.log(feed);
  }
  console.log("");

  console.log("## 4. Frazy do raportu Performance (2–4 tyg.)\n");
  console.log("| Zapytanie | Strona |");
  console.log("|---|---|");
  for (const row of GSC_SEARCH_INTENTS) {
    console.log(`| ${row.query} | ${row.path} |`);
  }
  console.log("");

  console.log("## 5. Baseline GSC (wklej po ~2 tyg.)\n");
  for (const row of GSC_SEARCH_INTENTS) {
    console.log(`- ${row.query}: imp ___ / CTR ___ / pos ___`);
  }
  console.log("");

  if (doPing) {
    console.log("## Ping sitemap\n");
    const pings = await pingSearchEngineSitemaps(sitemapUrl);
    for (const ping of pings) {
      console.log(
        `${ping.engine}: ${ping.ok ? "OK" : "FAIL"} (${ping.status})${ping.detail ? ` — ${ping.detail}` : ""}`,
      );
    }
  } else {
    console.log("Opcjonalnie: npx tsx scripts/gsc-priority-urls.ts --ping");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
