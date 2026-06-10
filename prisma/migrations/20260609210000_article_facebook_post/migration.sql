-- Track Facebook Page posts for idempotent auto-publish on first PUBLISH.
ALTER TABLE "articles" ADD COLUMN "facebookPostId" TEXT;
ALTER TABLE "articles" ADD COLUMN "facebookPostedAt" TIMESTAMP(3);
