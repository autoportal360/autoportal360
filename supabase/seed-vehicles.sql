-- ============================================================
-- AutoPortal360 — Vehicle Seed Data
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/qmhnfdyjisxjhhrdfvqp/sql
-- ============================================================

-- Clear existing data before re-seeding
DELETE FROM variants WHERE model_id IN (
  SELECT id FROM models
);
DELETE FROM models;

-- ════════════════════════════════════════════════════════════
-- BIKES
-- ════════════════════════════════════════════════════════════

-- ── Royal Enfield Classic 350 ────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'royal-enfield' AND type = 'bike'),
  'Classic 350', 'classic-350', 'bike', 'Cruiser', 'Mid-Size Bike', 2021, 'active', 193000, 226000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Redditch Single ABS', 'redditch-single-abs', 'Petrol', 'Manual', 193000, false, 1
FROM models WHERE slug = 'classic-350' AND brand_id = (SELECT id FROM brands WHERE slug = 'royal-enfield' AND type = 'bike');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Redditch Dual ABS', 'redditch-dual-abs', 'Petrol', 'Manual', 210000, true, 2
FROM models WHERE slug = 'classic-350' AND brand_id = (SELECT id FROM brands WHERE slug = 'royal-enfield' AND type = 'bike');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Signals Dual ABS', 'signals-dual-abs', 'Petrol', 'Manual', 226000, false, 3
FROM models WHERE slug = 'classic-350' AND brand_id = (SELECT id FROM brands WHERE slug = 'royal-enfield' AND type = 'bike');

-- ── Royal Enfield Bullet 350 ─────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'royal-enfield' AND type = 'bike'),
  'Bullet 350', 'bullet-350', 'bike', 'Cruiser', 'Mid-Size Bike', 2023, 'active', 174000, 196000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Standard', 'standard', 'Petrol', 'Manual', 174000, false, 1
FROM models WHERE slug = 'bullet-350' AND brand_id = (SELECT id FROM brands WHERE slug = 'royal-enfield' AND type = 'bike');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Military', 'military', 'Petrol', 'Manual', 181000, true, 2
FROM models WHERE slug = 'bullet-350' AND brand_id = (SELECT id FROM brands WHERE slug = 'royal-enfield' AND type = 'bike');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Redditch', 'redditch', 'Petrol', 'Manual', 196000, false, 3
FROM models WHERE slug = 'bullet-350' AND brand_id = (SELECT id FROM brands WHERE slug = 'royal-enfield' AND type = 'bike');

-- ── Bajaj Pulsar NS200 ───────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'bajaj-bike' AND type = 'bike'),
  'Pulsar NS200', 'pulsar-ns200', 'bike', 'Sport Naked', 'Performance Bike', 2022, 'active', 150000, 155000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'ABS', 'abs', 'Petrol', 'Manual', 150000, false, 1
FROM models WHERE slug = 'pulsar-ns200' AND brand_id = (SELECT id FROM brands WHERE slug = 'bajaj-bike' AND type = 'bike');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'FI ABS', 'fi-abs', 'Petrol', 'Manual', 155000, true, 2
FROM models WHERE slug = 'pulsar-ns200' AND brand_id = (SELECT id FROM brands WHERE slug = 'bajaj-bike' AND type = 'bike');

-- ── Bajaj Pulsar 150 ─────────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'bajaj-bike' AND type = 'bike'),
  'Pulsar 150', 'pulsar-150', 'bike', 'Street Sport', 'Commuter Sport', 2023, 'active', 107000, 115000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Single Disc', 'single-disc', 'Petrol', 'Manual', 107000, false, 1
FROM models WHERE slug = 'pulsar-150' AND brand_id = (SELECT id FROM brands WHERE slug = 'bajaj-bike' AND type = 'bike');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Neon Dual Disc', 'neon-dual-disc', 'Petrol', 'Manual', 115000, true, 2
FROM models WHERE slug = 'pulsar-150' AND brand_id = (SELECT id FROM brands WHERE slug = 'bajaj-bike' AND type = 'bike');

-- ── Hero Splendor Plus ───────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'hero-bike' AND type = 'bike'),
  'Splendor Plus', 'splendor-plus', 'bike', 'Commuter', 'Commuter Bike', 2022, 'active', 77000, 83000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Kick Start Drum', 'kick-drum', 'Petrol', 'Manual', 77000, false, 1
FROM models WHERE slug = 'splendor-plus' AND brand_id = (SELECT id FROM brands WHERE slug = 'hero-bike' AND type = 'bike');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Self Start Alloy', 'self-alloy', 'Petrol', 'Manual', 80000, true, 2
FROM models WHERE slug = 'splendor-plus' AND brand_id = (SELECT id FROM brands WHERE slug = 'hero-bike' AND type = 'bike');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'XTEC', 'xtec', 'Petrol', 'Manual', 83000, false, 3
FROM models WHERE slug = 'splendor-plus' AND brand_id = (SELECT id FROM brands WHERE slug = 'hero-bike' AND type = 'bike');

-- ── Honda CB Shine ───────────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'honda-bike' AND type = 'bike'),
  'CB Shine', 'cb-shine', 'bike', 'Commuter', 'Commuter Bike', 2023, 'active', 80000, 90000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Drum', 'drum', 'Petrol', 'Manual', 80000, false, 1
FROM models WHERE slug = 'cb-shine' AND brand_id = (SELECT id FROM brands WHERE slug = 'honda-bike' AND type = 'bike');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Disc', 'disc', 'Petrol', 'Manual', 87000, true, 2
FROM models WHERE slug = 'cb-shine' AND brand_id = (SELECT id FROM brands WHERE slug = 'honda-bike' AND type = 'bike');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'DX', 'dx', 'Petrol', 'Manual', 90000, false, 3
FROM models WHERE slug = 'cb-shine' AND brand_id = (SELECT id FROM brands WHERE slug = 'honda-bike' AND type = 'bike');

-- ── KTM Duke 390 ────────────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'ktm' AND type = 'bike'),
  'Duke 390', 'duke-390', 'bike', 'Naked Sport', 'Sports Bike', 2024, 'active', 311000, 320000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Standard', 'standard', 'Petrol', 'Manual', 311000, false, 1
FROM models WHERE slug = 'duke-390' AND brand_id = (SELECT id FROM brands WHERE slug = 'ktm' AND type = 'bike');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'ABS', 'abs', 'Petrol', 'Manual', 320000, true, 2
FROM models WHERE slug = 'duke-390' AND brand_id = (SELECT id FROM brands WHERE slug = 'ktm' AND type = 'bike');

-- ════════════════════════════════════════════════════════════
-- SCOOTERS
-- ════════════════════════════════════════════════════════════

-- ── Honda Activa 6G ─────────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'honda-scooter' AND type = 'scooter'),
  'Activa 6G', 'activa-6g', 'scooter', 'Scooter', 'Family Scooter', 2020, 'active', 75000, 79000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'STD', 'std', 'Petrol', 'CVT', 75000, false, 1
FROM models WHERE slug = 'activa-6g' AND brand_id = (SELECT id FROM brands WHERE slug = 'honda-scooter' AND type = 'scooter');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'DLX', 'dlx', 'Petrol', 'CVT', 77000, true, 2
FROM models WHERE slug = 'activa-6g' AND brand_id = (SELECT id FROM brands WHERE slug = 'honda-scooter' AND type = 'scooter');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'H-Smart', 'h-smart', 'Petrol', 'CVT', 79000, false, 3
FROM models WHERE slug = 'activa-6g' AND brand_id = (SELECT id FROM brands WHERE slug = 'honda-scooter' AND type = 'scooter');

-- ── TVS NTorq 125 ───────────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'tvs-scooter' AND type = 'scooter'),
  'NTorq 125', 'ntorq-125', 'scooter', 'Sport Scooter', 'Performance Scooter', 2023, 'active', 88000, 101000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Drum', 'drum', 'Petrol', 'CVT', 88000, false, 1
FROM models WHERE slug = 'ntorq-125' AND brand_id = (SELECT id FROM brands WHERE slug = 'tvs-scooter' AND type = 'scooter');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Race Edition XP', 'race-edition-xp', 'Petrol', 'CVT', 96000, true, 2
FROM models WHERE slug = 'ntorq-125' AND brand_id = (SELECT id FROM brands WHERE slug = 'tvs-scooter' AND type = 'scooter');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Super Squad Edition', 'super-squad', 'Petrol', 'CVT', 101000, false, 3
FROM models WHERE slug = 'ntorq-125' AND brand_id = (SELECT id FROM brands WHERE slug = 'tvs-scooter' AND type = 'scooter');

-- ── Ather 450X ──────────────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'ather' AND type = 'scooter'),
  '450X', '450x', 'scooter', 'Electric Scooter', 'Electric Scooter', 2023, 'active', 130000, 146000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, '2.9 kWh', '2-9-kwh', 'Electric', 'Automatic', 130000, false, 1
FROM models WHERE slug = '450x' AND brand_id = (SELECT id FROM brands WHERE slug = 'ather' AND type = 'scooter');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, '3.7 kWh', '3-7-kwh', 'Electric', 'Automatic', 146000, true, 2
FROM models WHERE slug = '450x' AND brand_id = (SELECT id FROM brands WHERE slug = 'ather' AND type = 'scooter');

-- ── Ola S1 Pro ──────────────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'ola-electric' AND type = 'scooter'),
  'S1 Pro', 's1-pro', 'scooter', 'Electric Scooter', 'Electric Scooter', 2021, 'active', 124000, 147000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'S1 Pro Gen 2', 's1-pro-gen2', 'Electric', 'Automatic', 124000, false, 1
FROM models WHERE slug = 's1-pro' AND brand_id = (SELECT id FROM brands WHERE slug = 'ola-electric' AND type = 'scooter');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'S1 Pro Gen 2 4 kWh', 's1-pro-gen2-4kwh', 'Electric', 'Automatic', 147000, true, 2
FROM models WHERE slug = 's1-pro' AND brand_id = (SELECT id FROM brands WHERE slug = 'ola-electric' AND type = 'scooter');

-- ════════════════════════════════════════════════════════════
-- CARS (additional beyond Tata Punch)
-- ════════════════════════════════════════════════════════════

-- ── Maruti Swift ────────────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'maruti-suzuki' AND type = 'car'),
  'Swift', 'swift', 'car', 'Hatchback', 'Premium Hatchback', 2024, 'active', 649000, 964000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'LXi', 'lxi', 'Petrol', 'Manual', 649000, false, 1
FROM models WHERE slug = 'swift' AND brand_id = (SELECT id FROM brands WHERE slug = 'maruti-suzuki' AND type = 'car');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'VXi', 'vxi', 'Petrol', 'Manual', 764000, true, 2
FROM models WHERE slug = 'swift' AND brand_id = (SELECT id FROM brands WHERE slug = 'maruti-suzuki' AND type = 'car');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'ZXi+', 'zxi-plus', 'Petrol', 'Manual', 964000, false, 3
FROM models WHERE slug = 'swift' AND brand_id = (SELECT id FROM brands WHERE slug = 'maruti-suzuki' AND type = 'car');

-- ── Hyundai Creta ────────────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'hyundai' AND type = 'car'),
  'Creta', 'creta', 'car', 'SUV', 'Mid-Size SUV', 2024, 'active', 1111000, 2045000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'E Petrol MT', 'e-petrol-mt', 'Petrol', 'Manual', 1111000, false, 1
FROM models WHERE slug = 'creta' AND brand_id = (SELECT id FROM brands WHERE slug = 'hyundai' AND type = 'car');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'S Petrol MT', 's-petrol-mt', 'Petrol', 'Manual', 1275000, true, 2
FROM models WHERE slug = 'creta' AND brand_id = (SELECT id FROM brands WHERE slug = 'hyundai' AND type = 'car');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'SX(O) Diesel AT', 'sxo-diesel-at', 'Diesel', 'Automatic', 2045000, false, 3
FROM models WHERE slug = 'creta' AND brand_id = (SELECT id FROM brands WHERE slug = 'hyundai' AND type = 'car');

-- ── Mahindra Scorpio-N ───────────────────────────────────────
INSERT INTO models (brand_id, name, slug, type, body_type, segment, launch_year, status, price_min, price_max)
VALUES (
  (SELECT id FROM brands WHERE slug = 'mahindra' AND type = 'car'),
  'Scorpio-N', 'scorpio-n', 'car', 'SUV', 'Full-Size SUV', 2022, 'active', 1386000, 2454000
);

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Z2 Petrol MT', 'z2-petrol-mt', 'Petrol', 'Manual', 1386000, false, 1
FROM models WHERE slug = 'scorpio-n' AND brand_id = (SELECT id FROM brands WHERE slug = 'mahindra' AND type = 'car');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Z4 Diesel MT', 'z4-diesel-mt', 'Diesel', 'Manual', 1598000, true, 2
FROM models WHERE slug = 'scorpio-n' AND brand_id = (SELECT id FROM brands WHERE slug = 'mahindra' AND type = 'car');

INSERT INTO variants (model_id, name, slug, fuel_type, transmission, ex_showroom_price, is_popular, sort_order)
SELECT id, 'Z8L Diesel AT', 'z8l-diesel-at', 'Diesel', 'Automatic', 2454000, false, 3
FROM models WHERE slug = 'scorpio-n' AND brand_id = (SELECT id FROM brands WHERE slug = 'mahindra' AND type = 'car');
