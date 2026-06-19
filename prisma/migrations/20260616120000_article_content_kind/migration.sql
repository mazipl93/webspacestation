-- CreateEnum
CREATE TYPE "ArticleContentKind" AS ENUM ('NEWS', 'ANALYSIS', 'EVERGREEN', 'GUIDE');

-- AlterTable
ALTER TABLE "articles" ADD COLUMN "contentKind" "ArticleContentKind" NOT NULL DEFAULT 'NEWS';

-- CreateIndex
CREATE INDEX "articles_contentKind_idx" ON "articles"("contentKind");

-- Backfill: Nauka department → evergreen (slug match on categories table)
UPDATE "articles" AS a
SET "contentKind" = 'EVERGREEN'
FROM "categories" AS c
WHERE a."categoryId" = c.id
  AND c.slug = 'nauka';
