-- WSS News Engine v1: external source metadata for RSS-ingested articles
ALTER TABLE "articles" ADD COLUMN "source" TEXT;
ALTER TABLE "articles" ADD COLUMN "originalUrl" TEXT;

CREATE UNIQUE INDEX "articles_originalUrl_key" ON "articles"("originalUrl");
CREATE INDEX "articles_source_idx" ON "articles"("source");
