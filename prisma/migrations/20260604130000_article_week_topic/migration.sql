-- Temat tygodnia: ręczny przełącznik w CMS (obok „Wyróżniony”).
ALTER TABLE "Article" ADD COLUMN "weekTopic" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Article_weekTopic_idx" ON "Article"("weekTopic");
