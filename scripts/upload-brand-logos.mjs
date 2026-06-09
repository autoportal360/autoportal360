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

// clean brand-slug → direct Wikimedia Commons file URL (raw SVG or JPG, no /thumb/ paths).
// Wikimedia blocks thumbnail resize hotlinks. Direct file URLs (/wikipedia/commons/{hash}/{file}) work.
// SVGs are rasterized by sharp (libvips + librsvg). JPGs processed normally.
const LOGO_MAP = {
  'tata':          'https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg',
  'hyundai':       'https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg',
  'maruti-suzuki': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Suzuki_logo_2025_%28vertical%29.svg',
  'mahindra':      'https://upload.wikimedia.org/wikipedia/commons/8/89/Mahindra_logo.svg',
  'honda':         'https://upload.wikimedia.org/wikipedia/commons/3/38/Honda.svg',
  'royal-enfield': 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Royal_Enfield_logo.svg',
  'ktm':           'https://upload.wikimedia.org/wikipedia/commons/a/a9/KTM-Logo.svg',
  'ather':         'https://upload.wikimedia.org/wikipedia/commons/d/d1/Ather_New_Logo.jpg',
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
    '-sL',
    '--max-time', '20',
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
  }

  console.log(`\nDone — ${success} uploaded, ${skipped} skipped, ${failed} failed`)
}

main()
