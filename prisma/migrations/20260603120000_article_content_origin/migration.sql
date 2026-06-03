-- CreateEnum
CREATE TYPE "ArticleContentOrigin" AS ENUM ('EDITORIAL', 'RSS', 'AI_DRAFT');

-- AlterTable
ALTER TABLE "articles" ADD COLUMN "contentOrigin" "ArticleContentOrigin" NOT NULL DEFAULT 'EDITORIAL';

-- Backfill: external RSS rows (source + canonical URL)
UPDATE "articles"
SET "contentOrigin" = 'RSS'
WHERE "source" IS NOT NULL
  AND BTRIM("source") <> ''
  AND "originalUrl" IS NOT NULL
  AND BTRIM("originalUrl") <> '';

-- CreateIndex
CREATE INDEX "articles_contentOrigin_idx" ON "articles"("contentOrigin");
