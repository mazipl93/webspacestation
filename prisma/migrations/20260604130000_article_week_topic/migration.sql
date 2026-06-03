-- Temat tygodnia: ręczny przełącznik w CMS (obok „Wyróżniony”).
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "weekTopic" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "articles_weekTopic_idx" ON "articles"("weekTopic");
