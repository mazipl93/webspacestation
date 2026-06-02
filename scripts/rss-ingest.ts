/**
 * Manual News Engine run (local / CI).
 * Usage: npm run rss:ingest
 */
import { config } from "dotenv";

config();

import { runNewsEngineIngest } from "../lib/rss/ingest";

runNewsEngineIngest()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.errors.length > 0 && result.created === 0 ? 1 : 0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
