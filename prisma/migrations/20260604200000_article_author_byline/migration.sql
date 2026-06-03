-- Opcjonalny podpis autora na stronie publicznej (nie to samo co authorId CMS).
ALTER TABLE "articles" ADD COLUMN "authorByline" TEXT;
