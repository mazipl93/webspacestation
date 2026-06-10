/**
 * Exchange short-lived user token → long-lived user token → WSS page token.
 * Updates .env.fb.test (never prints full token).
 *
 * Required in .env.fb.test:
 *   FACEBOOK_APP_ID
 *   FACEBOOK_APP_SECRET
 *   FACEBOOK_USER_TOKEN   (short-lived user token from Graph API Explorer)
 *
 * Usage: npx tsx scripts/fetch-long-lived-page-token.ts
 */
import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";

config({ path: ".env.fb.test" });
config();

const WSS_PAGE_ID = "915447778328996";
const GRAPH = process.env.FACEBOOK_GRAPH_VERSION?.trim() || "v21.0";

type TokenPayload = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: { message?: string; code?: number };
};

type DebugToken = {
  data?: {
    is_valid?: boolean;
    type?: string;
    expires_at?: number;
    app_id?: string;
  };
  error?: { message?: string };
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return (await res.json()) as T;
}

async function debugTokenSummary(token: string, label: string): Promise<void> {
  const data = await fetchJson<DebugToken>(
    `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`,
  );
  const info = data.data;
  if (!info?.is_valid) {
    throw new Error(`${label}: token invalid — ${data.error?.message ?? "unknown"}`);
  }
  const expires =
    info.expires_at === 0
      ? "never"
      : new Date((info.expires_at ?? 0) * 1000).toISOString();
  console.log(`${label}: type=${info.type}, expires=${expires}`);
}

function upsertEnvFbTest(updates: Record<string, string>): void {
  let content = "";
  try {
    content = readFileSync(".env.fb.test", "utf8");
  } catch {
    content = "";
  }

  const lines = content.split("\n").filter((line) => {
    const key = line.split("=")[0];
    return !updates[key];
  });

  for (const [key, value] of Object.entries(updates)) {
    lines.push(`${key}=${value}`);
  }

  writeFileSync(".env.fb.test", lines.filter(Boolean).join("\n") + "\n");
}

async function main() {
  const appId = process.env.FACEBOOK_APP_ID?.trim() ?? "";
  const appSecret = process.env.FACEBOOK_APP_SECRET?.trim() ?? "";
  const userToken = process.env.FACEBOOK_USER_TOKEN?.trim() ?? "";

  if (!appId || !appSecret) {
    throw new Error(
      "Ustaw FACEBOOK_APP_ID i FACEBOOK_APP_SECRET w .env.fb.test (Meta → App → Settings → Basic)",
    );
  }
  if (!userToken) {
    throw new Error(
      "Ustaw FACEBOOK_USER_TOKEN — krótkotrwały user token z Graph API Explorer (pages_manage_posts, pages_show_list)",
    );
  }

  console.log("App ID:", appId);
  await debugTokenSummary(userToken, "User token (input)");

  const exchangeUrl =
    `https://graph.facebook.com/${GRAPH}/oauth/access_token` +
    `?grant_type=fb_exchange_token` +
    `&client_id=${encodeURIComponent(appId)}` +
    `&client_secret=${encodeURIComponent(appSecret)}` +
    `&fb_exchange_token=${encodeURIComponent(userToken)}`;

  const exchanged = await fetchJson<TokenPayload>(exchangeUrl);
  if (exchanged.error || !exchanged.access_token) {
    throw new Error(
      exchanged.error?.message ?? "Nie udało się wymienić na long-lived user token",
    );
  }

  const longLivedUserToken = exchanged.access_token;
  console.log(
    "Long-lived user token OK",
    exchanged.expires_in ? `(~${Math.round(exchanged.expires_in / 86400)} dni)` : "",
  );
  await debugTokenSummary(longLivedUserToken, "User token (long-lived)");

  const accounts = await fetchJson<{
    data?: Array<{ id: string; name: string; access_token: string }>;
    error?: { message?: string };
  }>(
    `https://graph.facebook.com/${GRAPH}/me/accounts?fields=name,id,access_token&access_token=${encodeURIComponent(longLivedUserToken)}`,
  );

  if (accounts.error) throw new Error(accounts.error.message);

  const page = (accounts.data ?? []).find((p) => p.id === WSS_PAGE_ID);
  if (!page?.access_token) {
    console.error(
      "Dostępne strony:",
      (accounts.data ?? []).map((p) => `${p.name} (${p.id})`).join(", "),
    );
    throw new Error(`Brak page token dla Web Space Station (${WSS_PAGE_ID})`);
  }

  const pageToken = page.access_token;
  await debugTokenSummary(pageToken, "Page token (WSS)");

  const me = await fetchJson<{ id?: string; name?: string }>(
    `https://graph.facebook.com/${GRAPH}/me?fields=id,name&access_token=${encodeURIComponent(pageToken)}`,
  );
  console.log("Page token resolves to:", me.name, me.id);

  upsertEnvFbTest({
    FACEBOOK_AUTO_POST: "true",
    FACEBOOK_PAGE_ID: WSS_PAGE_ID,
    FACEBOOK_GRAPH_VERSION: GRAPH,
    FACEBOOK_PAGE_ACCESS_TOKEN: pageToken,
  });

  console.log("\n✓ Zaktualizowano .env.fb.test");
  console.log("  Następny krok: .\\scripts\\sync-fb-env-vercel.ps1");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
