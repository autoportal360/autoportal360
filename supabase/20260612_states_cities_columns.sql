-- ── Part 1: Add missing columns ──────────────────────────────────────────────
alter table states add column if not exists is_active boolean default true;
alter table cities add column if not exists is_active boolean default true;
alter table cities add column if not exists is_featured boolean default false;
alter table cities add column if not exists population_tier text
  check (population_tier in ('metro','tier1','tier2','tier3')) default 'tier2';

-- Make sure RLS is off for admin operations
alter table states disable row level security;
alter table cities disable row level security;

-- ── Part 2: Seed missing states ───────────────────────────────────────────────
-- (ON CONFLICT assumes unique constraint on slug column)
insert into states (name, slug, rto_percentage, handling_charge, is_active) values
  ('Uttar Pradesh',  'uttar-pradesh',  8,  2500, true),
  ('Gujarat',        'gujarat',        6,  2000, true),
  ('Madhya Pradesh', 'madhya-pradesh', 7,  2000, true),
  ('Bihar',          'bihar',          8,  2500, true),
  ('Tamil Nadu',     'tamil-nadu',     12, 3000, true),
  ('Maharashtra',    'maharashtra',    11, 2500, true),
  ('Punjab',         'punjab',         9,  2000, true),
  ('Haryana',        'haryana',        5,  2000, true),
  ('Jammu & Kashmir','jammu-kashmir',  5,  1500, true)
on conflict (slug) do nothing;

-- ── Part 3: Seed Tier 1 cities ────────────────────────────────────────────────
insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Lucknow',    'lucknow',    id, true,  true, 'tier1' from states where slug = 'uttar-pradesh'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Surat',      'surat',      id, true,  true, 'tier1' from states where slug = 'gujarat'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Indore',     'indore',     id, true,  true, 'tier1' from states where slug = 'madhya-pradesh'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Bhopal',     'bhopal',     id, true,  true, 'tier1' from states where slug = 'madhya-pradesh'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Patna',      'patna',      id, true,  true, 'tier1' from states where slug = 'bihar'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Vadodara',   'vadodara',   id, true,  true, 'tier1' from states where slug = 'gujarat'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Coimbatore', 'coimbatore', id, true,  true, 'tier1' from states where slug = 'tamil-nadu'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Nagpur',     'nagpur',     id, true,  true, 'tier1' from states where slug = 'maharashtra'
on conflict (slug) do nothing;

-- ── Part 4: Seed Tier 2 cities ────────────────────────────────────────────────
insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Ludhiana',   'ludhiana',   id, false, true, 'tier2' from states where slug = 'punjab'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Agra',       'agra',       id, false, true, 'tier2' from states where slug = 'uttar-pradesh'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Nashik',     'nashik',     id, false, true, 'tier2' from states where slug = 'maharashtra'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Faridabad',  'faridabad',  id, false, true, 'tier2' from states where slug = 'haryana'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Meerut',     'meerut',     id, false, true, 'tier2' from states where slug = 'uttar-pradesh'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Rajkot',     'rajkot',     id, false, true, 'tier2' from states where slug = 'gujarat'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Varanasi',   'varanasi',   id, false, true, 'tier2' from states where slug = 'uttar-pradesh'
on conflict (slug) do nothing;

insert into cities (name, slug, state_id, is_featured, is_active, population_tier)
select 'Srinagar',   'srinagar',   id, false, true, 'tier2' from states where slug = 'jammu-kashmir'
on conflict (slug) do nothing;
