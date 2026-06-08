-- Ops snapshots: refreshed by cron, read on user requests (no external API in SSR).

CREATE TABLE "ops_cache_entries" (
    "key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "live" BOOLEAN NOT NULL DEFAULT false,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ops_cache_entries_pkey" PRIMARY KEY ("key")
);
