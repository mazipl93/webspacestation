-- Share-card copy for Facebook OG image (editor-controlled, length-limited in CMS).
ALTER TABLE "articles" ADD COLUMN "socialCardTitle" TEXT;
ALTER TABLE "articles" ADD COLUMN "socialCardHook" TEXT;
