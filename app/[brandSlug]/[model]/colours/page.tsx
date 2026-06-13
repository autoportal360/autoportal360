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
  thumbnail_url: string | null
}

type ModelColourRow = {
  id: string
  name: string
  hex_code: string | null
  image_url: string | null
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

  const canonical = `/${brandSlug}/${modelSlug}/colours/`
  return {
    title: `${brand.name} ${model.name} Colour Options 2026 | AutoPortal360`,
    description: `All available colour options for ${brand.name} ${model.name} in India 2026. View colour swatches, names and availability.`,
    alternates: { canonical: getCanonicalUrl(canonical) },
    openGraph: {
      title: `${brand.name} ${model.name} Colours 2026`,
      url: getCanonicalUrl(canonical),
      type: 'website',
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SECTION_TITLE: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '20px', fontWeight: 800,
  letterSpacing: '-0.4px', margin: '0 0 6px',
}

export default async function ColoursPage({
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
    .from('models').select('id, name, slug, thumbnail_url')
    .eq('brand_id', brand.id).eq('slug', modelSlug).single()
  if (!modelRaw) notFound()
  const m = modelRaw as unknown as ModelRow

  const { data: coloursRaw } = await supabase
    .from('model_colours')
    .select('*')
    .eq('model_id', m.id)
    .order('sort_order')

  const colours = (coloursRaw ?? []) as ModelColourRow[]

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
          <span style={{ color: '#00D4FF' }}>Colours</span>
        </div>

        {/* ── H1 ── */}
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.8px', color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.2 }}>
          {brand.name} {m.name} <span style={{ color: '#00D4FF' }}>Colour Options</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#8E99A8', margin: '0 0 36px' }}>
          {colours.length > 0
            ? `${colours.length} colour${colours.length !== 1 ? 's' : ''} available in India`
            : 'All available colour options'}
        </p>

        {/* ── Colour Grid ── */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={SECTION_TITLE}>
            Available <span style={{ color: '#00D4FF' }}>Colours</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: '0 0 24px' }}>
            Actual colours may vary. Check at your nearest dealership.
          </p>

          {colours.length === 0 ? (
            <div style={{
              background: '#0A1F44', border: '1px solid rgba(0,212,255,0.08)',
              borderRadius: '16px', padding: '56px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎨</div>
              <p style={{ color: '#8E99A8', fontSize: '14px', margin: 0 }}>
                Colour options coming soon. Check with your nearest {brand.name} dealership.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '20px',
            }}>
              {colours.map(colour => (
                <div key={colour.id} style={{
                  background: '#0A1F44',
                  border: '1px solid rgba(0,212,255,0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {/* Swatch area — image if available, otherwise solid hex */}
                  {colour.image_url ? (
                    <div style={{ height: '140px', overflow: 'hidden', background: '#111' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={colour.image_url}
                        alt={`${brand.name} ${m.name} in ${colour.name}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      height: '140px',
                      background: colour.hex_code ?? '#1a1a2e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {/* Subtle sheen overlay */}
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)',
                        border: '2px solid rgba(255,255,255,0.15)',
                      }} />
                    </div>
                  )}

                  {/* Colour info */}
                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {colour.hex_code && (
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                          background: colour.hex_code,
                          border: '2px solid rgba(255,255,255,0.15)',
                        }} />
                      )}
                      <span style={{
                        fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 700,
                        color: '#FFFFFF', lineHeight: 1.3,
                      }}>
                        {colour.name}
                      </span>
                    </div>
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(0,204,102,0.08)', border: '1px solid rgba(0,204,102,0.2)',
                      color: '#00CC66', fontSize: '10px', fontWeight: 700,
                      padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase',
                    }}>
                      Available
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Note ── */}
        <div style={{
          background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: '12px', padding: '16px 20px', marginBottom: '48px',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>ℹ️</span>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0, lineHeight: 1.7 }}>
            Colour availability may vary by variant and state. Some colours may carry a premium.
            Visit your nearest {brand.name} dealership to see the actual colour before purchasing.
          </p>
        </div>

      </div>

      <AdSlot zone="pre-footer" />
    </div>
  )
}
