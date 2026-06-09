/**
 * upload-brand-logos.mjs
 * Downloads brand logos via curl, resizes to 200×200 WebP, uploads to
 * Supabase Storage 'brands' bucket, and updates brands.logo_url.
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

// clean brand-slug (suffix -bike/-scooter stripped) → Wikimedia Commons 250px PNG thumbnail.
// Keys MUST be the clean slug — the script strips -bike/-scooter before looking up here.
const LOGO_MAP = {
  // Cars
  'tata':          'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/250px-Tata_logo.svg.png',
  'hyundai':       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/250px-Hyundai_Motor_Company_logo.svg.png',
  'maruti-suzuki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Suzuki_logo_2025_%28vertical%29.svg/250px-Suzuki_logo_2025_%28vertical%29.svg.png',
  'mahindra':      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Mahindra_logo.svg/250px-Mahindra_logo.svg.png',
  'kia':           'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Kia_Motors_logo_2010.svg/250px-Kia_Motors_logo_2010.svg.png',
  'toyota':        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/250px-Toyota_carlogo.svg.png',
  'mg':            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/MG_Motor_2021_logo.svg/250px-MG_Motor_2021_logo.svg.png',
  'skoda':         'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Skoda_wordmark_rgb_black_a351de07.png/250px-Skoda_wordmark_rgb_black_a351de07.png',
  'volkswagen':    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/250px-Volkswagen_logo_2019.svg.png',
  'renault':       'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Renault_2021_Text.svg/250px-Renault_2021_Text.svg.png',
  'nissan':        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nissan_2020_logo.svg/250px-Nissan_2020_logo.svg.png',
  // Bikes & Scooters (key = clean slug without -bike/-scooter)
  'honda':         'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/250px-Honda.svg.png',
  'royal-enfield': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Royal_Enfield_logo.svg/250px-Royal_Enfield_logo.svg.png',
  'ktm':           'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/KTM-Logo.svg/250px-KTM-Logo.svg.png',
  'bajaj':         'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bajaj_Auto_Logo.svg/250px-Bajaj_Auto_Logo.svg.png',
  'hero':          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Hero_MotoCorp_Logo.svg/250px-Hero_MotoCorp_Logo.svg.png',
  'tvs':           'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/TVS_Motor_Company_Logo.svg/250px-TVS_Motor_Company_Logo.svg.png',
  'yamaha':        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Yamaha_Motor_logo.svg/250px-Yamaha_Motor_logo.svg.png',
  'ather':         'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Ather_New_Logo.jpg/250px-Ather_New_Logo.jpg',
}

async function ensureBucket() {
  const { error } = await supabase.storage.createBucket('brands', { public: true })
  if (error && !error.message.toLowerCase().includes('already exists')) {
    console.warn(`  ⚠  Bucket brands: ${error.message}`)
  } else if (!error) {
    console.log('  ✓  Created bucket: brands')
  }
}

function downloadViaCurl(url) {
  const tmpFile = join(tmpdir(), `ap360-logo-${Date.now()}.png`)
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
  try { unlinkSync(tmpFile) } catch { /* ignore */ }
  if (buffer.length < 500) {
    throw new Error(`Response too small (${buffer.length} bytes) — likely blocked`)
  }
  return buffer
}

async function processLogo(buffer) {
  // density: 300 ensures SVG rasterization is crisp before downscaling to 200×200
  return sharp(buffer, { density: 300 })
    .resize(200, 200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp({ quality: 90 })
    .toBuffer()
}

async function uploadToStorage(webpBuffer, storagePath) {
  const { error } = await supabase.storage
    .from('brands')
    .upload(storagePath, webpBuffer, { contentType: 'image/webp', upsert: true })
  if (error) throw new Error(`Storage: ${error.message}`)
  const { data } = supabase.storage.from('brands').getPublicUrl(storagePath)
  return data.publicUrl
}

async function main() {
  console.log('Ensuring brands bucket exists…')
  await ensureBucket()

  console.log('\nFetching brands from Supabase…')
  const { data: brands, error } = await supabase
    .from('brands').select('id, slug, name').eq('is_active', true)
  if (error) { console.error(error.message); process.exit(1) }

  let success = 0, skipped = 0, failed = 0
  const seen = new Set()

  for (const brand of brands) {
    const cleanSlug = brand.slug.replace(/-bike$/, '').replace(/-scooter$/, '')

    if (!LOGO_MAP[cleanSlug]) {
      console.log(`  ⏭  SKIP  ${cleanSlug} — no logo URL`)
      skipped++
      continue
    }

    const storagePath = `${cleanSlug}/logo.webp`

    if (seen.has(cleanSlug)) {
      // Multi-type brand (e.g. honda-bike + honda-scooter) — just update DB url
      const { data } = supabase.storage.from('brands').getPublicUrl(storagePath)
      await supabase.from('brands').update({ logo_url: data.publicUrl }).eq('id', brand.id)
      continue
    }
    seen.add(cleanSlug)

    process.stdout.write(`  ↓  ${cleanSlug} … `)

    try {
      const raw    = downloadViaCurl(LOGO_MAP[cleanSlug])
      const webp   = await processLogo(raw)
      const pubUrl = await uploadToStorage(webp, storagePath)

      const { error: uErr } = await supabase
        .from('brands').update({ logo_url: pubUrl }).eq('id', brand.id)
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
