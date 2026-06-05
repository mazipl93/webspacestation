/**
 * One-off: mark all Supabase Auth users as email-confirmed (admin API).
 * Run: npx tsx scripts/confirm-all-auth-users.ts
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  let confirmed = 0;
  let unbanned = 0;

  for (const user of data.users) {
    const needsConfirm = !user.email_confirmed_at;
    const isBanned =
      user.banned_until && new Date(user.banned_until) > new Date();

    if (!needsConfirm && !isBanned) continue;

    const patch: { email_confirm?: boolean; ban_duration?: string } = {};
    if (needsConfirm) patch.email_confirm = true;
    if (isBanned) patch.ban_duration = "none";

    const { error: updateError } = await admin.auth.admin.updateUserById(
      user.id,
      patch
    );

    if (updateError) {
      console.error(`${user.email}: ${updateError.message}`);
      continue;
    }

    if (needsConfirm) confirmed++;
    if (isBanned) unbanned++;
    console.log(
      `OK ${user.email} (${user.user_metadata?.name ?? "—"})` +
        (needsConfirm ? " [confirmed]" : "") +
        (isBanned ? " [unbanned]" : "")
    );
  }

  console.log(`Done. Confirmed: ${confirmed}, unbanned: ${unbanned}`);
  console.log("---");
  for (const user of data.users) {
    const status = user.email_confirmed_at ? "confirmed" : "UNCONFIRMED";
    const ban = user.banned_until ? `banned until ${user.banned_until}` : "active";
    console.log(`${user.email} | ${user.user_metadata?.name ?? "—"} | ${status} | ${ban}`);
  }
}

main();
