/**
 * Wypełnia ops_cache_entries (Launch Library, ISS, NASA) — to samo co cron.
 * Usage: npm run ops:refresh
 */
import { config } from "dotenv";

config();

import { refreshOpsCache } from "../lib/ops/refresh-ops-cache";

async function main() {
  const result = await refreshOpsCache();
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
