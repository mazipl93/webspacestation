import { EDITORIAL_TEST_ARTICLES_JUNE_2026 } from "./test-articles-june-2026";
import { EDITORIAL_NEWS_BATCH_JUNE_04_2026 } from "./news-batch-june-04-2026";
import { EDITORIAL_NEWS_BATCH_JUNE_05_2026 } from "./news-batch-june-05-2026";
import type { EditorialDraft } from "./test-articles-june-2026";

/** Wszystkie artykuły redakcyjne czerwiec 2026 (21 szt.). */
export const ALL_EDITORIAL_JUNE_2026: EditorialDraft[] = [
  ...EDITORIAL_TEST_ARTICLES_JUNE_2026,
  ...EDITORIAL_NEWS_BATCH_JUNE_04_2026,
  ...EDITORIAL_NEWS_BATCH_JUNE_05_2026,
];
