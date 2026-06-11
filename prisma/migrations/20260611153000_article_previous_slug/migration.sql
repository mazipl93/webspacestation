ALTER TABLE "articles" ADD COLUMN "previousSlug" TEXT;

CREATE INDEX "articles_previousSlug_idx" ON "articles"("previousSlug");
