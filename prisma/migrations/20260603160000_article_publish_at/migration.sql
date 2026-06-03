-- Scheduled publish time (status SCHEDULED); null when not scheduled or after publish.
ALTER TABLE "articles" ADD COLUMN "publishAt" TIMESTAMP(3);

CREATE INDEX "articles_status_publish_at_idx" ON "articles"("status", "publishAt");
