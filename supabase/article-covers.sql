-- ─────────────────────────────────────────────────────────────────────────────
-- WSS — Article cover images (CMS upload → public CDN URL in coverImage)
-- Run in Supabase SQL Editor (Dashboard → SQL → New query).
--
-- Public read; writes only via API using SUPABASE_SERVICE_ROLE_KEY (sharp→WebP).
-- App path: article-covers/<articleId|drafts>/<timestamp>.webp
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-covers',
  'article-covers',
  true,
  5242880,
  array['image/webp']::text[]
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/webp']::text[];

drop policy if exists "article_covers_public_read" on storage.objects;
create policy "article_covers_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'article-covers');
