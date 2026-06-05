-- ─────────────────────────────────────────────────────────────────────────────
-- WSS — Per-user article likes (Krok 1 INFRA)
-- Run in Supabase SQL Editor AFTER auth is enabled.
--
-- Replaces the anonymous counter model (article_likes + increment_like) with:
--   • user_article_likes  — one row per (user, slug)
--   • article_like_counts — public view for Popularne + licznik pod artykułem
--   • toggle_article_like — RPC for logged-in toggle (wired in Krok 2 UX)
--
-- Legacy article_likes.sql can stay until Krok 2 removes increment_like usage.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Per-user likes
create table if not exists public.user_article_likes (
  user_id    uuid not null references auth.users (id) on delete cascade,
  slug       text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, slug)
);

create index if not exists user_article_likes_slug_idx
  on public.user_article_likes (slug);

-- 2. RLS — users manage only their rows; no public read of individual rows
alter table public.user_article_likes enable row level security;

drop policy if exists "user_article_likes_select_own" on public.user_article_likes;
create policy "user_article_likes_select_own"
  on public.user_article_likes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_article_likes_insert_own" on public.user_article_likes;
create policy "user_article_likes_insert_own"
  on public.user_article_likes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_article_likes_delete_own" on public.user_article_likes;
create policy "user_article_likes_delete_own"
  on public.user_article_likes
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, delete on public.user_article_likes to authenticated;

-- 3. Public aggregate — security_invoker=false so RLS on base table does not hide other users' likes
drop view if exists public.article_like_counts;

create view public.article_like_counts
with (security_invoker = false)
as
select
  slug,
  count(*)::integer as count
from public.user_article_likes
group by slug;

grant select on public.article_like_counts to anon, authenticated;

-- 3b. Single-slug count (client fallback; security definer = true global count)
create or replace function public.get_article_like_count(p_slug text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.user_article_likes
  where slug = nullif(trim(p_slug), '');
$$;

grant execute on function public.get_article_like_count(text) to anon, authenticated;

-- 4. Toggle like (authenticated only) — Krok 2 UX calls this RPC
create or replace function public.toggle_article_like(p_slug text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  did_like boolean;
  new_count integer;
  clean_slug text := nullif(trim(p_slug), '');
begin
  if uid is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if clean_slug is null then
    raise exception 'Invalid slug'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.user_article_likes
    where user_id = uid and slug = clean_slug
  ) then
    delete from public.user_article_likes
    where user_id = uid and slug = clean_slug;
    did_like := false;
  else
    insert into public.user_article_likes (user_id, slug)
    values (uid, clean_slug);
    did_like := true;
  end if;

  select count(*)::integer
  into new_count
  from public.user_article_likes
  where slug = clean_slug;

  return json_build_object(
    'liked', did_like,
    'count', coalesce(new_count, 0),
    'slug', clean_slug
  );
end;
$$;

grant execute on function public.toggle_article_like(text) to authenticated;

-- 5. Optional: list current user's liked slugs (profile — Krok 2)
create or replace function public.my_liked_article_slugs()
returns setof text
language sql
stable
security invoker
set search_path = public
as $$
  select slug
  from public.user_article_likes
  where user_id = auth.uid()
  order by created_at desc;
$$;

grant execute on function public.my_liked_article_slugs() to authenticated;
