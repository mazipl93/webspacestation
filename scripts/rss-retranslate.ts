/**
 * @deprecated Use `npm run rss:process` (DRAFT → OpenAI → REVIEW only).
 * This script no longer mutates REVIEW/PUBLISHED rows.
 */
import { config } from "dotenv";

config();

console.error(
  "rss:retranslate is disabled. Use: npm run rss:process (OpenAI enrichment for unprocessed DRAFT only)."
);
process.exit(1);
