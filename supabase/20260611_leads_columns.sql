-- Add new columns to leads table for richer lead capture
alter table leads add column if not exists model_id     uuid references models(id);
alter table leads add column if not exists brand_name   text;
alter table leads add column if not exists model_name   text;
alter table leads add column if not exists variant_name text;
alter table leads add column if not exists source_page  text;
alter table leads add column if not exists message      text;
