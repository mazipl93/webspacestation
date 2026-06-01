-- ─────────────────────────────────────────────────────────────────────────────
-- WSS — Avatar storage (profile pictures)
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Creates a public `avatars` storage bucket. Anyone can READ avatars (so they
-- render on the public site), but a user may only write/update/delete files
-- inside their OWN folder: avatars/<auth.uid()>/...
-- The app uploads to `${userId}/avatar-<timestamp>.<ext>` and stores the public
-- URL in user_metadata.avatar_url.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Public bucket (idempotent).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- 2. Policies on storage.objects scoped to this bucket.

-- Public read.
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'avatars');

-- Owner can upload into their own folder (first path segment = their user id).
drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can overwrite their own files (upsert).
drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can delete their own files.
drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
