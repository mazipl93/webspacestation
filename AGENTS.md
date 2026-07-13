# AGENTS.md

## Cursor Cloud specific instructions

This is a single Next.js 15 (App Router) full-stack app — "Web Space Station" (WSS), a
Polish space/science news portal + admin CMS. Package manager is **npm**. Standard
commands live in `package.json` scripts; the notes below only cover non-obvious caveats.

### Services & how to run them
- **Web app** (the product): `npm run dev` → http://localhost:3000 (public portal + `/admin` CMS).
- **PostgreSQL** is required for any content to render (data is read via Prisma, not from `data/news.json`).
  A local PostgreSQL 16 cluster is provisioned in the VM snapshot with DB/user/password all `wss`.
  It is NOT guaranteed to auto-start on boot — if the app can't connect, start it with:
  `sudo pg_ctlcluster 16 main start` (or `sudo service postgresql start`).

### Environment
- A local `.env` (gitignored) is already present in the VM snapshot. It points `DATABASE_URL`/
  `DIRECT_URL` at the local Postgres, sets `RSS_TRANSLATE_PL=false` (disables OpenAI), and uses
  **placeholder** `NEXT_PUBLIC_SUPABASE_*` values.
- Supabase Auth uses placeholders, so the public portal works fully, but `/admin` and `/login`
  auth flows will not complete. To exercise auth, set real `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and `SUPABASE_SERVICE_ROLE_KEY` for CMS uploads). Missing
  Supabase env is handled gracefully — `/admin` simply redirects to `/login`.

### Database setup (after schema changes / fresh DB)
- `npm run db:deploy` applies Prisma migrations; `npm run db:seed` loads 7 categories, an admin
  user (`admin@wss.space`, password from `SEED_ADMIN_PASSWORD`, default `wss-admin-2026`), and
  ~26 sample articles. Re-run these only if the local DB is empty/reset.

### Lint / type-check / test
- `npm run lint` (warnings only, exits 0) and `npm run type-check` (clean).
- There is **no aggregate test script** — run targeted suites: `test:articles`, `test:ai`,
  `test:ui`, `test:comments`, `test:auth`, `test:workflow`, `test:content-origin`.
- Known pre-existing failures (NOT environment-related): `lib/articles/schedule-publisher.test.ts`
  expects a `* * * * *` publish-scheduled cron absent from `vercel.json`, and
  `lib/ui/related-articles.test.ts` `pickReadNext` ordering. Do not treat these as setup breakage.
