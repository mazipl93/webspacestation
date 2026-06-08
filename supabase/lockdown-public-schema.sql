-- ─────────────────────────────────────────────────────────────────────────────
-- WSS — Lock down Prisma / server-only tables from Supabase Data API (PostgREST)
--
-- CMS reads/writes go through Prisma (postgres role — bypasses RLS).
-- anon / authenticated must NOT read articles, users, ops cache, etc. via REST.
--
-- Does NOT touch: user_article_likes, article_comments, user_department_subscriptions
-- (those keep their own RLS policies).
-- ─────────────────────────────────────────────────────────────────────────────

alter table if exists public.articles enable row level security;
alter table if exists public.categories enable row level security;
alter table if exists public.users enable row level security;
alter table if exists public.media enable row level security;
alter table if exists public._prisma_migrations enable row level security;
alter table if exists public.ops_cache_entries enable row level security;

revoke all on table public.articles from anon, authenticated;
revoke all on table public.categories from anon, authenticated;
revoke all on table public.users from anon, authenticated;
revoke all on table public.media from anon, authenticated;
revoke all on table public._prisma_migrations from anon, authenticated;
revoke all on table public.ops_cache_entries from anon, authenticated;

-- Explicit deny (belt + suspenders if default grants reappear)
drop policy if exists "prisma_tables_deny_anon" on public.articles;
create policy "prisma_tables_deny_anon"
  on public.articles for all to anon using (false) with check (false);

drop policy if exists "prisma_tables_deny_authenticated" on public.articles;
create policy "prisma_tables_deny_authenticated"
  on public.articles for all to authenticated using (false) with check (false);

drop policy if exists "prisma_tables_deny_anon" on public.categories;
create policy "prisma_tables_deny_anon"
  on public.categories for all to anon using (false) with check (false);

drop policy if exists "prisma_tables_deny_authenticated" on public.categories;
create policy "prisma_tables_deny_authenticated"
  on public.categories for all to authenticated using (false) with check (false);

drop policy if exists "prisma_tables_deny_anon" on public.users;
create policy "prisma_tables_deny_anon"
  on public.users for all to anon using (false) with check (false);

drop policy if exists "prisma_tables_deny_authenticated" on public.users;
create policy "prisma_tables_deny_authenticated"
  on public.users for all to authenticated using (false) with check (false);

drop policy if exists "prisma_tables_deny_anon" on public.media;
create policy "prisma_tables_deny_anon"
  on public.media for all to anon using (false) with check (false);

drop policy if exists "prisma_tables_deny_authenticated" on public.media;
create policy "prisma_tables_deny_authenticated"
  on public.media for all to authenticated using (false) with check (false);

drop policy if exists "prisma_tables_deny_anon" on public._prisma_migrations;
create policy "prisma_tables_deny_anon"
  on public._prisma_migrations for all to anon using (false) with check (false);

drop policy if exists "prisma_tables_deny_authenticated" on public._prisma_migrations;
create policy "prisma_tables_deny_authenticated"
  on public._prisma_migrations for all to authenticated using (false) with check (false);

drop policy if exists "prisma_tables_deny_anon" on public.ops_cache_entries;
create policy "prisma_tables_deny_anon"
  on public.ops_cache_entries for all to anon using (false) with check (false);

drop policy if exists "prisma_tables_deny_authenticated" on public.ops_cache_entries;
create policy "prisma_tables_deny_authenticated"
  on public.ops_cache_entries for all to authenticated using (false) with check (false);
