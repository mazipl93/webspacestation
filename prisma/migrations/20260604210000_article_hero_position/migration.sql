-- Homepage hero slider slot (0 = off, 1–4 = slide order ASC)
ALTER TABLE "articles" ADD COLUMN "heroPosition" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "articles_heroPosition_idx" ON "articles"("heroPosition");
