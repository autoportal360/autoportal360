/**
 * upload-brand-logos.mjs
 * Downloads brand logos, resizes to 200x200 WebP, uploads to Supabase Storage,
 * and updates brands.logo_url.
 */

import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import sharp from 'sharp'

const SUPABASE_URL = 'https://qmhnfdyjisxjhhrdfvqp.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtaG5mZHlqaXN4amhocmRmdnFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgxNDI2NiwiZXhwIjoyMDk2MzkwMjY2fQ.Z81S2Tfv2db_5aOzuC4muR7RXbwfR4oVIrR60dSpgG4'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// brand-slug (DB normalised) → logo URL
// Using picsum seeded placeholders — replace with real logo URLs when available.
const LOGO_MAP = {
  'tata':           'https://picsum.photos/seed/tata-logo/200/200',
  'hyundai':        'https://picsum.photos/seed/hyundai-logo/200/200',
  'maruti-suzuki':  'https://picsum.photos/seed/maruti-logo/200/200',
  'royal-enfield':  'https://picsum.photos/seed/re-logo/200/200',
  'bajaj':          'https://picsum.photos/seed/bajaj-logo/200/200',
  'hero':           'https://picsum.photos/seed/hero-logo/200/200',
  'honda':          'https://picsum.photos/seed/honda-logo/200/200',
  'ktm':            'https://picsum.photos/seed/ktm-logo/200/200',
  'tvs':            'https://picsum.photos/seed/tvs-logo/200/200',
  'ather':          'https://picsum.photos/seed/ather-logo/200/200',
  'ola-electric':   'https://picsum.photos/seed/ola-logo/200/200',
  'mahindra':       'https://picsum.photos/seed/mahindra-logo/200/200',
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

async function processLogo(buffer) {
  return sharp(buffer)
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
  console.log('Fetching brands from Supabase…')
  const { data: brands, error } = await supabase
    .from('brands').select('id, slug, name').eq('is_active', true)
  if (error) { console.error(error.message); process.exit(1) }

  let success = 0, skipped = 0, failed = 0

  // Deduplicate by clean slug so multi-type brands (honda-bike, honda-scooter) only upload once
  const seen = new Set()

  for (const brand of brands) {
    const cleanSlug = brand.slug.replace(/-bike$/, '').replace(/-scooter$/, '')

    if (seen.has(cleanSlug)) {
      // Still update logo_url for this brand row if we already uploaded the logo
      const storagePath = `${cleanSlug}/logo.webp`
      const { data } = supabase.storage.from('brands').getPublicUrl(storagePath)
      await supabase.from('brands').update({ logo_url: data.publicUrl }).eq('id', brand.id)
      continue
    }
    seen.add(cleanSlug)

    if (!LOGO_MAP[cleanSlug]) {
      console.log(`  ⏭  SKIP  ${cleanSlug} — no logo mapped`)
      skipped++
      continue
    }

    const storagePath = `${cleanSlug}/logo.webp`
    process.stdout.write(`  ↓  ${cleanSlug} … `)

    try {
      const raw    = await downloadImage(LOGO_MAP[cleanSlug])
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
