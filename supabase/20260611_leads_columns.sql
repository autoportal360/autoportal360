-- ── Leads table: add enrichment columns ────────────────────────────────────
-- Safe to re-run (all statements are idempotent).

alter table leads add column if not exists model_id     uuid references models(id);
alter table leads add column if not exists brand_name   text;
alter table leads add column if not exists model_name   text;
alter table leads add column if not exists variant_name text;
alter table leads add column if not exists source_page  text;
alter table leads add column if not exists message      text;

-- Ensure RLS does not block API inserts (anon key fallback path)
alter table leads disable row level security;

-- ── Verify: run this SELECT to confirm columns exist ────────────────────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'leads'
-- ORDER BY ordinal_position;
