/**
 * Debug FACEBOOK_PAGE_ACCESS_TOKEN — app_id, validity (no secrets printed).
 * Usage: npx tsx scripts/debug-fb-app.ts
 */
import { config } from "dotenv";

config({ path: ".env.fb.test" });
config();

async function main() {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim() ?? "";
  if (!token) throw new Error("Brak FACEBOOK_PAGE_ACCESS_TOKEN");

  const res = await fetch(
    `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`,
  );
  const data = (await res.json()) as {
    data?: {
      app_id?: string;
      type?: string;
      is_valid?: boolean;
      profile_id?: string;
      scopes?: string[];
      expires_at?: number;
    };
    error?: { message?: string };
  };

  if (data.error) throw new Error(data.error.message);

  const info = data.data ?? {};
  console.log("app_id:", info.app_id);
  console.log("valid:", info.is_valid);
  console.log("type:", info.type);
  console.log("profile_id:", info.profile_id);
  console.log("scopes:", (info.scopes ?? []).join(", "));
  console.log(
    "expires:",
    info.expires_at === 0 ? "never" : new Date((info.expires_at ?? 0) * 1000).toISOString(),
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
