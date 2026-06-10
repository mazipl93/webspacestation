/**
 * Verify FACEBOOK_PAGE_ACCESS_TOKEN belongs to Web Space Station (915447778328996).
 * Usage: npx tsx scripts/verify-fb-page-token.ts
 */
import { config } from "dotenv";
config({ path: ".env.fb.test" });
config();

const WSS_PAGE_ID = "915447778328996";
const KREATOR_PAGE_ID = "1149779064875588";

async function main() {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim() ?? "";
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim() ?? "";
  const graphVersion = process.env.FACEBOOK_GRAPH_VERSION?.trim() || "v21.0";

  if (!token) throw new Error("Brak FACEBOOK_PAGE_ACCESS_TOKEN");

  const res = await fetch(
    `https://graph.facebook.com/${graphVersion}/me?fields=id,name&access_token=${encodeURIComponent(token)}`,
  );
  const data = (await res.json()) as {
    id?: string;
    name?: string;
    error?: { message?: string };
  };

  if (data.error) throw new Error(data.error.message);

  const ok =
    data.id === WSS_PAGE_ID &&
    pageId === WSS_PAGE_ID &&
    data.id !== KREATOR_PAGE_ID;

  console.log("Token resolves to:", { id: data.id, name: data.name });
  console.log("FACEBOOK_PAGE_ID env:", pageId || "(empty)");
  console.log(
    ok
      ? "✓ Token and PAGE_ID match Web Space Station"
      : "✗ WRONG PAGE — must be Web Space Station (915447778328996)",
  );

  if (!ok) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
