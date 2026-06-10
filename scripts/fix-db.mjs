/**
 * fix-db.mjs
 * FIX 1 — set thumbnail_url for bikes/scooters directly in DB
 * FIX 2 — insert Tata Punch specs for accomplished-mt variant
 * FIX 4 — add Nexon, Tiago, Harrier, Altroz models + basic variants
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qmhnfdyjisxjhhrdfvqp.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtaG5mZHlqaXN4amhocmRmdnFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgxNDI2NiwiZXhwIjoyMDk2MzkwMjY2fQ.Z81S2Tfv2db_5aOzuC4muR7RXbwfR4oVIrR60dSpgG4'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ── FIX 1 ────────────────────────────────────────────────────────────────────

async function fix1_thumbnails() {
  console.log('\n── FIX 1: thumbnail_url for bikes/scooters ──')
  const updates = [
    { slug: 'classic-350',  url: 'https://imgd.aeplcdn.com/1280x720/n/cw/ec/44144/classic-350-right-side-view.jpeg?isig=0'    },
    { slug: 'pulsar-ns200', url: 'https://imgd.aeplcdn.com/1280x720/n/cw/ec/33244/pulsar-ns200-right-side-view.jpeg?isig=0'   },
    { slug: 'pulsar-150',   url: 'https://imgd.aeplcdn.com/1280x720/n/cw/ec/40087/pulsar-150-right-side-view.jpeg?isig=0'     },
    { slug: 'splendor-plus',url: 'https://imgd.aeplcdn.com/1280x720/n/cw/ec/35562/splendor-plus-right-side-view.jpeg?isig=0'  },
    { slug: 'activa-6g',    url: 'https://imgd.aeplcdn.com/1280x720/n/cw/ec/106257/activa-6g-right-side-view.jpeg?isig=0'     },
    { slug: '450x',         url: 'https://imgd.aeplcdn.com/1280x720/n/cw/ec/128249/450x-right-side-view.jpeg?isig=0'          },
    { slug: 's1-pro',       url: 'https://imgd.aeplcdn.com/1280x720/n/cw/ec/130477/s1-pro-right-side-view.jpeg?isig=0'        },
    { slug: 'ntorq-125',    url: 'https://imgd.aeplcdn.com/1280x720/n/cw/ec/88248/ntorq-125-right-side-view.jpeg?isig=0'      },
  ]

  for (const { slug, url } of updates) {
    const { error } = await supabase.from('models').update({ thumbnail_url: url }).eq('slug', slug)
    console.log(error ? `  ✗ ${slug}: ${error.message}` : `  ✓ ${slug}`)
  }
}

// ── FIX 2 ────────────────────────────────────────────────────────────────────

async function fix2_punchSpecs() {
  console.log('\n── FIX 2: Tata Punch specs ──')

  const { data: variant, error: vErr } = await supabase
    .from('variants')
    .select('id, models(slug)')
    .eq('slug', 'accomplished-mt')
    .single()

  if (vErr || !variant) {
    console.log('  ✗ variant accomplished-mt not found:', vErr?.message)
    return
  }
  console.log(`  found variant id: ${variant.id}`)

  // Upsert so re-runs are safe
  const { error } = await supabase.from('specs').upsert({
    variant_id:          variant.id,
    engine_cc:           1199,
    power_bhp:           86,
    torque_nm:           113,
    mileage_arai:        18.97,
    fuel_tank_l:         37,
    seating:             5,
    boot_space_l:        366,
    ground_clearance_mm: 187,
    length_mm:           3827,
    width_mm:            1742,
    height_mm:           1615,
    wheelbase_mm:        2445,
    kerb_weight_kg:      960,
    tyre_size:           '195/60 R16',
    ncap_rating:         '5-Star Global NCAP',
  }, { onConflict: 'variant_id' })

  console.log(error ? `  ✗ specs: ${error.message}` : '  ✓ specs inserted for Punch accomplished-mt')
}

// ── FIX 4 ────────────────────────────────────────────────────────────────────

const NEW_MODELS = [
  {
    name: 'Nexon', slug: 'nexon', body_type: 'SUV', segment: 'Compact SUV',
    price_min: 810000, price_max: 1550000,
    variants: [
      { name: 'Smart Plus S MT', slug: 'smart-plus-s-mt', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 810000,  is_popular: false, sort_order: 1 },
      { name: 'Creative+ S MT',  slug: 'creative-plus-s-mt', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 1259000, is_popular: true,  sort_order: 2 },
      { name: 'Fearless+ S AT',  slug: 'fearless-plus-s-at', fuel_type: 'Petrol', transmission: 'Automatic', ex_showroom_price: 1499000, is_popular: false, sort_order: 3 },
    ],
  },
  {
    name: 'Tiago', slug: 'tiago', body_type: 'Hatchback', segment: 'Hatchback',
    price_min: 570000, price_max: 835000,
    variants: [
      { name: 'XE MT',       slug: 'xe-mt',  fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 570000, is_popular: false, sort_order: 1 },
      { name: 'XZ+ MT',      slug: 'xzplus-mt', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 740000, is_popular: true,  sort_order: 2 },
      { name: 'XZ+ CNG MT',  slug: 'xzplus-cng-mt', fuel_type: 'CNG', transmission: 'Manual', ex_showroom_price: 835000, is_popular: false, sort_order: 3 },
    ],
  },
  {
    name: 'Harrier', slug: 'harrier', body_type: 'SUV', segment: 'Mid-Size SUV',
    price_min: 1549000, price_max: 2550000,
    variants: [
      { name: 'Smart MT',        slug: 'smart-mt',        fuel_type: 'Diesel', transmission: 'Manual',    ex_showroom_price: 1549000, is_popular: false, sort_order: 1 },
      { name: 'Accomplished+ AT',slug: 'accomplished-at', fuel_type: 'Diesel', transmission: 'Automatic', ex_showroom_price: 2149000, is_popular: true,  sort_order: 2 },
      { name: 'Adventure Plus AT',slug: 'adventure-plus-at', fuel_type: 'Diesel', transmission: 'Automatic', ex_showroom_price: 2550000, is_popular: false, sort_order: 3 },
    ],
  },
  {
    name: 'Altroz', slug: 'altroz', body_type: 'Hatchback', segment: 'Premium Hatchback',
    price_min: 660000, price_max: 1125000,
    variants: [
      { name: 'XE MT',     slug: 'xe-mt-altroz',   fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 660000,  is_popular: false, sort_order: 1 },
      { name: 'XZ+ MT',    slug: 'xzplus-mt-altroz', fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 1084000, is_popular: true,  sort_order: 2 },
      { name: 'XZ+ DT MT', slug: 'xzplus-dt-mt',   fuel_type: 'Petrol', transmission: 'Manual', ex_showroom_price: 1125000, is_popular: false, sort_order: 3 },
    ],
  },
]

async function fix4_moreModels() {
  console.log('\n── FIX 4: additional Tata models ──')

  const { data: tataBrand, error: bErr } = await supabase
    .from('brands').select('id').eq('slug', 'tata').eq('type', 'car').single()
  if (bErr || !tataBrand) { console.log('  ✗ Tata brand not found:', bErr?.message); return }

  for (const model of NEW_MODELS) {
    // Skip if already exists
    const { data: existing } = await supabase
      .from('models').select('id').eq('slug', model.slug).eq('brand_id', tataBrand.id).maybeSingle()
    if (existing) { console.log(`  ⏭ model exists: ${model.slug}`); continue }

    const { data: inserted, error: mErr } = await supabase
      .from('models').insert({
        brand_id:    tataBrand.id,
        name:        model.name,
        slug:        model.slug,
        type:        'car',
        body_type:   model.body_type,
        segment:     model.segment,
        launch_year: 2023,
        status:      'active',
        price_min:   model.price_min,
        price_max:   model.price_max,
      }).select('id').single()

    if (mErr || !inserted) { console.log(`  ✗ model ${model.slug}: ${mErr?.message}`); continue }
    console.log(`  ✓ model: ${model.slug}`)

    for (const v of model.variants) {
      const { error: vErr } = await supabase.from('variants').insert({
        model_id:          inserted.id,
        name:              v.name,
        slug:              v.slug,
        fuel_type:         v.fuel_type,
        transmission:      v.transmission,
        ex_showroom_price: v.ex_showroom_price,
        is_popular:        v.is_popular,
        sort_order:        v.sort_order,
      })
      console.log(vErr ? `    ✗ variant ${v.slug}: ${vErr.message}` : `    ✓ variant: ${v.slug}`)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  await fix1_thumbnails()
  await fix2_punchSpecs()
  await fix4_moreModels()
  console.log('\nAll done.')
}

main().catch(console.error)
