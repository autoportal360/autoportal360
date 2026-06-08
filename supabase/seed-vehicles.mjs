/**
 * Seed script — run once with:  node supabase/seed-vehicles.mjs
 * Uses the service role key to bypass RLS.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qmhnfdyjisxjhhrdfvqp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtaG5mZHlqaXN4amhocmRmdnFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgxNDI2NiwiZXhwIjoyMDk2MzkwMjY2fQ.Z81S2Tfv2db_5aOzuC4muR7RXbwfR4oVIrR60dSpgG4'
)

// ── helpers ───────────────────────────────────────────────────────────────────

async function getBrandId(slug, type) {
  const { data, error } = await supabase
    .from('brands')
    .select('id')
    .eq('slug', slug)
    .eq('type', type)
    .single()
  if (error || !data) {
    console.warn(`  ⚠  brand not found: slug="${slug}" type="${type}"`)
    return null
  }
  return data.id
}

async function upsertModel({ brandSlug, brandType, name, slug, type, bodyType, segment, launchYear, priceMin, priceMax }) {
  const brandId = await getBrandId(brandSlug, brandType)
  if (!brandId) return null

  const { data, error } = await supabase
    .from('models')
    .upsert(
      { brand_id: brandId, name, slug, type, body_type: bodyType, segment, launch_year: launchYear, status: 'active', price_min: priceMin, price_max: priceMax },
      { onConflict: 'slug,brand_id', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  if (error) {
    console.error(`  ✗  model "${name}":`, error.message)
    return null
  }
  console.log(`  ✓  model: ${name}`)
  return data.id
}

async function upsertVariants(modelId, modelName, variants) {
  if (!modelId) return
  for (const v of variants) {
    // Check if variant already exists (no unique constraint — guard manually)
    const { data: existing } = await supabase
      .from('variants')
      .select('id')
      .eq('model_id', modelId)
      .eq('slug', v.slug)
      .maybeSingle()
    if (existing) {
      console.log(`    ·  variant already exists: ${v.name}`)
      continue
    }
    const { error } = await supabase
      .from('variants')
      .insert({ model_id: modelId, ...v })
    if (error) {
      console.error(`    ✗  variant "${v.name}":`, error.message)
    } else {
      console.log(`    ✓  variant: ${v.name}`)
    }
  }
}

// ── seed data ─────────────────────────────────────────────────────────────────

const SEED = [
  // ── BIKES ──────────────────────────────────────────────────────────────────
  {
    model: { brandSlug: 'royal-enfield', brandType: 'bike', name: 'Classic 350', slug: 'classic-350', type: 'bike', bodyType: 'Cruiser', segment: 'Mid-Size Bike', launchYear: 2021, priceMin: 193000, priceMax: 226000 },
    variants: [
      { name: 'Redditch Single ABS', slug: 'redditch-single-abs', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 193000, is_popular: false, sort_order: 1 },
      { name: 'Redditch Dual ABS',   slug: 'redditch-dual-abs',   fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 210000, is_popular: true,  sort_order: 2 },
      { name: 'Signals Dual ABS',    slug: 'signals-dual-abs',    fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 226000, is_popular: false, sort_order: 3 },
    ],
  },
  {
    model: { brandSlug: 'royal-enfield', brandType: 'bike', name: 'Bullet 350', slug: 'bullet-350', type: 'bike', bodyType: 'Cruiser', segment: 'Mid-Size Bike', launchYear: 2023, priceMin: 174000, priceMax: 196000 },
    variants: [
      { name: 'Standard',  slug: 'standard',  fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 174000, is_popular: false, sort_order: 1 },
      { name: 'Military',  slug: 'military',  fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 181000, is_popular: true,  sort_order: 2 },
      { name: 'Redditch',  slug: 'redditch',  fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 196000, is_popular: false, sort_order: 3 },
    ],
  },
  {
    model: { brandSlug: 'bajaj-bike', brandType: 'bike', name: 'Pulsar NS200', slug: 'pulsar-ns200', type: 'bike', bodyType: 'Sport Naked', segment: 'Performance Bike', launchYear: 2022, priceMin: 150000, priceMax: 155000 },
    variants: [
      { name: 'ABS',    slug: 'abs',    fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 150000, is_popular: false, sort_order: 1 },
      { name: 'FI ABS', slug: 'fi-abs', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 155000, is_popular: true,  sort_order: 2 },
    ],
  },
  {
    model: { brandSlug: 'bajaj-bike', brandType: 'bike', name: 'Pulsar 150', slug: 'pulsar-150', type: 'bike', bodyType: 'Street Sport', segment: 'Commuter Sport', launchYear: 2023, priceMin: 107000, priceMax: 115000 },
    variants: [
      { name: 'Single Disc',     slug: 'single-disc',     fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 107000, is_popular: false, sort_order: 1 },
      { name: 'Neon Dual Disc',  slug: 'neon-dual-disc',  fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 115000, is_popular: true,  sort_order: 2 },
    ],
  },
  {
    model: { brandSlug: 'hero-bike', brandType: 'bike', name: 'Splendor Plus', slug: 'splendor-plus', type: 'bike', bodyType: 'Commuter', segment: 'Commuter Bike', launchYear: 2022, priceMin: 77000, priceMax: 83000 },
    variants: [
      { name: 'Kick Start Drum', slug: 'kick-drum',   fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 77000, is_popular: false, sort_order: 1 },
      { name: 'Self Start Alloy',slug: 'self-alloy',  fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 80000, is_popular: true,  sort_order: 2 },
      { name: 'XTEC',            slug: 'xtec',        fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 83000, is_popular: false, sort_order: 3 },
    ],
  },
  {
    model: { brandSlug: 'honda-bike', brandType: 'bike', name: 'CB Shine', slug: 'cb-shine', type: 'bike', bodyType: 'Commuter', segment: 'Commuter Bike', launchYear: 2023, priceMin: 80000, priceMax: 90000 },
    variants: [
      { name: 'Drum', slug: 'drum', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 80000, is_popular: false, sort_order: 1 },
      { name: 'Disc', slug: 'disc', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 87000, is_popular: true,  sort_order: 2 },
      { name: 'DX',   slug: 'dx',   fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 90000, is_popular: false, sort_order: 3 },
    ],
  },
  {
    model: { brandSlug: 'ktm', brandType: 'bike', name: 'Duke 390', slug: 'duke-390', type: 'bike', bodyType: 'Naked Sport', segment: 'Sports Bike', launchYear: 2024, priceMin: 311000, priceMax: 320000 },
    variants: [
      { name: 'Standard', slug: 'standard', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 311000, is_popular: false, sort_order: 1 },
      { name: 'ABS',      slug: 'abs',      fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 320000, is_popular: true,  sort_order: 2 },
    ],
  },

  // ── SCOOTERS ───────────────────────────────────────────────────────────────
  {
    model: { brandSlug: 'honda-scooter', brandType: 'scooter', name: 'Activa 6G', slug: 'activa-6g', type: 'scooter', bodyType: 'Scooter', segment: 'Family Scooter', launchYear: 2020, priceMin: 75000, priceMax: 79000 },
    variants: [
      { name: 'STD',     slug: 'std',     fuel_type: 'Petrol', transmission: 'CVT', ex_showroom_price: 75000, is_popular: false, sort_order: 1 },
      { name: 'DLX',     slug: 'dlx',     fuel_type: 'Petrol', transmission: 'CVT', ex_showroom_price: 77000, is_popular: true,  sort_order: 2 },
      { name: 'H-Smart', slug: 'h-smart', fuel_type: 'Petrol', transmission: 'CVT', ex_showroom_price: 79000, is_popular: false, sort_order: 3 },
    ],
  },
  {
    model: { brandSlug: 'tvs-scooter', brandType: 'scooter', name: 'NTorq 125', slug: 'ntorq-125', type: 'scooter', bodyType: 'Sport Scooter', segment: 'Performance Scooter', launchYear: 2023, priceMin: 88000, priceMax: 101000 },
    variants: [
      { name: 'Drum',                slug: 'drum',         fuel_type: 'Petrol', transmission: 'CVT', ex_showroom_price: 88000,  is_popular: false, sort_order: 1 },
      { name: 'Race Edition XP',     slug: 'race-xp',      fuel_type: 'Petrol', transmission: 'CVT', ex_showroom_price: 96000,  is_popular: true,  sort_order: 2 },
      { name: 'Super Squad Edition', slug: 'super-squad',  fuel_type: 'Petrol', transmission: 'CVT', ex_showroom_price: 101000, is_popular: false, sort_order: 3 },
    ],
  },
  {
    model: { brandSlug: 'ather', brandType: 'scooter', name: '450X', slug: '450x', type: 'scooter', bodyType: 'Electric Scooter', segment: 'Electric Scooter', launchYear: 2023, priceMin: 130000, priceMax: 146000 },
    variants: [
      { name: '2.9 kWh', slug: '2-9-kwh', fuel_type: 'Electric', transmission: 'Automatic', ex_showroom_price: 130000, is_popular: false, sort_order: 1 },
      { name: '3.7 kWh', slug: '3-7-kwh', fuel_type: 'Electric', transmission: 'Automatic', ex_showroom_price: 146000, is_popular: true,  sort_order: 2 },
    ],
  },
  {
    model: { brandSlug: 'ola-electric', brandType: 'scooter', name: 'S1 Pro', slug: 's1-pro', type: 'scooter', bodyType: 'Electric Scooter', segment: 'Electric Scooter', launchYear: 2021, priceMin: 124000, priceMax: 147000 },
    variants: [
      { name: 'S1 Pro Gen 2',        slug: 's1-pro-gen2',      fuel_type: 'Electric', transmission: 'Automatic', ex_showroom_price: 124000, is_popular: false, sort_order: 1 },
      { name: 'S1 Pro Gen 2 4 kWh',  slug: 's1-pro-gen2-4kwh', fuel_type: 'Electric', transmission: 'Automatic', ex_showroom_price: 147000, is_popular: true,  sort_order: 2 },
    ],
  },

  // ── CARS ───────────────────────────────────────────────────────────────────
  {
    model: { brandSlug: 'maruti-suzuki', brandType: 'car', name: 'Swift', slug: 'swift', type: 'car', bodyType: 'Hatchback', segment: 'Premium Hatchback', launchYear: 2024, priceMin: 649000, priceMax: 964000 },
    variants: [
      { name: 'LXi',   slug: 'lxi',      fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 649000, is_popular: false, sort_order: 1 },
      { name: 'VXi',   slug: 'vxi',      fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 764000, is_popular: true,  sort_order: 2 },
      { name: 'ZXi+',  slug: 'zxi-plus', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 964000, is_popular: false, sort_order: 3 },
    ],
  },
  {
    model: { brandSlug: 'hyundai', brandType: 'car', name: 'Creta', slug: 'creta', type: 'car', bodyType: 'SUV', segment: 'Mid-Size SUV', launchYear: 2024, priceMin: 1111000, priceMax: 2045000 },
    variants: [
      { name: 'E Petrol MT',    slug: 'e-petrol-mt',  fuel_type: 'Petrol', transmission: 'Manual',    ex_showroom_price: 1111000, is_popular: false, sort_order: 1 },
      { name: 'S Petrol MT',    slug: 's-petrol-mt',  fuel_type: 'Petrol', transmission: 'Manual',    ex_showroom_price: 1275000, is_popular: true,  sort_order: 2 },
      { name: 'SX(O) Diesel AT',slug: 'sxo-diesel-at',fuel_type: 'Diesel', transmission: 'Automatic', ex_showroom_price: 2045000, is_popular: false, sort_order: 3 },
    ],
  },
  {
    model: { brandSlug: 'mahindra', brandType: 'car', name: 'Scorpio-N', slug: 'scorpio-n', type: 'car', bodyType: 'SUV', segment: 'Full-Size SUV', launchYear: 2022, priceMin: 1386000, priceMax: 2454000 },
    variants: [
      { name: 'Z2 Petrol MT',  slug: 'z2-petrol-mt',  fuel_type: 'Petrol', transmission: 'Manual',    ex_showroom_price: 1386000, is_popular: false, sort_order: 1 },
      { name: 'Z4 Diesel MT',  slug: 'z4-diesel-mt',  fuel_type: 'Diesel', transmission: 'Manual',    ex_showroom_price: 1598000, is_popular: true,  sort_order: 2 },
      { name: 'Z8L Diesel AT', slug: 'z8l-diesel-at', fuel_type: 'Diesel', transmission: 'Automatic', ex_showroom_price: 2454000, is_popular: false, sort_order: 3 },
    ],
  },
]

// ── run ───────────────────────────────────────────────────────────────────────

console.log('AutoPortal360 — seeding vehicles...\n')

for (const { model, variants } of SEED) {
  console.log(`\n[${model.type.toUpperCase()}] ${model.name}`)
  const modelId = await upsertModel(model)
  await upsertVariants(modelId, model.name, variants)
}

console.log('\n✓ Seed complete.')
