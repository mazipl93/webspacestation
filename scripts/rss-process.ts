/**
 * AI processing only: DRAFT → REVIEW (no ingest, no publish).
 * Usage: npm run rss:process
 */
import { config } from "dotenv";

config();

import { runRssDraftProcessing } from "../lib/rss/process-drafts";

runRssDraftProcessing()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.failed > 0 && result.processed === 0 ? 1 : 0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
