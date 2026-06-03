-- ─────────────────────────────────────────────────────────────────────────────
-- WSS — Article likes (LEGACY — anonymous global counter)
--
-- ⚠️  SUPERSEDED by supabase/user_article_likes.sql (per-user likes + toggle).
--     Keep until Krok 2 UX migrates LikeButton off increment_like.
--     Popularne reads article_like_counts first (lib/likes/article-like-counts.ts).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Counter table — one row per article slug.
create table if not exists public.article_likes (
  slug       text primary key,
  count      integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 2. Row Level Security: reads open to everyone (anon + authenticated).
alter table public.article_likes enable row level security;

drop policy if exists "article_likes_select_all" on public.article_likes;
create policy "article_likes_select_all"
  on public.article_likes
  for select
  to anon, authenticated
  using (true);

-- Reads need a table grant in addition to the RLS policy.
grant select on public.article_likes to anon, authenticated;

-- 3. Atomic increment via a SECURITY DEFINER function. Writes go through this
--    function only (no direct INSERT/UPDATE grant for anon), keeping the table
--    tamper-resistant while still letting logged-out users like.
create or replace function public.increment_like(slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into public.article_likes as al (slug, count, updated_at)
    values (increment_like.slug, 1, now())
  on conflict (slug)
    do update set count = al.count + 1, updated_at = now()
  returning al.count into new_count;
  return new_count;
end;
$$;

-- Allow anonymous + authenticated clients to call the RPC.
grant execute on function public.increment_like(text) to anon, authenticated;
