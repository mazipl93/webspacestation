-- Default role for new Prisma users (separate migration — PG requires enum values committed first)
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'::"Role";
