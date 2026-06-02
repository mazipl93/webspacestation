-- WSS News Engine: editorial importance score for ranked homepage
ALTER TABLE "articles" ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "articles_score_idx" ON "articles"("score");
