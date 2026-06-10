-- Per-account liked check for article UI (authenticated only).
create or replace function public.user_article_liked(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_article_likes
    where user_id = auth.uid()
      and slug = nullif(trim(p_slug), '')
  );
$$;

grant execute on function public.user_article_liked(text) to authenticated;
