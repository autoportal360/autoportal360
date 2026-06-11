import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import { formatPrice, formatPriceRange } from '@/lib/utils'
import type { Brand, Spec } from '@/types'
import ModelSubNav from '../ModelSubNav'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

type VehicleType = 'car' | 'bike' | 'scooter'

type VariantRow = {
  id: string
  name: string
  slug: string
  fuel_type: string | null
  transmission: string | null
  ex_showroom_price: number
  is_popular: boolean
  sort_order: number
}

type ModelRow = {
  id: string
  name: string
  slug: string
  type: VehicleType
  body_type: string | null
  segment: string | null
  price_min: number | null
  price_max: number | null
  thumbnail_url: string | null
  meta_title: string | null
  meta_description: string | null
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
  if (!brand) return { title: 'Brand Not Found' }

  const { data: model } = await supabase
    .from('models').select('name').eq('brand_id', brand.id).eq('slug', modelSlug).single()
  if (!model) return { title: 'Not Found' }

  const canonical = `/${brandSlug}/${modelSlug}/specs/`
  return {
    title: `${brand.name} ${model.name} Specs, Engine, Mileage 2026 | AutoPortal360`,
    description: `Complete specifications of ${brand.name} ${model.name} — engine displacement, power, torque, mileage, dimensions, ground clearance and more. Compare all variants.`,
    alternates: { canonical },
    openGraph: {
      title: `${brand.name} ${model.name} Full Specifications 2026`,
      url: `https://autoportal360.com${canonical}`,
      type: 'website',
    },
  }
}

// ─── Spec row definitions ─────────────────────────────────────────────────────

type SpecRowDef = {
  label: string
  icon: string
  get: (s: Spec) => string | null
}

const SPEC_ROWS: SpecRowDef[] = [
  { label: 'Engine',           icon: '⚙️', get: s => s.engine_cc ? `${s.engine_cc} cc` : null },
  { label: 'Power',            icon: '⚡', get: s => s.power_bhp ? `${s.power_bhp} bhp` : null },
  { label: 'Torque',           icon: '🔄', get: s => s.torque_nm ? `${s.torque_nm} Nm` : null },
  { label: 'Mileage (ARAI)',   icon: '⛽', get: s => s.mileage_arai ? `${s.mileage_arai} km/l` : null },
  { label: 'Fuel Tank',        icon: '🪣', get: s => s.fuel_tank_l ? `${s.fuel_tank_l} L` : null },
  { label: 'Seating',          icon: '💺', get: s => s.seating ? `${s.seating} persons` : null },
  { label: 'Boot Space',       icon: '🧳', get: s => s.boot_space_l ? `${s.boot_space_l} L` : null },
  { label: 'Ground Clearance', icon: '↕️', get: s => s.ground_clearance_mm ? `${s.ground_clearance_mm} mm` : null },
  { label: 'Dimensions (L×W×H)', icon: '📐', get: s => s.length_mm && s.width_mm && s.height_mm ? `${s.length_mm}×${s.width_mm}×${s.height_mm} mm` : null },
  { label: 'Wheelbase',        icon: '↔️', get: s => s.wheelbase_mm ? `${s.wheelbase_mm} mm` : null },
  { label: 'Kerb Weight',      icon: '⚖️', get: s => s.kerb_weight_kg ? `${s.kerb_weight_kg} kg` : null },
  { label: 'Tyre Size',        icon: '🔘', get: s => s.tyre_size || null },
  { label: 'NCAP Rating',      icon: '🛡️', get: s => s.ncap_rating || null },
]

// ─── Styles ───────────────────────────────────────────────────────────────────

const SECTION_TITLE: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '20px', fontWeight: 800,
  letterSpacing: '-0.4px', margin: '0 0 6px',
}
const SECTION_SUB: React.CSSProperties = {
  fontSize: '13px', color: '#8E99A8', margin: '0 0 20px',
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function SpecsPage({
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
    .from('models').select('*')
    .eq('brand_id', brand.id).eq('slug', modelSlug).single()
  if (!modelRaw) notFound()
  const m = modelRaw as unknown as ModelRow

  const { data: variantsRaw } = await supabase
    .from('variants').select('*').eq('model_id', m.id).order('sort_order')
  const variants = (variantsRaw ?? []) as unknown as VariantRow[]

  // Fetch all specs in one query
  let specsByVariantId: Record<string, Spec> = {}
  if (variants.length > 0) {
    const { data: allSpecsRaw } = await supabase
      .from('specs').select('*').in('variant_id', variants.map(v => v.id))
    specsByVariantId = Object.fromEntries(
      ((allSpecsRaw ?? []) as Spec[]).map(s => [s.variant_id, s])
    )
  }

  const primaryVariant = variants.find(v => v.is_popular) ?? variants[0] ?? null
  const primarySpec    = primaryVariant ? (specsByVariantId[primaryVariant.id] ?? null) : null

  // Only show variants that have specs
  const variantsWithSpecs = variants.filter(v => specsByVariantId[v.id])

  const priceLabel = m.price_min && m.price_max
    ? formatPriceRange(m.price_min, m.price_max)
    : m.price_min ? `From ${formatPrice(m.price_min)}` : null

  // Top 4 highlights from primary spec
  const highlights = primarySpec ? [
    { icon: '⚡', label: 'Max Power',   value: primarySpec.power_bhp ? `${primarySpec.power_bhp} bhp` : null },
    { icon: '⛽', label: 'Mileage',     value: primarySpec.mileage_arai ? `${primarySpec.mileage_arai} km/l` : null },
    { icon: '⚙️', label: 'Engine',      value: primarySpec.engine_cc ? `${primarySpec.engine_cc} cc` : null },
    { icon: '🛡️', label: 'NCAP Safety', value: primarySpec.ncap_rating || null },
  ].filter(h => h.value !== null) : []

  // FAQ data
  const faqs = [
    {
      q: `What is the engine displacement of ${brand.name} ${m.name}?`,
      a: primarySpec?.engine_cc
        ? `The ${brand.name} ${m.name} is powered by a ${primarySpec.engine_cc} cc engine. It produces ${primarySpec.power_bhp ?? '—'} bhp of max power and ${primarySpec.torque_nm ?? '—'} Nm of peak torque.`
        : `Engine details for the ${brand.name} ${m.name} will be updated soon.`,
    },
    {
      q: `What is the mileage of ${brand.name} ${m.name}?`,
      a: primarySpec?.mileage_arai
        ? `The ${brand.name} ${m.name} delivers an ARAI-certified mileage of ${primarySpec.mileage_arai} km/l. Actual mileage may vary depending on riding conditions, load, and maintenance.`
        : `ARAI mileage figures for the ${brand.name} ${m.name} will be updated soon.`,
    },
    {
      q: `What are the dimensions of ${brand.name} ${m.name}?`,
      a: primarySpec?.length_mm && primarySpec.width_mm && primarySpec.height_mm
        ? `The ${brand.name} ${m.name} measures ${primarySpec.length_mm} mm in length, ${primarySpec.width_mm} mm in width, and ${primarySpec.height_mm} mm in height. The wheelbase is ${primarySpec.wheelbase_mm ?? '—'} mm and ground clearance is ${primarySpec.ground_clearance_mm ?? '—'} mm.`
        : `Dimension data for the ${brand.name} ${m.name} will be updated soon.`,
    },
    {
      q: `What is the kerb weight of ${brand.name} ${m.name}?`,
      a: primarySpec?.kerb_weight_kg
        ? `The kerb weight of the ${brand.name} ${m.name} is ${primarySpec.kerb_weight_kg} kg. The tyre size is ${primarySpec.tyre_size ?? '—'}.`
        : `Weight specifications for the ${brand.name} ${m.name} will be updated soon.`,
    },
    {
      q: `Does ${brand.name} ${m.name} have an NCAP safety rating?`,
      a: primarySpec?.ncap_rating
        ? `Yes, the ${brand.name} ${m.name} has received a ${primarySpec.ncap_rating} NCAP safety rating, making it one of the safer ${vehicleLabel.toLowerCase()} in its segment.`
        : `The ${brand.name} ${m.name} has not been tested by NCAP yet, or results are not available at this time.`,
    },
  ]

  return (
    <>
      <AdSlot zone="hero-billboard" />
      <ModelSubNav brandSlug={brandSlug} modelSlug={modelSlug} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 0' }}>

        {/* BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8E99A8', marginBottom: '28px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href={listingHref} style={{ color: '#8E99A8', textDecoration: 'none' }}>New {vehicleLabel}</Link>
          <span>›</span>
          <Link href={`/${brandSlug}/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>{brand.name}</Link>
          <span>›</span>
          <Link href={`/${brandSlug}/${modelSlug}/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>{m.name}</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>Specs</span>
        </div>

        {/* H1 */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.8px', color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.2 }}>
            {brand.name} <span style={{ color: '#00D4FF' }}>{m.name}</span>{' '}
            <span style={{ color: '#C0C0C0', fontWeight: 700 }}>Specifications</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            {m.body_type && `${m.body_type} · `}
            {priceLabel && `${priceLabel} · `}
            {variantsWithSpecs.length} variant{variantsWithSpecs.length !== 1 ? 's' : ''} with specs
          </p>
        </div>

        {/* KEY HIGHLIGHTS */}
        {highlights.length > 0 && (
          <section style={{ marginBottom: '36px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
              {highlights.map(h => (
                <div key={h.label} style={{
                  background: 'linear-gradient(135deg,#0A1F44,rgba(0,212,255,0.06))',
                  border: '1px solid rgba(0,212,255,0.2)',
                  borderRadius: '14px', padding: '18px',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px',
                }}>
                  <span style={{ fontSize: '24px' }}>{h.icon}</span>
                  <div style={{ fontSize: '11px', color: '#8E99A8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h.label}</div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 900, color: '#00D4FF' }}>{h.value}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SPECS TABLE */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={SECTION_TITLE}>Complete <span style={{ color: '#00D4FF' }}>Specifications</span></h2>
          <p style={SECTION_SUB}>All variants · {brand.name} {m.name}</p>

          {variantsWithSpecs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#8E99A8', fontSize: '14px', background: '#0A1F44', borderRadius: '16px', border: '1px solid rgba(0,212,255,0.08)' }}>
              Specifications not yet available for this model.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: variantsWithSpecs.length > 1 ? `${300 + variantsWithSpecs.length * 160}px` : '100%' }}>
                {/* Header */}
                <thead>
                  <tr>
                    <th style={{
                      textAlign: 'left', padding: '14px 20px',
                      fontSize: '11px', fontWeight: 700, color: '#8E99A8',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
                      borderRadius: '12px 0 0 0', minWidth: '160px',
                    }}>
                      Specification
                    </th>
                    {variantsWithSpecs.map((v, i) => (
                      <th key={v.id} style={{
                        textAlign: 'center', padding: '14px 16px',
                        background: v.is_popular ? 'rgba(0,212,255,0.08)' : '#0A1F44',
                        border: '1px solid rgba(0,212,255,0.1)',
                        borderRadius: i === variantsWithSpecs.length - 1 ? '0 12px 0 0' : '0',
                        minWidth: '150px',
                      }}>
                        <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>{v.name}</div>
                        {v.is_popular && (
                          <div style={{ fontSize: '9px', fontWeight: 800, color: '#00D4FF', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Popular</div>
                        )}
                        <div style={{ fontSize: '11px', color: '#00D4FF', fontWeight: 700, marginTop: '3px', fontFamily: 'Montserrat, sans-serif' }}>
                          {formatPrice(v.ex_showroom_price)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Rows */}
                <tbody>
                  {SPEC_ROWS.map((row, ri) => {
                    const values = variantsWithSpecs.map(v => row.get(specsByVariantId[v.id]))
                    if (values.every(v => v === null)) return null
                    return (
                      <tr key={row.label} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(0,212,255,0.02)' }}>
                        <td style={{
                          padding: '13px 20px',
                          border: '1px solid rgba(0,212,255,0.06)',
                          fontSize: '13px', color: '#C0C0C0',
                        }}>
                          <span style={{ marginRight: '8px' }}>{row.icon}</span>
                          {row.label}
                        </td>
                        {variantsWithSpecs.map(v => (
                          <td key={v.id} style={{
                            padding: '13px 16px', textAlign: 'center',
                            border: '1px solid rgba(0,212,255,0.06)',
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '13px', fontWeight: 700,
                            color: row.get(specsByVariantId[v.id]) ? '#FFFFFF' : '#444',
                            background: v.is_popular ? 'rgba(0,212,255,0.03)' : 'transparent',
                          }}>
                            {row.get(specsByVariantId[v.id]) ?? '—'}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* AD ZONE */}
        <div style={{ marginBottom: '48px' }}>
          <AdSlot zone="mid-feed-1" />
        </div>

        {/* FAQ */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={SECTION_TITLE}>{m.name} <span style={{ color: '#00D4FF' }}>Specs FAQ</span></h2>
          <p style={SECTION_SUB}>Common specification questions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((faq, i) => (
              <details key={i} style={{
                background: '#0A1F44',
                border: '1px solid rgba(0,212,255,0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                <summary style={{
                  padding: '16px 20px',
                  fontSize: '14px', fontWeight: 700, color: '#FFFFFF',
                  fontFamily: 'Montserrat, sans-serif',
                  cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  {faq.q}
                  <span style={{ color: '#00D4FF', fontSize: '18px', flexShrink: 0, marginLeft: '12px' }}>+</span>
                </summary>
                <div style={{ padding: '0 20px 16px', fontSize: '13px', color: '#C0C0C0', lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <AdSlot zone="pre-footer" />

      </div>
      <div style={{ height: '48px' }} />
    </>
  )
}
