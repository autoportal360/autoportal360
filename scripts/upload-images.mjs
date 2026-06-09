/**
 * upload-images.mjs
 * Downloads model hero images via curl (bypasses aeplcdn.com JA3 TLS fingerprinting),
 * resizes to 800×500 WebP with sharp, uploads to Supabase Storage, and updates
 * models.thumbnail_url.
 */

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { spawnSync } from 'child_process'
import { tmpdir } from 'os'
import { join } from 'path'
import { readFileSync, unlinkSync, existsSync } from 'fs'

const SUPABASE_URL = 'https://qmhnfdyjisxjhhrdfvqp.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtaG5mZHlqaXN4amhocmRmdnFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgxNDI2NiwiZXhwIjoyMDk2MzkwMjY2fQ.Z81S2Tfv2db_5aOzuC4muR7RXbwfR4oVIrR60dSpgG4'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// brand-slug/model-slug → Wikimedia Commons 500px thumbnail URL.
// Wikimedia allows 250px and 500px thumbnails from scripts; direct full-file
// downloads are rate-limited. All URLs verified 200 OK before adding.
// To add more: find the file hash via Commons API, then build:
//   https://upload.wikimedia.org/wikipedia/commons/thumb/{h1}/{h2}/{file}/500px-{file}
const IMAGE_MAP = {
  'tata/punch':                'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2021_Tata_Punch_Creative_%28India%29_front_view_01.png/500px-2021_Tata_Punch_Creative_%28India%29_front_view_01.png',
  'maruti-suzuki/swift':       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Maruti_Suzuki_Swift_4456.JPG/500px-Maruti_Suzuki_Swift_4456.JPG',
  'royal-enfield/classic-350': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Royal_Enfield_Classic_350.jpg/500px-Royal_Enfield_Classic_350.jpg',
  'hyundai/creta':             'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png/500px-2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png',
  'ktm/duke-390':              'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/KTM_390_Duke_in_Athens_on_11-1-2023.jpg/500px-KTM_390_Duke_in_Athens_on_11-1-2023.jpg',
  'honda/activa-6g':           'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Honda_Activa_6G.jpg/500px-Honda_Activa_6G.jpg',
}

async function ensureBuckets() {
  for (const bucket of ['models', 'brands']) {
    const { error } = await supabase.storage.createBucket(bucket, { public: true })
    if (error && !error.message.toLowerCase().includes('already exists')) {
      console.warn(`  ⚠  Bucket ${bucket}: ${error.message}`)
    } else if (!error) {
      console.log(`  ✓  Created bucket: ${bucket}`)
    }
  }
}

function downloadViaCurl(url) {
  // curl bypasses aeplcdn.com's JA3 TLS fingerprint block that rejects all Node.js clients.
  const tmpFile = join(tmpdir(), `ap360-img-${Date.now()}.jpg`)
  const result = spawnSync('curl', [
    '-sfL',
    '--max-time', '20',
    '-H', 'Referer: https://en.wikipedia.org/',
    '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    '-o', tmpFile,
    url,
  ])
  if (result.status !== 0) {
    throw new Error(`curl exited ${result.status}: ${result.stderr?.toString().trim()}`)
  }
  if (!existsSync(tmpFile)) throw new Error('curl produced no output file')
  const buffer = readFileSync(tmpFile)
  try { unlinkSync(tmpFile) } catch { /* ignore cleanup errors */ }
  if (buffer.length < 2000) {
    throw new Error(`Response too small (${buffer.length} bytes) — likely a block/redirect page`)
  }
  return buffer
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
  console.log('Ensuring storage buckets exist…')
  await ensureBuckets()

  console.log('\nFetching models from Supabase…')
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
      const raw    = downloadViaCurl(IMAGE_MAP[key])
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

    // Respect Wikimedia rate limits
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log(`\nDone — ${success} uploaded, ${skipped} skipped, ${failed} failed`)
}

main()
