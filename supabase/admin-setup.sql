-- ── Admin users ──────────────────────────────────────────────────────────────
create table if not exists admin_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);
alter table admin_users disable row level security;

-- ── Brand extra columns ───────────────────────────────────────────────────────
alter table brands add column if not exists meta_title       text;
alter table brands add column if not exists meta_description text;
alter table brands add column if not exists overview_html    text;
alter table brands add column if not exists schema_json      text;

-- ── Brand FAQs ────────────────────────────────────────────────────────────────
create table if not exists brand_faqs (
  id         uuid default gen_random_uuid() primary key,
  brand_id   uuid references brands(id) on delete cascade,
  question   text not null,
  answer     text not null,
  sort_order int  default 0,
  created_at timestamptz default now()
);
alter table brand_faqs disable row level security;

-- ── Model extra column ────────────────────────────────────────────────────────
alter table models add column if not exists schema_json text;

-- ── Model Images ──────────────────────────────────────────────────────────────
create table if not exists model_images (
  id         uuid default gen_random_uuid() primary key,
  model_id   uuid references models(id) on delete cascade,
  url        text not null,
  alt_text   text,
  type       text check (type in ('exterior','interior','colour','detail','road-test')),
  sort_order int  default 0,
  created_at timestamptz default now()
);
alter table model_images disable row level security;

-- ── Model Colours ─────────────────────────────────────────────────────────────
create table if not exists model_colours (
  id           uuid default gen_random_uuid() primary key,
  model_id     uuid references models(id) on delete cascade,
  name         text not null,
  hex_code     text,
  image_url    text,
  is_available boolean default true,
  sort_order   int default 0
);
alter table model_colours disable row level security;

-- ── Model FAQs ────────────────────────────────────────────────────────────────
create table if not exists model_faqs (
  id         uuid default gen_random_uuid() primary key,
  model_id   uuid references models(id) on delete cascade,
  question   text not null,
  answer     text not null,
  sort_order int  default 0
);
alter table model_faqs disable row level security;
