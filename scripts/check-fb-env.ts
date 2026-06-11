import { config } from "dotenv";
config({ path: ".env.vercel.production" });
config();
const keys = [
  "FACEBOOK_AUTO_POST",
  "FACEBOOK_PAGE_ID",
  "FACEBOOK_GRAPH_VERSION",
  "FACEBOOK_PAGE_ACCESS_TOKEN",
  "INSTAGRAM_AUTO_POST",
  "INSTAGRAM_BUSINESS_ACCOUNT_ID",
] as const;
for (const k of keys) {
  const v = process.env[k] ?? "";
  console.log(k, k.includes("TOKEN") ? `len=${v.length}` : JSON.stringify(v));
}
