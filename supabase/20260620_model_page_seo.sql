-- Model page SEO: per-model, per-page-type SEO text + FAQs
-- Run in Supabase SQL Editor after deploying

CREATE TABLE IF NOT EXISTS model_page_seo (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id    UUID    NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  page_type   TEXT    NOT NULL CHECK (page_type IN ('overview','images','colours','variants','specs','mileage','price','faqs')),
  seo_heading TEXT,
  seo_text    TEXT    NOT NULL DEFAULT '',
  faqs        JSONB   NOT NULL DEFAULT '[]',
  is_published BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (model_id, page_type)
);

CREATE INDEX IF NOT EXISTS idx_model_page_seo_model ON model_page_seo(model_id);
CREATE INDEX IF NOT EXISTS idx_model_page_seo_type  ON model_page_seo(page_type);

ALTER TABLE model_page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_model_page_seo"
  ON model_page_seo FOR SELECT USING (is_published = true);

CREATE POLICY "service_all_model_page_seo"
  ON model_page_seo FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION update_model_page_seo_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER model_page_seo_updated_at
  BEFORE UPDATE ON model_page_seo
  FOR EACH ROW EXECUTE FUNCTION update_model_page_seo_updated_at();
