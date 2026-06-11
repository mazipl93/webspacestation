/**
 * Resolve Instagram Business Account ID linked to WSS Facebook Page.
 * Writes INSTAGRAM_BUSINESS_ACCOUNT_ID to .env.fb.test.
 *
 * Usage: npx tsx scripts/fetch-instagram-account-id.ts
 */
import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";

config({ path: ".env.fb.test" });
config();

const WSS_PAGE_ID = "915447778328996";
const GRAPH = process.env.FACEBOOK_GRAPH_VERSION?.trim() || "v21.0";

async function main() {
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim() ?? "";
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim() || WSS_PAGE_ID;

  if (!pageToken) {
    throw new Error("Brak FACEBOOK_PAGE_ACCESS_TOKEN w .env.fb.test");
  }

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH}/${pageId}?fields=instagram_business_account{id,username}&access_token=${encodeURIComponent(pageToken)}`,
  );
  const data = (await res.json()) as {
    instagram_business_account?: { id?: string; username?: string };
    error?: { message?: string; code?: number };
  };

  if (data.error) {
    throw new Error(
      `Graph API: ${data.error.message} (code ${data.error.code ?? "?"})`,
    );
  }

  const ig = data.instagram_business_account;
  if (!ig?.id) {
    throw new Error(
      "Brak połączonego konta Instagram Business z tą stroną FB.\n" +
        "W Meta Business Suite: Ustawienia → Połączone konta → Instagram → połącz @webspacestation",
    );
  }

  console.log("Instagram Business Account:");
  console.log("  ID:", ig.id);
  console.log("  Username:", ig.username ?? "(unknown)");

  let content = "";
  try {
    content = readFileSync(".env.fb.test", "utf8");
  } catch {
    content = "";
  }

  const lines = content
    .split("\n")
    .filter((l) => !l.startsWith("INSTAGRAM_BUSINESS_ACCOUNT_ID="));
  lines.push(`INSTAGRAM_BUSINESS_ACCOUNT_ID=${ig.id}`);
  if (!lines.some((l) => l.startsWith("INSTAGRAM_AUTO_POST="))) {
    lines.push("INSTAGRAM_AUTO_POST=true");
  }
  writeFileSync(".env.fb.test", lines.filter(Boolean).join("\n") + "\n");
  console.log("\n✓ Zapisano INSTAGRAM_BUSINESS_ACCOUNT_ID w .env.fb.test");
  console.log("  Następny krok: .\\scripts\\sync-fb-env-vercel.ps1");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
