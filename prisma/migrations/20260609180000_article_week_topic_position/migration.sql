ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "weekTopicPosition" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "articles_weekTopicPosition_idx" ON "articles"("weekTopicPosition");
