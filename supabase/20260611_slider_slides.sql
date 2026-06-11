create table if not exists slider_slides (
  id uuid default gen_random_uuid() primary key,
  type text check (type in ('auto','oem')) default 'auto',
  model_id uuid references models(id) on delete set null,
  oem_advertiser text,
  oem_banner_url text,
  oem_destination_url text,
  oem_impression_pixel text,
  oem_click_tracking_url text,
  oem_headline text,
  oem_subline text,
  oem_cta_text text,
  is_active boolean default true,
  start_date date,
  end_date date,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table slider_slides disable row level security;

-- Public storage bucket for OEM banner images
insert into storage.buckets (id, name, public)
values ('slider', 'slider', true)
on conflict (id) do nothing;

-- Allow authenticated uploads to slider bucket
create policy "Authenticated users can upload to slider"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'slider');

create policy "Anyone can read slider objects"
  on storage.objects for select
  to public
  using (bucket_id = 'slider');

create policy "Authenticated users can update slider objects"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'slider');

create policy "Authenticated users can delete slider objects"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'slider');
