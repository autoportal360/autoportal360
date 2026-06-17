-- ============================================================
-- SECURITY FIX: Enable RLS on all public tables
-- Triggered by Supabase security alert (12 Jun 2026)
--
-- Corrections vs original request:
--   ads          → ad_campaigns  (actual table name)
--   slider       → slider_slides (actual table name)
--   seo_pages    → page_seo      (actual table name)
--   pages        → does not exist in this schema (skipped)
--   comparisons  → does not exist in this schema (skipped)
--   Added missing: brand_faqs, model_images, model_colours,
--                  model_faqs, seo_settings
--   dealers / dealer_requests / brand_seo_content /
--   brand_page_seo / static_pages already have RLS enabled —
--   included here only to reconcile policies.
-- ============================================================

-- ── Step 1: Enable RLS (safe to run even if already enabled) ──────────────

ALTER TABLE IF EXISTS brands          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS models          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS variants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS specs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS states          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS brand_faqs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS model_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS model_colours   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS model_faqs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ad_campaigns    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS seo_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blog_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS slider_slides   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS page_seo        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dealers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dealer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS brand_seo_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS brand_page_seo  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS static_pages    ENABLE ROW LEVEL SECURITY;

-- ── Step 2: Public read policies (anon SELECT on published/active data) ───

-- Core catalogue tables: public read all rows
DROP POLICY IF EXISTS "public_read_brands"         ON brands;
CREATE POLICY "public_read_brands"         ON brands         FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_models"         ON models;
CREATE POLICY "public_read_models"         ON models         FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_variants"       ON variants;
CREATE POLICY "public_read_variants"       ON variants       FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_specs"          ON specs;
CREATE POLICY "public_read_specs"          ON specs          FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_states"         ON states;
CREATE POLICY "public_read_states"         ON states         FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_cities"         ON cities;
CREATE POLICY "public_read_cities"         ON cities         FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_brand_faqs"     ON brand_faqs;
CREATE POLICY "public_read_brand_faqs"     ON brand_faqs     FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_model_images"   ON model_images;
CREATE POLICY "public_read_model_images"   ON model_images   FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_model_colours"  ON model_colours;
CREATE POLICY "public_read_model_colours"  ON model_colours  FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_model_faqs"     ON model_faqs;
CREATE POLICY "public_read_model_faqs"     ON model_faqs     FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_page_seo"       ON page_seo;
CREATE POLICY "public_read_page_seo"       ON page_seo       FOR SELECT USING (true);

-- Filtered public reads (only active/published rows)

DROP POLICY IF EXISTS "public_read_slider_slides"  ON slider_slides;
CREATE POLICY "public_read_slider_slides"  ON slider_slides  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "public_read_blog_posts"     ON blog_posts;
CREATE POLICY "public_read_blog_posts"     ON blog_posts     FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "public_read_ad_campaigns"   ON ad_campaigns;
CREATE POLICY "public_read_ad_campaigns"   ON ad_campaigns   FOR SELECT USING (is_active = true);

-- Reconcile policies on tables that already had RLS enabled
DROP POLICY IF EXISTS "public_read_published"      ON brand_seo_content;
CREATE POLICY "public_read_published"      ON brand_seo_content FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "public_read_brand_page_seo" ON brand_page_seo;
CREATE POLICY "public_read_brand_page_seo" ON brand_page_seo  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "public_read_static_pages"   ON static_pages;
CREATE POLICY "public_read_static_pages"   ON static_pages    FOR SELECT USING (is_published = true);

-- Dealers: active records only (existing policy kept as-is via reconcile below)
DROP POLICY IF EXISTS "Public read active dealers"  ON dealers;
CREATE POLICY "Public read active dealers"  ON dealers  FOR SELECT USING (is_active = true);

-- leads: public INSERT only (no read)
DROP POLICY IF EXISTS "public_insert_leads"        ON leads;
CREATE POLICY "public_insert_leads"        ON leads          FOR INSERT WITH CHECK (true);

-- dealer_requests: public INSERT only (submit form), no read of others
DROP POLICY IF EXISTS "public_insert_dealer_requests" ON dealer_requests;
CREATE POLICY "public_insert_dealer_requests" ON dealer_requests FOR INSERT WITH CHECK (true);

-- admin_users: no public access at all (service_role only via Step 3)
-- seo_settings: no public access at all (service_role only via Step 3)

-- ── Step 3: Service role full access on every table ────────────────────────
-- Admin API routes use the service_role key, which must bypass RLS or have
-- an explicit FOR ALL policy. We create one uniformly named policy per table.

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'brands', 'models', 'variants', 'specs', 'states', 'cities',
    'leads', 'admin_users', 'brand_faqs', 'model_images', 'model_colours',
    'model_faqs', 'ad_campaigns', 'seo_settings', 'blog_posts',
    'slider_slides', 'page_seo',
    'dealers', 'dealer_requests', 'brand_seo_content',
    'brand_page_seo', 'static_pages'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "service_role_full_%s" ON %I',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY "service_role_full_%s" ON %I'
      ' FOR ALL USING (auth.role() = ''service_role'')'
      ' WITH CHECK (auth.role() = ''service_role'')',
      tbl, tbl
    );
  END LOOP;
END;
$$;
