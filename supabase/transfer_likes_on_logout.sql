-- Transfer logged-in user's likes to browser anon_id on logout (unlike without re-login).
create or replace function public.transfer_user_likes_to_anon(p_anon_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  moved integer := 0;
begin
  if uid is null or p_anon_id is null then
    return 0;
  end if;

  insert into public.anon_article_likes (anon_id, slug)
  select p_anon_id, slug
  from public.user_article_likes
  where user_id = uid
  on conflict (anon_id, slug) do nothing;

  delete from public.user_article_likes
  where user_id = uid;

  get diagnostics moved = row_count;
  return moved;
end;
$$;

grant execute on function public.transfer_user_likes_to_anon(uuid) to authenticated;
