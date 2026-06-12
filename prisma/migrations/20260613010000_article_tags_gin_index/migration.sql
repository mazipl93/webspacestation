-- GIN index on articles.tags for fast array containment queries:
-- WHERE tags @> ARRAY['mars'] (tag feed pages)
-- WITHOUT this, Postgres does a full seq-scan on every tag page load.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "articles_tags_gin_idx"
  ON "articles" USING GIN ("tags");
