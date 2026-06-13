import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import { getCanonicalUrl } from '@/lib/seo'
import type { Brand } from '@/types'
import ModelSubNav from '../ModelSubNav'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

type VehicleType = 'car' | 'bike' | 'scooter'

type ModelRow = {
  id: string
  name: string
  slug: string
}

type ModelImageRow = {
  id: string
  url: string
  alt_text: string | null
  type: string
  sort_order: number
}

// ─── Slug parsing ─────────────────────────────────────────────────────────────

interface ParsedSlug { brandName: string; vehicleType: VehicleType; vehicleLabel: string; listingHref: string }

function parseSlug(brandSlug: string): ParsedSlug | null {
  if (brandSlug.endsWith('-cars'))
    return { brandName: brandSlug.slice(0, -5), vehicleType: 'car',     vehicleLabel: 'Cars',     listingHref: '/new-cars/'     }
  if (brandSlug.endsWith('-bikes'))
    return { brandName: brandSlug.slice(0, -6), vehicleType: 'bike',    vehicleLabel: 'Bikes',    listingHref: '/new-bikes/'    }
  if (brandSlug.endsWith('-scooters'))
    return { brandName: brandSlug.slice(0, -9), vehicleType: 'scooter', vehicleLabel: 'Scooters', listingHref: '/new-scooters/' }
  return null
}

const getBrand = cache(async (slug: string, type: VehicleType): Promise<Brand | null> => {
  const { data } = await supabase.from('brands').select('*')
    .eq('slug', slug).eq('type', type).eq('is_active', true).single()
  if (data) return data
  if (type === 'bike' || type === 'scooter') {
    const { data: d2 } = await supabase.from('brands').select('*')
      .eq('slug', `${slug}-${type}`).eq('type', type).eq('is_active', true).single()
    return d2 ?? null
  }
  return null
})

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brandSlug: string; model: string }>
}): Promise<Metadata> {
  const { brandSlug, model: modelSlug } = await params
  const parsed = parseSlug(brandSlug)
  if (!parsed) return { title: 'Not Found' }

  const brand = await getBrand(parsed.brandName, parsed.vehicleType)
  if (!brand) return { title: 'Not Found' }

  const { data: model } = await supabase
    .from('models').select('name').eq('brand_id', brand.id).eq('slug', modelSlug).single()
  if (!model) return { title: 'Not Found' }

  const canonical = `/${brandSlug}/${modelSlug}/images/`
  return {
    title: `${brand.name} ${model.name} Images 2026 — Exterior & Interior | AutoPortal360`,
    description: `${brand.name} ${model.name} image gallery — exterior, interior, colour and detail photos. High-quality images from all angles.`,
    alternates: { canonical: getCanonicalUrl(canonical) },
    openGraph: {
      title: `${brand.name} ${model.name} Images 2026`,
      url: getCanonicalUrl(canonical),
      type: 'website',
    },
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMAGE_TYPE_LABEL: Record<string, string> = {
  exterior: 'Exterior',
  interior: 'Interior',
  colour:   'Colour',
  detail:   'Detail',
}

const SECTION_TITLE: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '18px', fontWeight: 800,
  letterSpacing: '-0.3px', margin: '0 0 16px',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ImagesPage({
  params,
}: {
  params: Promise<{ brandSlug: string; model: string }>
}) {
  const { brandSlug, model: modelSlug } = await params

  const parsed = parseSlug(brandSlug)
  if (!parsed) notFound()
  const { brandName, vehicleType, vehicleLabel, listingHref } = parsed

  const brand = await getBrand(brandName, vehicleType)
  if (!brand) notFound()

  const { data: modelRaw } = await supabase
    .from('models').select('id, name, slug')
    .eq('brand_id', brand.id).eq('slug', modelSlug).single()
  if (!modelRaw) notFound()
  const m = modelRaw as unknown as ModelRow

  const { data: imagesRaw } = await supabase
    .from('model_images')
    .select('*')
    .eq('model_id', m.id)
    .order('sort_order')

  const images = (imagesRaw ?? []) as ModelImageRow[]

  // Group images by type, maintaining sort order within each group
  const IMAGE_TYPE_ORDER = ['exterior', 'interior', 'colour', 'detail']
  const byType: Record<string, ModelImageRow[]> = {}
  for (const img of images) {
    const key = img.type ?? 'exterior'
    if (!byType[key]) byType[key] = []
    byType[key].push(img)
  }
  // Also collect any unknown types
  const allTypes = IMAGE_TYPE_ORDER.filter(t => byType[t]?.length)
    .concat(Object.keys(byType).filter(t => !IMAGE_TYPE_ORDER.includes(t) && byType[t]?.length))

  return (
    <div>
      <ModelSubNav brandSlug={brandSlug} modelSlug={modelSlug} />

      <AdSlot zone="hero-billboard" />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 48px' }}>

        {/* ── Breadcrumb ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8E99A8', marginBottom: '28px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href={listingHref} style={{ color: '#8E99A8', textDecoration: 'none' }}>New {vehicleLabel}</Link>
          <span>›</span>
          <Link href={`/${brandSlug}/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>{brand.name}</Link>
          <span>›</span>
          <Link href={`/${brandSlug}/${modelSlug}/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>{m.name}</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>Images</span>
        </div>

        {/* ── H1 ── */}
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.8px', color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.2 }}>
          {brand.name} {m.name} <span style={{ color: '#00D4FF' }}>Images</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#8E99A8', margin: '0 0 36px' }}>
          {images.length > 0 ? `${images.length} photos` : 'Exterior, interior and detail photos'}
        </p>

        {images.length === 0 ? (
          <div style={{
            background: '#0A1F44', border: '1px solid rgba(0,212,255,0.08)',
            borderRadius: '16px', padding: '64px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
            <p style={{ color: '#8E99A8', fontSize: '14px', margin: 0 }}>
              Images coming soon. Check back after the next update.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

            {allTypes.map(type => (
              <section key={type}>
                <h2 style={SECTION_TITLE}>
                  {IMAGE_TYPE_LABEL[type] ?? type.charAt(0).toUpperCase() + type.slice(1)}{' '}
                  <span style={{ color: '#00D4FF' }}>Photos</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#8E99A8', marginLeft: '10px' }}>
                    ({byType[type].length})
                  </span>
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px',
                }}>
                  {byType[type].map((img, idx) => (
                    <div key={img.id} style={{
                      borderRadius: '14px', overflow: 'hidden',
                      background: '#0A1F44',
                      border: '1px solid rgba(0,212,255,0.1)',
                      aspectRatio: idx === 0 && byType[type].length >= 3 ? '16/9' : '4/3',
                      gridColumn: idx === 0 && byType[type].length >= 3 ? 'span 2' : undefined,
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.alt_text ?? `${brand.name} ${m.name} ${IMAGE_TYPE_LABEL[type] ?? type} photo ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}

          </div>
        )}

      </div>

      <AdSlot zone="pre-footer" />
    </div>
  )
}
