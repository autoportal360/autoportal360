import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import { calculateOnRoad, formatPrice, formatPriceRange } from '@/lib/utils'
import type { Brand, Spec } from '@/types'
import ModelSubNav from '../ModelSubNav'
import PriceCalculator, { type PriceVariant, type PriceCity } from './PriceCalculator'
import PriceFaq from './PriceFaq'

export const dynamic = 'force-dynamic'

// ─── Local types ──────────────────────────────────────────────────────────────

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
  specs: Spec[]
}

type CityRow = {
  id: string
  name: string
  slug: string
  states: { name: string; rto_percentage: number; handling_charge: number } | null
}

type ModelRow = {
  id: string
  name: string
  slug: string
  type: VehicleType
  body_type: string | null
  price_min: number | null
  price_max: number | null
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

  const { data: model } = await supabase.from('models')
    .select('name, price_min').eq('brand_id', brand.id).eq('slug', modelSlug).single()
  if (!model) return { title: 'Not Found' }

  return {
    title: `${brand.name} ${model.name} Price in India, On-Road Price 2026 | AutoPortal360`,
    description: `${brand.name} ${model.name} on-road price in India${model.price_min ? ` starts at ${formatPrice(model.price_min)}` : ''}. Compare ex-showroom price, RTO, insurance, and total on-road price across all major cities.`,
    alternates: { canonical: `/${brandSlug}/${modelSlug}/price/` },
    openGraph: {
      title: `${brand.name} ${model.name} Price in India 2026 — On-Road Calculator`,
      url: `https://autoportal360.com/${brandSlug}/${modelSlug}/price/`,
      type: 'website',
    },
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function PricePage({
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

  const { data: modelRaw } = await supabase.from('models').select('*')
    .eq('brand_id', brand.id).eq('slug', modelSlug).single()
  if (!modelRaw) notFound()
  const model = modelRaw as unknown as ModelRow

  const [{ data: variantsRaw }, { data: citiesRaw }] = await Promise.all([
    supabase.from('variants').select('*, specs(*)').eq('model_id', model.id).order('sort_order'),
    supabase.from('cities')
      .select('id, name, slug, states(name, rto_percentage, handling_charge)')
      .eq('is_featured', true).order('name'),
  ])

  const variants = (variantsRaw ?? []) as unknown as VariantRow[]
  const cities   = (citiesRaw  ?? []) as unknown as CityRow[]

  const baseVariant = variants.find(v => v.is_popular) ?? variants[0] ?? null
  const refCity     = cities.find(c => c.name === 'Chandigarh') ?? cities[0] ?? null
  const refCityName = refCity?.name ?? 'Chandigarh'

  const refOnRoad = baseVariant && refCity?.states
    ? calculateOnRoad(baseVariant.ex_showroom_price, refCity.states.rto_percentage, refCity.states.handling_charge)
    : null

  const priceLabel = model.price_min && model.price_max
    ? formatPriceRange(model.price_min, model.price_max)
    : model.price_min ? `From ${formatPrice(model.price_min)}` : null

  // Props for client calculator
  const calcVariants: PriceVariant[] = variants.map(v => ({
    id: v.id, name: v.name, ex_showroom_price: v.ex_showroom_price,
    fuel_type: v.fuel_type, is_popular: v.is_popular,
  }))
  const calcCities: PriceCity[] = cities.map(c => ({
    id: c.id, name: c.name, slug: c.slug, states: c.states,
  }))

  const H2: React.CSSProperties = {
    fontFamily: 'Montserrat, sans-serif', fontSize: '20px',
    fontWeight: 800, letterSpacing: '-0.4px', margin: '0 0 6px',
  }
  const SUB: React.CSSProperties = { fontSize: '13px', color: '#8E99A8', margin: '0 0 20px' }

  return (
    <>
      <ModelSubNav brandSlug={brandSlug} modelSlug={modelSlug} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 0' }}>

        {/* BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8E99A8', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href={listingHref} style={{ color: '#8E99A8', textDecoration: 'none' }}>New {vehicleLabel}</Link>
          <span>›</span>
          <Link href={`/${brandSlug}/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>{brand.name}</Link>
          <span>›</span>
          <Link href={`/${brandSlug}/${modelSlug}/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>{model.name}</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>Price</span>
        </div>

        {/* H1 */}
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 900,
          letterSpacing: '-0.8px', color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.15,
        }}>
          {brand.name} {model.name}{' '}
          <span style={{ color: '#00D4FF' }}>Price in India 2026</span>
        </h1>
        {priceLabel && (
          <p style={{ fontSize: '15px', color: '#8E99A8', margin: '0 0 28px' }}>
            Ex-showroom price: <span style={{ color: '#00D4FF', fontWeight: 700 }}>{priceLabel}</span>
          </p>
        )}

        {/* AD ZONE */}
        <div style={{ marginBottom: '32px' }}>
          <AdSlot zone="hero-billboard" />
        </div>

        {/* ── PRICE CALCULATOR ── */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={H2}>{model.name} <span style={{ color: '#00D4FF' }}>On-Road Price Calculator</span></h2>
          <p style={SUB}>Select your variant and city to see the exact on-road price breakdown</p>
          {calcVariants.length > 0 && calcCities.length > 0 ? (
            <PriceCalculator variants={calcVariants} cities={calcCities} />
          ) : (
            <div style={{ textAlign: 'center', padding: '48px', color: '#8E99A8', background: '#0A1F44', borderRadius: '16px', border: '1px solid rgba(0,212,255,0.1)' }}>
              Price data loading…
            </div>
          )}
        </section>

        {/* ── ALL VARIANTS PRICE TABLE ── */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={H2}>{model.name} <span style={{ color: '#00D4FF' }}>Variants Price</span></h2>
          <p style={SUB}>Ex-showroom price · On-road {refCityName} (est.)</p>

          {variants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#8E99A8', background: '#0A1F44', borderRadius: '16px', border: '1px solid rgba(0,212,255,0.1)' }}>
              Variant data not available
            </div>
          ) : (
            <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.12)', borderRadius: '16px', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr auto auto auto auto', padding: '11px 20px', background: 'rgba(0,212,255,0.06)', borderBottom: '1px solid rgba(0,212,255,0.12)', gap: '0' }}>
                {['Variant', 'Fuel', 'Trans.', `Ex-showroom`, `On-Road (${refCityName})`].map((h, i) => (
                  <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: i > 1 ? 'right' : 'left', paddingRight: i < 4 ? '16px' : '0' }}>{h}</span>
                ))}
              </div>
              {/* Rows */}
              {variants.map((v, i) => {
                const vOnRoad = refCity?.states
                  ? calculateOnRoad(v.ex_showroom_price, refCity.states.rto_percentage, refCity.states.handling_charge)
                  : null
                return (
                  <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '2fr auto auto auto auto', padding: '13px 20px', alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(0,212,255,0.02)', borderBottom: i < variants.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}>
                    <div style={{ paddingRight: '16px' }}>
                      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{v.name}</span>
                      {v.is_popular && <span style={{ marginLeft: '7px', fontSize: '9px', fontWeight: 800, color: '#00D4FF', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', padding: '1px 7px', borderRadius: '20px', fontFamily: 'Montserrat, sans-serif', verticalAlign: 'middle' }}>POPULAR</span>}
                    </div>
                    <span style={{ fontSize: '12px', color: '#8E99A8', paddingRight: '16px', textAlign: 'right' }}>{v.fuel_type ?? '—'}</span>
                    <span style={{ fontSize: '12px', color: '#8E99A8', paddingRight: '16px', textAlign: 'right' }}>{v.transmission ?? '—'}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 700, color: '#FFFFFF', paddingRight: '16px', textAlign: 'right' }}>{formatPrice(v.ex_showroom_price)}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 800, color: '#00D4FF' }}>
                        {vOnRoad ? formatPrice(vOnRoad.total) : '—'}
                      </span>
                      <a href="#" style={{ fontSize: '10px', fontWeight: 700, color: '#8E99A8', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.1)', padding: '2px 8px', borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Get Offers
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── CITY-WISE PRICE TABLE ── */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={H2}>{model.name} <span style={{ color: '#00D4FF' }}>On-Road Price</span> by City</h2>
          <p style={SUB}>
            Based on {baseVariant?.name ?? 'base variant'} · Click a city for full breakdown
          </p>

          {cities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#8E99A8', background: '#0A1F44', borderRadius: '16px', border: '1px solid rgba(0,212,255,0.1)' }}>
              City data not available
            </div>
          ) : (
            <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.12)', borderRadius: '16px', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', padding: '11px 20px', background: 'rgba(0,212,255,0.06)', borderBottom: '1px solid rgba(0,212,255,0.12)', gap: '0' }}>
                {['City', 'State', 'RTO %', 'On-Road Price'].map((h, i) => (
                  <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: i > 1 ? 'right' : 'left', paddingRight: i < 3 ? '16px' : '0' }}>{h}</span>
                ))}
              </div>
              {/* Rows */}
              {cities.map((city, i) => {
                const cityOnRoad = baseVariant && city.states
                  ? calculateOnRoad(baseVariant.ex_showroom_price, city.states.rto_percentage, city.states.handling_charge)
                  : null
                return (
                  <Link
                    key={city.id}
                    href={`/${brandSlug}/${modelSlug}/price/${city.slug}/`}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr auto auto',
                      padding: '13px 20px', alignItems: 'center', textDecoration: 'none',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(0,212,255,0.02)',
                      borderBottom: i < cities.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 700, color: '#00D4FF', paddingRight: '16px' }}>
                      {city.name} →
                    </span>
                    <span style={{ fontSize: '13px', color: '#8E99A8', paddingRight: '16px' }}>
                      {city.states?.name ?? '—'}
                    </span>
                    <span style={{ fontSize: '13px', color: '#8E99A8', paddingRight: '16px', textAlign: 'right' }}>
                      {city.states?.rto_percentage ?? '—'}%
                    </span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 800, color: '#FFFFFF', textAlign: 'right' }}>
                      {cityOnRoad ? formatPrice(cityOnRoad.total) : '—'}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* AD ZONE */}
        <div style={{ marginBottom: '48px' }}>
          <AdSlot zone="mid-feed-1" />
        </div>

        {/* ── SEO CONTENT ── */}
        <section style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '16px', padding: '32px', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '20px', margin: '0 0 20px' }}>
            About <span style={{ color: '#00D4FF' }}>{brand.name} {model.name} Price</span> in India
          </h2>
          <div style={{ color: '#C0C0C0', fontSize: '14px', lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0 }}>
              The {brand.name} {model.name} is priced {priceLabel ? `between ${priceLabel}` : 'competitively'} (ex-showroom, India). The ex-showroom price is the manufacturer&rsquo;s list price before state-level registration tax (RTO), insurance, and handling charges.
            </p>
            <p style={{ margin: 0 }}>
              The on-road price varies by city because each state levies a different Road Tax (RTO). For example, Delhi charges 4–8% on cars below ₹6 Lakh, while Maharashtra can charge up to 15% on some vehicles. States like Himachal Pradesh and Uttarakhand tend to have lower road taxes, making on-road prices cheaper there.
            </p>
            <p style={{ margin: 0 }}>
              In addition to RTO, the on-road price includes a mandatory 3rd-party insurance premium (fixed by IRDAI), a comprehensive own-damage premium (~2–3.5% of ex-showroom), dealer handling charges (₹3,000–₹10,000), and FastTag (₹500). For vehicles above ₹10 Lakh ex-showroom, 1% TCS (Tax Collected at Source) also applies — this is claimable as a tax credit.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={H2}>Frequently Asked <span style={{ color: '#00D4FF' }}>Questions</span></h2>
          <p style={SUB}>Common questions about {brand.name} {model.name} price in India</p>
          <PriceFaq
            mode="general"
            brandName={brand.name}
            modelName={model.name}
            priceMin={model.price_min}
            priceMax={model.price_max}
            baseOnRoad={refOnRoad?.total ?? null}
          />
        </section>

        <AdSlot zone="pre-footer" />

      </div>

      <div style={{ height: '48px' }} />
    </>
  )
}
