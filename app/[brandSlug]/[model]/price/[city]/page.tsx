import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import { calculateOnRoad, formatPrice, formatPriceRange } from '@/lib/utils'
import { getCanonicalUrl } from '@/lib/seo'
import { getPageSeo } from '@/lib/page-seo'
import type { Brand, Spec } from '@/types'
import ModelSubNav from '../../ModelSubNav'
import PriceFaq from '../PriceFaq'
import EditSeoButton from '@/components/EditSeoButton'

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
  price_min: number | null
  price_max: number | null
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
  params: Promise<{ brandSlug: string; model: string; city: string }>
}): Promise<Metadata> {
  const { brandSlug, model: modelSlug, city: citySlug } = await params
  const parsed = parseSlug(brandSlug)
  if (!parsed) return { title: 'Not Found' }

  const brand = await getBrand(parsed.brandName, parsed.vehicleType)
  if (!brand) return { title: 'Brand Not Found' }

  const [{ data: model }, { data: city }] = await Promise.all([
    supabase.from('models').select('name, price_min').eq('brand_id', brand.id).eq('slug', modelSlug).single(),
    supabase.from('cities').select('name').eq('slug', citySlug).single(),
  ])
  if (!model || !city) return { title: 'Not Found' }

  const pageKey = `city-${brandSlug}-${modelSlug}-${citySlug}`
  const seo = await getPageSeo(pageKey)

  return {
    title: seo?.meta_title ?? `${brand.name} ${model.name} On-Road Price in ${city.name} 2026 | AutoPortal360`,
    description: seo?.meta_description ?? `${brand.name} ${model.name} on-road price in ${city.name}${model.price_min ? ` starts at ${formatPrice(model.price_min)}` : ''}. Full breakdown: ex-showroom, RTO, insurance, handling & FastTag.`,
    alternates: { canonical: getCanonicalUrl(`/${brandSlug}/${modelSlug}/price/${citySlug}/`) },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: `${brand.name} ${model.name} On-Road Price in ${city.name} 2026`,
      url: getCanonicalUrl(`/${brandSlug}/${modelSlug}/price/${citySlug}/`),
      type: 'website',
    },
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function CityPricePage({
  params,
}: {
  params: Promise<{ brandSlug: string; model: string; city: string }>
}) {
  const { brandSlug, model: modelSlug, city: citySlug } = await params

  const parsed = parseSlug(brandSlug)
  if (!parsed) notFound()
  const { brandName, vehicleType, vehicleLabel, listingHref } = parsed

  const brand = await getBrand(brandName, vehicleType)
  if (!brand) notFound()

  const pageKey = `city-${brandSlug}-${modelSlug}-${citySlug}`

  const [{ data: modelRaw }, { data: cityRaw }, seo] = await Promise.all([
    supabase.from('models').select('*').eq('brand_id', brand.id).eq('slug', modelSlug).single(),
    supabase.from('cities').select('id, name, slug, states(name, rto_percentage, handling_charge)').eq('slug', citySlug).single(),
    getPageSeo(pageKey),
  ])
  if (!modelRaw) notFound()
  if (!cityRaw) notFound()

  const model = modelRaw as unknown as ModelRow
  const city  = cityRaw as unknown as CityRow

  const { data: variantsRaw } = await supabase
    .from('variants').select('*, specs(*)').eq('model_id', model.id).order('sort_order')
  const variants = (variantsRaw ?? []) as unknown as VariantRow[]

  const baseVariant = variants.find(v => v.is_popular) ?? variants[0] ?? null

  const baseOnRoad = baseVariant && city.states
    ? calculateOnRoad(baseVariant.ex_showroom_price, city.states.rto_percentage, city.states.handling_charge)
    : null

  const priceLabel = model.price_min && model.price_max
    ? formatPriceRange(model.price_min, model.price_max)
    : model.price_min ? `From ${formatPrice(model.price_min)}` : null

  const stateName  = city.states?.name ?? ''
  const rtoRate    = city.states?.rto_percentage ?? 0
  const handling   = city.states?.handling_charge ?? 0

  const H2: React.CSSProperties = {
    fontFamily: 'Montserrat, sans-serif', fontSize: '20px',
    fontWeight: 800, letterSpacing: '-0.4px', margin: '0 0 6px',
  }
  const SUB: React.CSSProperties = { fontSize: '13px', color: '#8E99A8', margin: '0 0 20px' }

  return (
    <>
      {seo?.schema_jsonld && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.schema_jsonld }} />
      )}
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
          <Link href={`/${brandSlug}/${modelSlug}/price/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>Price</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>{city.name}</span>
        </div>

        {/* H1 */}
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 900,
          letterSpacing: '-0.8px', color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.15,
        }}>
          {seo?.h1 ? seo.h1 : <>{brand.name} {model.name}{' '}<span style={{ color: '#00D4FF' }}>On-Road Price in {city.name} 2026</span></>}
        </h1>
        {seo?.intro_text && (
          <p style={{ fontSize: '14px', color: '#C0C0C0', margin: '0 0 12px', lineHeight: 1.7 }}>{seo.intro_text}</p>
        )}
        {priceLabel && (
          <p style={{ fontSize: '15px', color: '#8E99A8', margin: '0 0 28px' }}>
            Ex-showroom: <span style={{ color: '#00D4FF', fontWeight: 700 }}>{priceLabel}</span>
            {stateName && <span style={{ marginLeft: '12px' }}>· {stateName} RTO: <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{rtoRate}%</span></span>}
          </p>
        )}

        {/* HERO PRICE CARD */}
        {baseOnRoad && baseVariant && (
          <div style={{
            background: 'linear-gradient(135deg,#0A1F44,#0d3a6e)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '20px', padding: '28px', marginBottom: '40px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>
                  {baseVariant.name} · {city.name}
                </div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '36px', fontWeight: 900, color: '#00D4FF', marginBottom: '8px', letterSpacing: '-1px' }}>
                  {formatPrice(baseOnRoad.total)}
                </div>
                <div style={{ fontSize: '13px', color: '#8E99A8' }}>
                  Total On-Road Price (est.) · {stateName}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                {[
                  { l: 'Ex-showroom',   v: formatPrice(baseOnRoad.ex_showroom) },
                  { l: `RTO (${rtoRate}%)`,  v: formatPrice(baseOnRoad.rto) },
                  { l: 'Insurance',     v: formatPrice(baseOnRoad.insurance) },
                  ...(baseOnRoad.tcs > 0 ? [{ l: 'TCS (1%)', v: formatPrice(baseOnRoad.tcs) }] : []),
                  { l: 'Handling',      v: formatPrice(baseOnRoad.handling) },
                  { l: 'FastTag',       v: formatPrice(baseOnRoad.fastag) },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '13px' }}>
                    <span style={{ color: '#8E99A8' }}>{r.l}</span>
                    <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button style={{ background: '#00D4FF', color: '#06142D', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '13px', padding: '11px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
                Get Best Price in {city.name}
              </button>
              <Link href={`/${brandSlug}/${modelSlug}/price/`} style={{ background: 'rgba(0,212,255,0.08)', color: '#00D4FF', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '13px', padding: '11px 22px', borderRadius: '10px', border: '1px solid rgba(0,212,255,0.2)', textDecoration: 'none' }}>
                Other Cities →
              </Link>
            </div>
          </div>
        )}

        {/* ── ALL VARIANTS ON-ROAD TABLE ── */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={H2}>All {model.name} Variants — <span style={{ color: '#00D4FF' }}>On-Road Price {city.name}</span></h2>
          <p style={SUB}>Including {stateName} RTO ({rtoRate}%) + insurance + handling</p>

          {variants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#8E99A8', background: '#0A1F44', borderRadius: '16px', border: '1px solid rgba(0,212,255,0.1)' }}>
              Variant data not available
            </div>
          ) : (
            <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.12)', borderRadius: '16px', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr auto auto auto auto', padding: '11px 20px', background: 'rgba(0,212,255,0.06)', borderBottom: '1px solid rgba(0,212,255,0.12)' }}>
                {['Variant', 'Fuel', 'Ex-showroom', `RTO (${rtoRate}%)`, 'On-Road Total'].map((h, i) => (
                  <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: i > 0 ? 'right' : 'left', paddingRight: i < 4 ? '16px' : '0' }}>{h}</span>
                ))}
              </div>
              {/* Rows */}
              {variants.map((v, i) => {
                const vOnRoad = city.states
                  ? calculateOnRoad(v.ex_showroom_price, city.states.rto_percentage, city.states.handling_charge)
                  : null
                return (
                  <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '2fr auto auto auto auto', padding: '14px 20px', alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(0,212,255,0.02)', borderBottom: i < variants.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}>
                    <div style={{ paddingRight: '16px' }}>
                      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{v.name}</span>
                      {v.is_popular && <span style={{ marginLeft: '7px', fontSize: '9px', fontWeight: 800, color: '#00D4FF', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', padding: '1px 7px', borderRadius: '20px', fontFamily: 'Montserrat, sans-serif', verticalAlign: 'middle' }}>POPULAR</span>}
                    </div>
                    <span style={{ fontSize: '12px', color: '#8E99A8', paddingRight: '16px', textAlign: 'right' }}>{v.fuel_type ?? '—'}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 600, color: '#FFFFFF', paddingRight: '16px', textAlign: 'right' }}>{formatPrice(v.ex_showroom_price)}</span>
                    <span style={{ fontSize: '13px', color: '#8E99A8', paddingRight: '16px', textAlign: 'right' }}>{vOnRoad ? formatPrice(vOnRoad.rto) : '—'}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 800, color: '#00D4FF', textAlign: 'right' }}>{vOnRoad ? formatPrice(vOnRoad.total) : '—'}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── CITY INFO BLOCK ── */}
        <section style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '16px', padding: '28px', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 800, margin: '0 0 16px' }}>
            On-Road Pricing in <span style={{ color: '#00D4FF' }}>{city.name}</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'State',              value: stateName || '—' },
              { label: 'Road Tax (RTO)',      value: `${rtoRate}%` },
              { label: 'Handling Charges',   value: formatPrice(handling) },
              { label: 'Insurance (approx)', value: '~3.5% ex-showroom' },
              { label: 'FastTag',            value: '₹500 (one-time)' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', color: '#8E99A8', marginBottom: '4px', fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#C0C0C0', lineHeight: 1.8 }}>
            The on-road price in {city.name} includes the ex-showroom price + {stateName} Road Tax at {rtoRate}% + comprehensive insurance + dealer handling of {formatPrice(handling)} + FastTag ₹500. Prices shown are estimates; actual charges may vary slightly by dealership. Visit your nearest {brand.name} showroom for the exact on-road price.
          </p>
        </section>

        {/* AD ZONE */}
        <div style={{ marginBottom: '48px' }}>
          <AdSlot zone="mid-feed-1" />
        </div>

        {/* ── SEO CONTENT (from page_seo) ── */}
        {seo?.seo_content && (
          <section
            style={{ color: '#C0C0C0', fontSize: '14px', lineHeight: 1.9, marginBottom: '48px' }}
            dangerouslySetInnerHTML={{ __html: seo.seo_content }}
          />
        )}

        {/* ── FAQ ── */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={H2}>Frequently Asked <span style={{ color: '#00D4FF' }}>Questions</span></h2>
          <p style={SUB}>{brand.name} {model.name} price in {city.name}</p>
          {seo?.faqs && seo.faqs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {seo.faqs.map((faq, i) => (
                <details key={i} style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                  <summary style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {faq.q}
                    <span style={{ color: '#00D4FF', fontSize: '18px', flexShrink: 0, marginLeft: '12px' }}>+</span>
                  </summary>
                  <div style={{ padding: '0 20px 16px', fontSize: '13px', color: '#C0C0C0', lineHeight: 1.7 }}>{faq.a}</div>
                </details>
              ))}
            </div>
          ) : city.states && baseVariant ? (
            <PriceFaq
              mode="city"
              brandName={brand.name}
              modelName={model.name}
              cityName={city.name}
              stateName={stateName}
              rtoPercentage={rtoRate}
              baseOnRoad={baseOnRoad?.total ?? null}
              baseVariantName={baseVariant.name}
            />
          ) : (
            <div style={{ color: '#8E99A8', fontSize: '14px' }}>FAQ data unavailable.</div>
          )}
        </section>

        <AdSlot zone="pre-footer" />

      </div>

      <div style={{ height: '48px' }} />
      <EditSeoButton pageKey={pageKey} existingId={seo?.id} />
    </>
  )
}
