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

-- ── Leads status column ───────────────────────────────────────────────────────
alter table leads add column if not exists
  status text default 'new'
  check (status in ('new','contacted','converted'));

-- ── Ad Campaigns ──────────────────────────────────────────────────────────────
create table if not exists ad_campaigns (
  id                 uuid default gen_random_uuid() primary key,
  zone               text unique not null,
  advertiser         text,
  ad_type            text default 'affiliate' check (
                       ad_type in ('affiliate','oem-banner','adsense','custom')),
  headline           text,
  subline            text,
  cta_text           text,
  destination_url    text,
  banner_image_url   text,
  impression_pixel   text,
  click_tracking_url text,
  custom_html        text,
  start_date         date,
  end_date           date,
  is_active          boolean default true,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table ad_campaigns disable row level security;

-- Seed the 5 zones with current affiliate data
insert into ad_campaigns (zone, advertiser, ad_type, headline, subline, cta_text, destination_url, is_active)
values
  ('hero-billboard', 'Acko Insurance', 'affiliate',
   '🛡️ Car Insurance from ₹2,094/year',
   'Zero depreciation · Instant policy · Cashless garages across India',
   'Get Free Quote →',
   'https://www.acko.com/?utm_source=autoportal360&utm_medium=hero_banner&utm_campaign=car_insurance',
   true),
  ('mid-feed-1', 'Policybazaar', 'affiliate',
   '💰 Compare Car Loans — EMI from ₹1,499/Lakh',
   'SBI · HDFC · ICICI · Axis — Best rates in 2 minutes',
   'Check EMI →',
   'https://www.policybazaar.com/motor-insurance/?utm_source=autoportal360&utm_medium=mid_banner_1',
   true),
  ('mid-feed-2', 'BankBazaar', 'affiliate',
   '🏍️ Two-Wheeler Loan — No Processing Fee',
   'Get bike loan approved in 24 hours · 100+ lender network',
   'Apply Now →',
   'https://www.bankbazaar.com/two-wheeler-loan.html?utm_source=autoportal360&utm_medium=mid_banner_2',
   true),
  ('in-feed-native', 'Acko', 'affiliate',
   '⚡ EV Insurance — Designed for Electric',
   'Covers battery · Charging damage · Roadside assist',
   'Explore →',
   'https://www.acko.com/electric-car-insurance/?utm_source=autoportal360&utm_medium=in_feed_native',
   true),
  ('pre-footer', 'BankBazaar', 'affiliate',
   '🚗 Get Pre-Approved Car Loan in 2 Minutes',
   'No documents needed · Starting 7.9% p.a.',
   'Check Eligibility →',
   'https://www.bankbazaar.com/car-loan.html?utm_source=autoportal360&utm_medium=pre_footer',
   true)
on conflict (zone) do nothing;

-- ── SEO Settings ──────────────────────────────────────────────────────────────
create table if not exists seo_settings (
  id         uuid default gen_random_uuid() primary key,
  key        text unique not null,
  value      text,
  updated_at timestamptz default now()
);
alter table seo_settings disable row level security;

-- Seed default SEO settings
insert into seo_settings (key, value) values
  ('site_name',                'AutoPortal360'),
  ('meta_title_template',      '%s | AutoPortal360'),
  ('default_meta_description', 'India''s trusted automotive portal. Compare cars, bikes, and scooters with prices, specs, variants and EMI calculator.'),
  ('default_og_image_url',     ''),
  ('ga4_id',                   ''),
  ('gtm_id',                   ''),
  ('gsc_verification',         ''),
  ('facebook_pixel_id',        ''),
  ('custom_head_scripts',      ''),
  ('custom_body_scripts',      '')
on conflict (key) do nothing;

-- ── Blog Posts ────────────────────────────────────────────────────────────────
create table if not exists blog_posts (
  id               uuid default gen_random_uuid() primary key,
  title            text not null,
  slug             text unique not null,
  excerpt          text,
  content_html     text,
  cover_image_url  text,
  author           text default 'AutoPortal360',
  tags             text[],
  status           text default 'draft'
                     check (status in ('draft','published')),
  meta_title       text,
  meta_description text,
  published_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
alter table blog_posts disable row level security;
