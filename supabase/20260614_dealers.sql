-- Dealers table

CREATE TABLE IF NOT EXISTS dealers (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  brand_slug      TEXT NOT NULL,
  brand_name      TEXT NOT NULL,
  city            TEXT NOT NULL,
  city_slug       TEXT NOT NULL,
  state           TEXT NOT NULL,
  address         TEXT,
  locality        TEXT,
  pincode         TEXT,
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  google_maps_url TEXT,
  vehicle_types   TEXT[] DEFAULT ARRAY['cars'],
  is_authorized   BOOLEAN DEFAULT TRUE,
  is_active       BOOLEAN DEFAULT TRUE,
  working_hours   TEXT DEFAULT '9:00 AM – 7:00 PM',
  rating          DECIMAL(2,1),
  review_count    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS dealers_city_slug_idx    ON dealers(city_slug);
CREATE INDEX IF NOT EXISTS dealers_brand_slug_idx   ON dealers(brand_slug);
CREATE INDEX IF NOT EXISTS dealers_city_brand_idx   ON dealers(city_slug, brand_slug);
CREATE INDEX IF NOT EXISTS dealers_is_active_idx    ON dealers(is_active);
CREATE INDEX IF NOT EXISTS dealers_vehicle_types_idx ON dealers USING GIN(vehicle_types);
CREATE INDEX IF NOT EXISTS dealers_fts_idx ON dealers USING GIN(
  to_tsvector('english',
    name || ' ' || city || ' ' || brand_name || ' ' || COALESCE(locality, '')
  )
);

-- RLS
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active dealers"
  ON dealers FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Service role full access"
  ON dealers FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_dealers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW EXECUTE FUNCTION update_dealers_updated_at();

-- ── Seed: 28 dealers across 8 cities ─────────────────────────────────────────

INSERT INTO dealers
  (name, slug, brand_slug, brand_name, city, city_slug, state, address, locality, pincode, phone, vehicle_types, is_authorized, rating, review_count)
VALUES
  -- Delhi (5)
  ('Tata Motors Delhi North', 'tata-motors-delhi-north', 'tata', 'Tata', 'Delhi', 'delhi', 'Delhi',
   'Plot 12, Wazirpur Industrial Area', 'Wazirpur', '110052', '011-12345678',
   ARRAY['cars'], TRUE, 4.2, 312),

  ('Tata Motors Delhi South', 'tata-motors-delhi-south', 'tata', 'Tata', 'Delhi', 'delhi', 'Delhi',
   'A-45, Okhla Phase 1', 'Okhla', '110020', '011-87654321',
   ARRAY['cars'], TRUE, 4.4, 289),

  ('Maruti Suzuki Arena Delhi', 'maruti-suzuki-arena-delhi', 'maruti-suzuki', 'Maruti Suzuki', 'Delhi', 'delhi', 'Delhi',
   'NH-8, Mahipalpur', 'Mahipalpur', '110037', '011-23456789',
   ARRAY['cars'], TRUE, 4.1, 521),

  ('Hyundai Showroom Delhi', 'hyundai-showroom-delhi', 'hyundai', 'Hyundai', 'Delhi', 'delhi', 'Delhi',
   '14, Connaught Place', 'Connaught Place', '110001', '011-34567890',
   ARRAY['cars'], TRUE, 4.3, 445),

  ('Mahindra First Choice Delhi', 'mahindra-first-choice-delhi', 'mahindra', 'Mahindra', 'Delhi', 'delhi', 'Delhi',
   '56, Janpath Road', 'Janpath', '110001', '011-45678901',
   ARRAY['cars'], TRUE, 4.0, 198),

  -- Mumbai (3)
  ('Honda Cars Mumbai Andheri', 'honda-cars-mumbai-andheri', 'honda', 'Honda', 'Mumbai', 'mumbai', 'Maharashtra',
   'Andheri Kurla Road', 'Andheri East', '400069', '022-12345678',
   ARRAY['cars'], TRUE, 4.5, 632),

  ('Tata Motors Mumbai', 'tata-motors-mumbai', 'tata', 'Tata', 'Mumbai', 'mumbai', 'Maharashtra',
   'Eastern Express Highway', 'Chembur', '400071', '022-87654321',
   ARRAY['cars'], TRUE, 4.2, 287),

  ('Kia Showroom Mumbai', 'kia-showroom-mumbai', 'kia', 'Kia', 'Mumbai', 'mumbai', 'Maharashtra',
   'LBS Marg, Kurla West', 'Kurla', '400070', '022-23456789',
   ARRAY['cars'], TRUE, 4.6, 415),

  -- Bengaluru (4)
  ('Maruti Suzuki Bengaluru', 'maruti-suzuki-bengaluru', 'maruti-suzuki', 'Maruti Suzuki', 'Bengaluru', 'bengaluru', 'Karnataka',
   'Hosur Road, Electronic City', 'Electronic City', '560100', '080-12345678',
   ARRAY['cars'], TRUE, 4.3, 487),

  ('Bajaj Auto Bengaluru', 'bajaj-auto-bengaluru', 'bajaj', 'Bajaj', 'Bengaluru', 'bengaluru', 'Karnataka',
   'Bannerghatta Road', 'JP Nagar', '560078', '080-87654321',
   ARRAY['bikes', 'scooters'], TRUE, 4.1, 234),

  ('Honda 2W Bengaluru', 'honda-2w-bengaluru', 'honda-bike', 'Honda', 'Bengaluru', 'bengaluru', 'Karnataka',
   'Old Madras Road', 'Banaswadi', '560043', '080-23456789',
   ARRAY['bikes', 'scooters'], TRUE, 4.4, 367),

  ('Tata Motors Bengaluru', 'tata-motors-bengaluru', 'tata', 'Tata', 'Bengaluru', 'bengaluru', 'Karnataka',
   'Tumkur Road', 'Yeshwanthpur', '560022', '080-34567890',
   ARRAY['cars'], TRUE, 4.2, 312),

  -- Hyderabad (3)
  ('Hero MotoCorp Hyderabad', 'hero-motocorp-hyderabad', 'hero', 'Hero', 'Hyderabad', 'hyderabad', 'Telangana',
   'HITEC City Road', 'HITEC City', '500081', '040-12345678',
   ARRAY['bikes', 'scooters'], TRUE, 4.3, 289),

  ('Mahindra Showroom Hyderabad', 'mahindra-showroom-hyderabad', 'mahindra', 'Mahindra', 'Hyderabad', 'hyderabad', 'Telangana',
   'Begumpet Main Road', 'Begumpet', '500016', '040-87654321',
   ARRAY['cars'], TRUE, 4.1, 201),

  ('Hyundai Showroom Hyderabad', 'hyundai-showroom-hyderabad', 'hyundai', 'Hyundai', 'Hyderabad', 'hyderabad', 'Telangana',
   'Banjara Hills Road 1', 'Banjara Hills', '500034', '040-23456789',
   ARRAY['cars'], TRUE, 4.5, 534),

  -- Chennai (3)
  ('TVS Motor Chennai', 'tvs-motor-chennai', 'tvs', 'TVS', 'Chennai', 'chennai', 'Tamil Nadu',
   'Anna Salai', 'Guindy', '600032', '044-12345678',
   ARRAY['bikes', 'scooters'], TRUE, 4.2, 312),

  ('Maruti Suzuki Chennai', 'maruti-suzuki-chennai', 'maruti-suzuki', 'Maruti Suzuki', 'Chennai', 'chennai', 'Tamil Nadu',
   'Mount Road', 'Anna Nagar', '600040', '044-87654321',
   ARRAY['cars'], TRUE, 4.4, 478),

  ('Hero MotoCorp Chennai', 'hero-motocorp-chennai', 'hero', 'Hero', 'Chennai', 'chennai', 'Tamil Nadu',
   'GST Road', 'Tambaram', '600045', '044-23456789',
   ARRAY['bikes', 'scooters'], TRUE, 4.0, 187),

  -- Pune (3)
  ('Tata Motors Pune', 'tata-motors-pune', 'tata', 'Tata', 'Pune', 'pune', 'Maharashtra',
   'Nagar Road', 'Viman Nagar', '411014', '020-12345678',
   ARRAY['cars'], TRUE, 4.3, 412),

  ('Bajaj Auto Pune', 'bajaj-auto-pune', 'bajaj', 'Bajaj', 'Pune', 'pune', 'Maharashtra',
   'Pune-Nashik Highway', 'Pimpri', '411018', '020-87654321',
   ARRAY['bikes', 'scooters'], TRUE, 4.2, 298),

  ('Kia Showroom Pune', 'kia-showroom-pune', 'kia', 'Kia', 'Pune', 'pune', 'Maharashtra',
   'Baner Road', 'Baner', '411045', '020-23456789',
   ARRAY['cars'], TRUE, 4.5, 367),

  -- Jaipur (3)
  ('Maruti Suzuki Jaipur', 'maruti-suzuki-jaipur', 'maruti-suzuki', 'Maruti Suzuki', 'Jaipur', 'jaipur', 'Rajasthan',
   'Tonk Road', 'Jhotwara', '302012', '0141-1234567',
   ARRAY['cars'], TRUE, 4.2, 356),

  ('Hero MotoCorp Jaipur', 'hero-motocorp-jaipur', 'hero', 'Hero', 'Jaipur', 'jaipur', 'Rajasthan',
   'Ajmer Road', 'Shyam Nagar', '302019', '0141-8765432',
   ARRAY['bikes', 'scooters'], TRUE, 4.1, 212),

  ('Mahindra Showroom Jaipur', 'mahindra-showroom-jaipur', 'mahindra', 'Mahindra', 'Jaipur', 'jaipur', 'Rajasthan',
   'JLN Marg', 'Malviya Nagar', '302017', '0141-2345678',
   ARRAY['cars'], TRUE, 4.0, 167),

  -- Lucknow (4)
  ('Hyundai Showroom Lucknow', 'hyundai-showroom-lucknow', 'hyundai', 'Hyundai', 'Lucknow', 'lucknow', 'Uttar Pradesh',
   'Kanpur Road', 'Alambagh', '226005', '0522-1234567',
   ARRAY['cars'], TRUE, 4.3, 289),

  ('TVS Motor Lucknow', 'tvs-motor-lucknow', 'tvs', 'TVS', 'Lucknow', 'lucknow', 'Uttar Pradesh',
   'Hazratganj', 'Hazratganj', '226001', '0522-8765432',
   ARRAY['bikes', 'scooters'], TRUE, 4.1, 198),

  ('Tata Motors Lucknow', 'tata-motors-lucknow', 'tata', 'Tata', 'Lucknow', 'lucknow', 'Uttar Pradesh',
   'Gomti Nagar Extension', 'Gomti Nagar', '226010', '0522-2345678',
   ARRAY['cars'], TRUE, 4.2, 234),

  ('Bajaj Auto Lucknow', 'bajaj-auto-lucknow', 'bajaj', 'Bajaj', 'Lucknow', 'lucknow', 'Uttar Pradesh',
   'Faizabad Road', 'Indira Nagar', '226016', '0522-3456789',
   ARRAY['bikes', 'scooters'], TRUE, 4.0, 156);
