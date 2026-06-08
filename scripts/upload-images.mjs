/**
 * upload-images.mjs
 * Downloads model hero images, resizes to 800x500 WebP, uploads to Supabase Storage,
 * and updates models.thumbnail_url.
 *
 * NOTE: aeplcdn.com (CarDekho CDN) blocks server-side HTTP via JA3 fingerprinting.
 * Replace PLACEHOLDER_SEED values with direct image URLs once you source them
 * (manufacturer press kits, your own photos, or a CDN that allows server access).
 */

import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import sharp from 'sharp'

const SUPABASE_URL = 'https://qmhnfdyjisxjhhrdfvqp.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtaG5mZHlqaXN4amhocmRmdnFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgxNDI2NiwiZXhwIjoyMDk2MzkwMjY2fQ.Z81S2Tfv2db_5aOzuC4muR7RXbwfR4oVIrR60dSpgG4'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// brand-slug/model-slug → image URL
// Swap picsum.photos seeds for real vehicle image URLs when available.
const IMAGE_MAP = {
  // Cars
  'tata/punch':                'https://picsum.photos/seed/tata-punch/800/500',
  'tata/nexon':                'https://picsum.photos/seed/tata-nexon/800/500',
  'hyundai/creta':             'https://picsum.photos/seed/hyundai-creta/800/500',
  'maruti-suzuki/swift':       'https://picsum.photos/seed/maruti-swift/800/500',
  'mahindra/scorpio-n':        'https://picsum.photos/seed/mahindra-scorpio/800/500',
  // Bikes
  'royal-enfield/classic-350': 'https://picsum.photos/seed/re-classic-350/800/500',
  'royal-enfield/bullet-350':  'https://picsum.photos/seed/re-bullet-350/800/500',
  'bajaj/pulsar-ns200':        'https://picsum.photos/seed/bajaj-ns200/800/500',
  'bajaj/pulsar-150':          'https://picsum.photos/seed/bajaj-150/800/500',
  'hero/splendor-plus':        'https://picsum.photos/seed/hero-splendor/800/500',
  'honda/cb-shine':            'https://picsum.photos/seed/honda-cb-shine/800/500',
  'ktm/duke-390':              'https://picsum.photos/seed/ktm-390/800/500',
  // Scooters
  'honda/activa-6g':           'https://picsum.photos/seed/honda-activa/800/500',
  'tvs/ntorq-125':             'https://picsum.photos/seed/tvs-ntorq/800/500',
  'ather/450x':                'https://picsum.photos/seed/ather-450x/800/500',
  'ola-electric/s1-pro':       'https://picsum.photos/seed/ola-s1pro/800/500',
}

async function downloadImage(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    maxRedirects: 5,
    timeout: 20000,
    headers: { 'User-Agent': 'AutoPortal360/1.0 (image-pipeline)' },
  })
  return Buffer.from(response.data)
}

async function processImage(buffer) {
  return sharp(buffer)
    .resize(800, 500, { fit: 'cover', position: 'centre' })
    .webp({ quality: 82 })
    .toBuffer()
}

async function uploadToStorage(webpBuffer, storagePath) {
  const { error } = await supabase.storage
    .from('models')
    .upload(storagePath, webpBuffer, { contentType: 'image/webp', upsert: true })
  if (error) throw new Error(`Storage: ${error.message}`)
  const { data } = supabase.storage.from('models').getPublicUrl(storagePath)
  return data.publicUrl
}

async function main() {
  console.log('Fetching models from Supabase…')
  const { data: brands, error: bErr } = await supabase
    .from('brands').select('id, slug, name').eq('is_active', true)
  if (bErr) { console.error(bErr.message); process.exit(1) }

  const { data: models, error: mErr } = await supabase
    .from('models').select('id, slug, name, brand_id').neq('status', 'discontinued')
  if (mErr) { console.error(mErr.message); process.exit(1) }

  const brandMap = new Map(brands.map(b => [b.id, b]))
  let success = 0, skipped = 0, failed = 0

  for (const model of models) {
    const brand = brandMap.get(model.brand_id)
    if (!brand) continue

    const brandSlug = brand.slug.replace(/-bike$/, '').replace(/-scooter$/, '')
    const key = `${brandSlug}/${model.slug}`

    if (!IMAGE_MAP[key]) {
      console.log(`  ⏭  SKIP  ${key} — no image mapped`)
      skipped++
      continue
    }

    const storagePath = `${brandSlug}/${model.slug}.webp`
    process.stdout.write(`  ↓  ${key} … `)

    try {
      const raw    = await downloadImage(IMAGE_MAP[key])
      const webp   = await processImage(raw)
      const pubUrl = await uploadToStorage(webp, storagePath)

      const { error: uErr } = await supabase
        .from('models').update({ thumbnail_url: pubUrl }).eq('id', model.id)
      if (uErr) throw new Error(`DB: ${uErr.message}`)

      console.log(`✓  ${pubUrl}`)
      success++
    } catch (err) {
      console.log(`✗  ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone — ${success} uploaded, ${skipped} skipped, ${failed} failed`)
}

main()
