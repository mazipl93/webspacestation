/**
 * Fetch WSS page token from user token in .env.fb.test (updates file).
 * Usage: npx tsx scripts/fetch-wss-page-token.ts
 */
import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";

config({ path: ".env.fb.test" });
config();

const WSS_PAGE_ID = "915447778328996";
const userToken = process.env.FACEBOOK_USER_TOKEN?.trim() || process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
if (!userToken) throw new Error("Brak tokena w .env.fb.test");

async function main() {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=name,id,access_token&access_token=${encodeURIComponent(userToken)}`,
  );
  const data = (await res.json()) as {
    data?: Array<{ id: string; name: string; access_token: string }>;
    error?: { message: string };
  };
  if (data.error) throw new Error(data.error.message);

  const page = (data.data ?? []).find((p) => p.id === WSS_PAGE_ID);
  if (!page?.access_token) {
    console.error(
      "Dostępne strony:",
      (data.data ?? []).map((p) => `${p.name} (${p.id})`).join(", "),
    );
    throw new Error(`Brak tokena dla Web Space Station (${WSS_PAGE_ID})`);
  }

  const check = await fetch(
    `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${encodeURIComponent(page.access_token)}`,
  );
  const checkData = (await check.json()) as { id?: string; name?: string };
  console.log("Page token resolves to:", checkData.name, checkData.id);

  const perms = await fetch(
    `https://graph.facebook.com/v21.0/me/permissions?access_token=${encodeURIComponent(page.access_token)}`,
  );
  const permsData = (await perms.json()) as { data?: Array<{ permission: string; status: string }> };
  const granted = (permsData.data ?? [])
    .filter((p) => p.status === "granted")
    .map((p) => p.permission);
  console.log("Granted permissions:", granted.join(", "));
  console.log("Has pages_manage_posts:", granted.includes("pages_manage_posts"));

  let content = "";
  try {
    content = readFileSync(".env.fb.test", "utf8");
  } catch {
    content = "";
  }
  const lines = content
    .split("\n")
    .filter((l) => !l.startsWith("FACEBOOK_PAGE_ACCESS_TOKEN="));
  lines.push(`FACEBOOK_PAGE_ACCESS_TOKEN=${page.access_token}`);
  if (!lines.some((l) => l.startsWith("FACEBOOK_AUTO_POST="))) {
    lines.push("FACEBOOK_AUTO_POST=true");
  }
  if (!lines.some((l) => l.startsWith("FACEBOOK_PAGE_ID="))) {
    lines.push(`FACEBOOK_PAGE_ID=${WSS_PAGE_ID}`);
  }
  if (!lines.some((l) => l.startsWith("FACEBOOK_GRAPH_VERSION="))) {
    lines.push("FACEBOOK_GRAPH_VERSION=v21.0");
  }
  writeFileSync(".env.fb.test", lines.filter(Boolean).join("\n") + "\n");
  console.log("Updated .env.fb.test with WSS page token");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
