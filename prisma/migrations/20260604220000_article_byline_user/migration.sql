-- Optional CMS byline linked to team member (name + avatar on public article).
ALTER TABLE "articles" ADD COLUMN "bylineUserId" TEXT;

ALTER TABLE "articles" ADD CONSTRAINT "articles_bylineUserId_fkey"
  FOREIGN KEY ("bylineUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "articles_bylineUserId_idx" ON "articles"("bylineUserId");

-- Cached profile image URL (synced from Supabase when listing byline authors).
ALTER TABLE "users" ADD COLUMN "avatarUrl" TEXT;
