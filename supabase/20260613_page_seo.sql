create table if not exists page_seo (
  id               uuid primary key default gen_random_uuid(),
  page_key         text unique not null,
  page_type        text not null default 'custom',
  meta_title       text,
  meta_description text,
  h1               text,
  intro_text       text,
  seo_content      text,
  faqs             jsonb,
  schema_jsonld    text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table page_seo disable row level security;

create index if not exists page_seo_page_key_idx on page_seo(page_key);
create index if not exists page_seo_page_type_idx on page_seo(page_type);
