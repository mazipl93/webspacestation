/**
 * Po rss:retranslate — wyczyść cache Next (gdy dev server działa).
 * Usage: npm run cache:revalidate
 */
import { config } from "dotenv";

config();

import { revalidateArticlesViaHttp } from "../lib/cache/revalidate-articles";

revalidateArticlesViaHttp();
