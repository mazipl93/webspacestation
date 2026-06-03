/**
 * Wyczyść cache artykułów na prod (domyślnie webspacestation.pl).
 * Usage: npm run cache:revalidate
 * Opcjonalnie: SITE_URL=https://... w .env
 */
import { config } from "dotenv";

config();

import { revalidateArticlesViaHttp } from "../lib/cache/revalidate-articles";

revalidateArticlesViaHttp();
