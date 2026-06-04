-- ─────────────────────────────────────────────────────────────────────────────
-- WSS — Article comments (STEP 3 — replaces localStorage in Comments.tsx)
-- Run in Supabase SQL Editor AFTER auth is enabled.
--
--   • article_comments — per-article thread (slug + user + body snapshot)
--   • RLS: public read visible; authenticated insert/update/delete own rows
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.article_comments (
  id                  uuid primary key default gen_random_uuid(),
  article_slug        text not null,
  user_id             uuid not null references auth.users (id) on delete cascade,
  author_name         text not null,
  author_avatar_url   text,
  body                text not null,
  created_at          timestamptz not null default now(),
  edited_at           timestamptz,
  is_hidden           boolean not null default false,
  constraint article_comments_body_len check (char_length(body) between 1 and 4000)
);

create index if not exists article_comments_slug_created_idx
  on public.article_comments (article_slug, created_at desc);

create index if not exists article_comments_user_idx
  on public.article_comments (user_id);

alter table public.article_comments enable row level security;

-- Public read (anon + logged-in) — moderated/hidden rows excluded
drop policy if exists "article_comments_select_visible" on public.article_comments;
create policy "article_comments_select_visible"
  on public.article_comments
  for select
  to anon, authenticated
  using (is_hidden = false);

-- Insert: authenticated only; user_id forced from session
drop policy if exists "article_comments_insert_own" on public.article_comments;
create policy "article_comments_insert_own"
  on public.article_comments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "article_comments_update_own" on public.article_comments;
create policy "article_comments_update_own"
  on public.article_comments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "article_comments_delete_own" on public.article_comments;
create policy "article_comments_delete_own"
  on public.article_comments
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select on public.article_comments to anon, authenticated;
grant insert, update, delete on public.article_comments to authenticated;
