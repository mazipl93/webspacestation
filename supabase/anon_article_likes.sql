-- ─────────────────────────────────────────────────────────────────────────────
-- WSS — Anonymous article likes (cookie anon_id)
-- Run in Supabase SQL Editor AFTER user_article_likes.sql
--
-- Lets visitors like without an account; counts merge with logged-in likes.
-- Client: cookie wss_anon_like_id (UUID) + RPC toggle_anon_article_like
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Per-visitor likes (browser cookie UUID — not auth.users)
create table if not exists public.anon_article_likes (
  anon_id    uuid not null,
  slug       text not null,
  created_at timestamptz not null default now(),
  primary key (anon_id, slug)
);

create index if not exists anon_article_likes_slug_idx
  on public.anon_article_likes (slug);

alter table public.anon_article_likes enable row level security;
-- No policies — writes only via SECURITY DEFINER RPCs.

-- 2. Unified public counts (registered + anonymous)
drop view if exists public.article_like_counts;

create view public.article_like_counts
with (security_invoker = false)
as
select
  slug,
  sum(c)::integer as count
from (
  select slug, count(*)::bigint as c
  from public.user_article_likes
  group by slug
  union all
  select slug, count(*)::bigint as c
  from public.anon_article_likes
  group by slug
) combined
group by slug;

grant select on public.article_like_counts to anon, authenticated;

-- 3. Total count for one slug
create or replace function public.get_article_like_count(p_slug text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select (
    coalesce((
      select count(*)::integer
      from public.user_article_likes
      where slug = nullif(trim(p_slug), '')
    ), 0)
    + coalesce((
      select count(*)::integer
      from public.anon_article_likes
      where slug = nullif(trim(p_slug), '')
    ), 0)
  );
$$;

grant execute on function public.get_article_like_count(text) to anon, authenticated;

-- 4. Logged-in toggle — return unified count
create or replace function public.toggle_article_like(p_slug text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  did_like boolean;
  clean_slug text := nullif(trim(p_slug), '');
  new_count integer;
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
    select 1 from public.user_article_likes
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

  new_count := public.get_article_like_count(clean_slug);

  return json_build_object(
    'liked', did_like,
    'count', coalesce(new_count, 0),
    'slug', clean_slug
  );
end;
$$;

grant execute on function public.toggle_article_like(text) to authenticated;

-- 5. Anonymous toggle (no login)
create or replace function public.toggle_anon_article_like(
  p_slug text,
  p_anon_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  did_like boolean;
  clean_slug text := nullif(trim(p_slug), '');
  new_count integer;
begin
  if p_anon_id is null then
    raise exception 'Invalid anon id'
      using errcode = '22023';
  end if;

  if clean_slug is null then
    raise exception 'Invalid slug'
      using errcode = '22023';
  end if;

  if exists (
    select 1 from public.anon_article_likes
    where anon_id = p_anon_id and slug = clean_slug
  ) then
    delete from public.anon_article_likes
    where anon_id = p_anon_id and slug = clean_slug;
    did_like := false;
  else
    insert into public.anon_article_likes (anon_id, slug)
    values (p_anon_id, clean_slug);
    did_like := true;
  end if;

  new_count := public.get_article_like_count(clean_slug);

  return json_build_object(
    'liked', did_like,
    'count', coalesce(new_count, 0),
    'slug', clean_slug
  );
end;
$$;

grant execute on function public.toggle_anon_article_like(text, uuid)
  to anon, authenticated;

-- 6. Check if this browser already liked (for UI state)
create or replace function public.anon_article_liked(
  p_slug text,
  p_anon_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.anon_article_likes
    where anon_id = p_anon_id
      and slug = nullif(trim(p_slug), '')
  );
$$;

grant execute on function public.anon_article_liked(text, uuid)
  to anon, authenticated;

-- 7. On login — move anon likes to user account (no double count)
create or replace function public.merge_anon_likes(p_anon_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  merged integer := 0;
begin
  if uid is null or p_anon_id is null then
    return 0;
  end if;

  insert into public.user_article_likes (user_id, slug)
  select uid, a.slug
  from public.anon_article_likes a
  where a.anon_id = p_anon_id
  on conflict (user_id, slug) do nothing;

  get diagnostics merged = row_count;

  delete from public.anon_article_likes
  where anon_id = p_anon_id;

  return merged;
end;
$$;

grant execute on function public.merge_anon_likes(uuid) to authenticated;
