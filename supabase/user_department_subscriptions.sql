-- ─────────────────────────────────────────────────────────────────────────────
-- WSS — Ulubione działy (powiadomienia o nowych artykułach w kategorii)
-- Run in Supabase SQL Editor AFTER auth is enabled.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.user_department_subscriptions (
  user_id        uuid not null references auth.users (id) on delete cascade,
  category_slug  text not null,
  created_at     timestamptz not null default now(),
  primary key (user_id, category_slug),
  constraint user_department_subscriptions_slug_len
    check (char_length(category_slug) between 2 and 64)
);

create index if not exists user_department_subscriptions_user_idx
  on public.user_department_subscriptions (user_id);

alter table public.user_department_subscriptions enable row level security;

drop policy if exists "dept_sub_select_own" on public.user_department_subscriptions;
create policy "dept_sub_select_own"
  on public.user_department_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "dept_sub_insert_own" on public.user_department_subscriptions;
create policy "dept_sub_insert_own"
  on public.user_department_subscriptions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "dept_sub_delete_own" on public.user_department_subscriptions;
create policy "dept_sub_delete_own"
  on public.user_department_subscriptions
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, delete on public.user_department_subscriptions to authenticated;

-- Lista slugów obserwowanych działów (authenticated)
create or replace function public.my_department_subscription_slugs()
returns text[]
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(array_agg(category_slug order by created_at desc), '{}'::text[])
  from public.user_department_subscriptions
  where user_id = auth.uid();
$$;

grant execute on function public.my_department_subscription_slugs() to authenticated;

-- Toggle — zwraca { subscribed, slugs }
create or replace function public.toggle_department_subscription(p_category_slug text)
returns json
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  clean_slug text := nullif(trim(lower(p_category_slug)), '');
  did_subscribe boolean;
  all_slugs text[];
begin
  if uid is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if clean_slug is null then
    raise exception 'Invalid category slug' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.user_department_subscriptions
    where user_id = uid and category_slug = clean_slug
  ) then
    delete from public.user_department_subscriptions
    where user_id = uid and category_slug = clean_slug;
    did_subscribe := false;
  else
    insert into public.user_department_subscriptions (user_id, category_slug)
    values (uid, clean_slug);
    did_subscribe := true;
  end if;

  select coalesce(array_agg(category_slug order by created_at desc), '{}'::text[])
  into all_slugs
  from public.user_department_subscriptions
  where user_id = uid;

  return json_build_object('subscribed', did_subscribe, 'slugs', all_slugs);
end;
$$;

grant execute on function public.toggle_department_subscription(text) to authenticated;
