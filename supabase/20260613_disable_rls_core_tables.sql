-- Disable RLS on core content tables so the anon client (used by admin) can write.
-- All other feature tables already had RLS disabled in admin-setup.sql.
-- Storage uploads use bucket-level policies; table RLS is separate.

alter table brands   disable row level security;
alter table models   disable row level security;
alter table variants disable row level security;
alter table specs    disable row level security;

-- Storage: allow anon (and authenticated) to INSERT / UPDATE / DELETE in the
-- models bucket (used for thumbnails, colour images, and model gallery images).
-- The bucket is already marked public so reads are unrestricted.
insert into storage.buckets (id, name, public)
  values ('models', 'models', true)
  on conflict (id) do nothing;

create policy "models_bucket_insert" on storage.objects
  for insert with check (bucket_id = 'models');

create policy "models_bucket_update" on storage.objects
  for update using (bucket_id = 'models');

create policy "models_bucket_delete" on storage.objects
  for delete using (bucket_id = 'models');
