CREATE TABLE IF NOT EXISTS dealer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  brand_slug TEXT,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT NOT NULL,
  locality TEXT,
  pincode TEXT,
  vehicle_types TEXT[] NOT NULL DEFAULT ARRAY['cars'],
  website TEXT,
  google_maps_url TEXT,
  working_hours TEXT DEFAULT 'Mon-Sat: 9 AM – 7 PM',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dealer_requests_status ON dealer_requests(status);
CREATE INDEX IF NOT EXISTS idx_dealer_requests_created ON dealer_requests(created_at DESC);

CREATE OR REPLACE FUNCTION update_dealer_requests_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS dealer_requests_updated_at ON dealer_requests;
CREATE TRIGGER dealer_requests_updated_at
  BEFORE UPDATE ON dealer_requests
  FOR EACH ROW EXECUTE FUNCTION update_dealer_requests_updated_at();

ALTER TABLE dealer_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all_dealer_requests" ON dealer_requests FOR ALL USING (auth.role() = 'service_role');
-- Public can only INSERT (submit requests), not read others' submissions
CREATE POLICY "public_insert_dealer_requests" ON dealer_requests FOR INSERT WITH CHECK (true);
