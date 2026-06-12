import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import { formatPriceRange, formatPrice, calculateOnRoad } from '@/lib/utils'
import { getCanonicalUrl } from '@/lib/seo'
import type { Brand, Spec } from '@/types'
import ModelSubNav from './ModelSubNav'
import OnRoadCalculator, { type CalcVariant, type CalcCity } from './OnRoadCalculator'
import GetOffersButton from './GetOffersButton'
import ModelFaq from './ModelFaq'
import Image from 'next/image'
import { getPageSeo } from '@/lib/page-seo'
import EditSeoButton from '@/components/EditSeoButton'
import SchemaMarkup from '@/components/SchemaMarkup'
import { vehicleProductSchema, breadcrumbSchema, faqSchema } from '@/lib/schema'

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
}

type CityRow = {
  id: string
  name: string
  states: { rto_percentage: number; handling_charge: number } | null
}

type ModelRow = {
  id: string
  name: string
  slug: string
  type: VehicleType
  body_type: string | null
  segment: string | null
  status: 'active' | 'discontinued' | 'upcoming'
  price_min: number | null
  price_max: number | null
  thumbnail_url: string | null
  overview_html: string | null
  meta_title: string | null
  meta_description: string | null
}

// ─── Slug parsing (mirrors brand page) ───────────────────────────────────────

interface ParsedSlug {
  brandName: string
  vehicleType: VehicleType
  vehicleLabel: string
  listingHref: string
}

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
  const { data } = await supabase
    .from('brands').select('*')
    .eq('slug', slug).eq('type', type).eq('is_active', true).single()
  if (data) return data

  // Bikes/scooters may carry a type suffix in the DB slug to avoid unique constraint collisions
  if (type === 'bike' || type === 'scooter') {
    const { data: data2 } = await supabase
      .from('brands').select('*')
      .eq('slug', `${slug}-${type}`).eq('type', type).eq('is_active', true).single()
    return data2 ?? null
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
    .from('models')
    .select('name, meta_title, meta_description, price_min')
    .eq('brand_id', brand.id)
    .eq('slug', modelSlug)
    .single()
  if (!model) return { title: 'Not Found' }

  const priceStr = model.price_min ? ` starts at ${formatPrice(model.price_min)}` : ''
  const canonical = `/${brandSlug}/${modelSlug}/`
  const pageSeo = await getPageSeo(`model-${brandSlug}-${modelSlug}`)

  return {
    title: pageSeo?.meta_title ?? model.meta_title
      ?? `${brand.name} ${model.name} Price, Specs, Mileage 2026 | AutoPortal360`,
    description: pageSeo?.meta_description ?? model.meta_description
      ?? `${brand.name} ${model.name} price in India${priceStr}. Compare variants, specs, and mileage. Get on-road price in your city.`,
    alternates: { canonical: getCanonicalUrl(canonical) },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: `${brand.name} ${model.name} — Price, Specs & Mileage 2026`,
      url: getCanonicalUrl(canonical),
      type: 'website',
    },
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────


const RIVALS: Record<VehicleType, { name: string; href: string }[]> = {
  car: [
    { name: 'Maruti Suzuki Swift',   href: '/maruti-suzuki-cars/swift/'   },
    { name: 'Hyundai i20',           href: '/hyundai-cars/i20/'           },
    { name: 'Tata Nexon',            href: '/tata-cars/nexon/'            },
  ],
  bike: [
    { name: 'RE Classic 350',        href: '/royal-enfield-bikes/classic-350/' },
    { name: 'Bajaj Pulsar NS200',    href: '/bajaj-bikes/pulsar-ns200/'   },
    { name: 'Hero Splendor Plus',    href: '/hero-bikes/splendor-plus/'   },
  ],
  scooter: [
    { name: 'Honda Activa 6G',       href: '/honda-scooters/activa-6g/'  },
    { name: 'TVS Jupiter',           href: '/tvs-scooters/jupiter/'       },
    { name: 'Suzuki Access 125',     href: '/suzuki-scooters/access-125/' },
  ],
}

const SECTION_TITLE: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '20px', fontWeight: 800,
  letterSpacing: '-0.4px', margin: '0 0 6px',
}

const SECTION_SUB: React.CSSProperties = {
  fontSize: '13px', color: '#8E99A8', margin: '0 0 20px',
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ModelPage({
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

  const { data: model } = await supabase
    .from('models').select('*')
    .eq('brand_id', brand.id).eq('slug', modelSlug).single()
  if (!model) notFound()
  const m = model as unknown as ModelRow

  const pageKey = `model-${brandSlug}-${modelSlug}`

  // Parallel: variants, featured cities, page SEO
  const [{ data: variantsRaw }, { data: citiesRaw }, seo] = await Promise.all([
    supabase.from('variants').select('*').eq('model_id', m.id).order('sort_order'),
    supabase.from('cities').select('id, name, states(rto_percentage, handling_charge)').eq('is_featured', true).order('name'),
    getPageSeo(pageKey),
  ])

  const variants = (variantsRaw ?? []) as unknown as VariantRow[]
  const cities   = (citiesRaw  ?? []) as unknown as CityRow[]

  const primaryVariant = variants.find(v => v.is_popular) ?? variants[0] ?? null

  // Direct specs fetch — more reliable than PostgREST embedded join without FK
  let specsByVariantId: Record<string, Spec> = {}
  if (variants.length > 0) {
    const { data: allSpecsRaw } = await supabase
      .from('specs').select('*').in('variant_id', variants.map(v => v.id))
    specsByVariantId = Object.fromEntries(
      ((allSpecsRaw ?? []) as Spec[]).map(s => [s.variant_id, s])
    )
  }
  const specsData = primaryVariant ? (specsByVariantId[primaryVariant.id] ?? null) : null

  // Hero on-road estimate for Chandigarh (or first featured city)
  const heroCity   = cities.find(c => c.name === 'Chandigarh') ?? cities[0] ?? null
  const heroOnRoad = primaryVariant && heroCity?.states
    ? calculateOnRoad(
        primaryVariant.ex_showroom_price,
        heroCity.states.rto_percentage,
        heroCity.states.handling_charge,
      )
    : null

  const priceLabel = m.price_min && m.price_max
    ? formatPriceRange(m.price_min, m.price_max)
    : m.price_min ? `From ${formatPrice(m.price_min)}` : null

  const fuelTypes = [...new Set(variants.map(v => v.fuel_type).filter((t): t is string => t !== null))]

  // Props for client components
  const calcVariants: CalcVariant[] = variants.map(v => ({
    id: v.id, name: v.name, ex_showroom_price: v.ex_showroom_price,
  }))
  const calcCities: CalcCity[] = cities.map(c => ({
    id: c.id, name: c.name, states: c.states,
  }))

  const rivals = RIVALS[vehicleType]

  const modelCrumbs = [
    { name: 'Home', url: getCanonicalUrl('/') },
    { name: `New ${vehicleLabel}`, url: getCanonicalUrl(listingHref) },
    { name: brand.name, url: getCanonicalUrl(`/${brandSlug}/`) },
    { name: m.name, url: getCanonicalUrl(`/${brandSlug}/${modelSlug}/`) },
  ]
  const modelFaqItems = [
    {
      question: `What is the price of ${brand.name} ${m.name} in India?`,
      answer: priceLabel
        ? `The ${brand.name} ${m.name} is priced ${priceLabel} (ex-showroom India). It is available in ${variants.length} variant${variants.length !== 1 ? 's' : ''}.`
        : `Please visit the price page for the latest ${brand.name} ${m.name} pricing.`,
    },
    ...(specsData?.mileage_arai ? [{
      question: `What is the mileage of ${brand.name} ${m.name}?`,
      answer: `The ${brand.name} ${m.name} delivers an ARAI-certified mileage of ${specsData.mileage_arai} km/l for the ${primaryVariant?.name ?? 'base'} variant.`,
    }] : []),
    {
      question: `How many variants does ${brand.name} ${m.name} have?`,
      answer: `The ${brand.name} ${m.name} is available in ${variants.length} variant${variants.length !== 1 ? 's' : ''}${variants.length > 0 ? `: ${variants.slice(0, 4).map(v => v.name).join(', ')}${variants.length > 4 ? ' and more' : ''}` : ''}.`,
    },
  ]
  const autoSchemas = [
    vehicleProductSchema({
      name: m.name,
      brand: brand.name,
      description: `${brand.name} ${m.name} price in India${priceLabel ? ` ${priceLabel}` : ''}. Compare variants, specs and on-road price in your city.`,
      imageUrl: m.thumbnail_url,
      priceMin: m.price_min ?? 0,
      priceMax: m.price_max ?? m.price_min ?? 0,
      url: getCanonicalUrl(`/${brandSlug}/${modelSlug}/`),
      modelYear: 2026,
      bodyType: m.body_type,
      fuelType: primaryVariant?.fuel_type,
    }),
    breadcrumbSchema(modelCrumbs),
    faqSchema(modelFaqItems),
  ]

  return (
    <>
      {seo?.schema_jsonld ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.schema_jsonld }} />
      ) : (
        <SchemaMarkup schemas={autoSchemas} />
      )}
      <AdSlot zone="hero-billboard" />
      <ModelSubNav brandSlug={brandSlug} modelSlug={modelSlug} />

      <div className="model-layout" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 0' }}>

        {/* ── MAIN COLUMN ── */}
        <main style={{ minWidth: 0 }}>

          {/* BREADCRUMB */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8E99A8', marginBottom: '28px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href={listingHref} style={{ color: '#8E99A8', textDecoration: 'none' }}>New {vehicleLabel}</Link>
            <span>›</span>
            <Link href={`/${brandSlug}/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>{brand.name}</Link>
            <span>›</span>
            <span style={{ color: '#00D4FF' }}>{m.name}</span>
          </div>

          {/* ── MODEL HERO ── */}
          <section style={{
            background: 'linear-gradient(180deg,rgba(0,212,255,0.05) 0%,transparent 80%)',
            border: '1px solid rgba(0,212,255,0.08)',
            borderRadius: '20px', padding: '28px', marginBottom: '36px',
          }}>
            {/* Two-column: text left, image right */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Badges row */}
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#00D4FF', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', padding: '3px 10px', borderRadius: '20px', fontFamily: 'Montserrat, sans-serif' }}>
                    {brand.name}
                  </span>
                  {m.body_type && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8E99A8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: '20px' }}>
                      {m.body_type}
                    </span>
                  )}
                  {fuelTypes.map(ft => (
                    <span key={ft} style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: ft === 'Electric' ? 'rgba(0,255,128,0.08)' : 'rgba(0,212,255,0.06)', border: `1px solid ${ft === 'Electric' ? 'rgba(0,255,128,0.2)' : 'rgba(0,212,255,0.15)'}`, color: ft === 'Electric' ? '#00FF80' : '#8E99A8' }}>
                      {ft}
                    </span>
                  ))}
                  {specsData?.ncap_rating && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFB400', background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.2)', padding: '3px 10px', borderRadius: '20px' }}>
                      {specsData.ncap_rating} NCAP
                    </span>
                  )}
                </div>

                {/* H1 */}
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', color: '#FFFFFF', margin: '0 0 10px', lineHeight: 1.1 }}>
                  {seo?.h1 ? seo.h1 : <>{brand.name} <span style={{ color: '#00D4FF' }}>{m.name}</span></>}
                </h1>
                {seo?.intro_text && (
                  <p style={{ fontSize: '14px', color: '#C0C0C0', margin: '0 0 10px', lineHeight: 1.7 }}>{seo.intro_text}</p>
                )}

                {/* Price */}
                {priceLabel && (
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '22px', fontWeight: 900, color: '#00D4FF', marginBottom: '6px' }}>
                    {priceLabel}
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#8E99A8', marginLeft: '8px' }}>ex-showroom</span>
                  </div>
                )}

                {/* On-road estimate */}
                {heroOnRoad && heroCity && (
                  <div style={{ fontSize: '13px', color: '#C0C0C0', marginBottom: '20px' }}>
                    On-road in {heroCity.name}: <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{formatPrice(heroOnRoad.total)}</span>
                    <span style={{ color: '#8E99A8', marginLeft: '6px' }}>(est. for base variant)</span>
                  </div>
                )}

                {/* CTAs */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <GetOffersButton
                    modelId={m.id}
                    modelName={m.name}
                    brandName={brand.name}
                    modelSlug={modelSlug}
                    variants={calcVariants}
                    style={{ background: '#00D4FF', color: '#06142D', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '13px', padding: '11px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Get Offers
                  </GetOffersButton>
                  <a href="#on-road" style={{ background: 'rgba(0,212,255,0.08)', color: '#00D4FF', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '13px', padding: '11px 22px', borderRadius: '10px', border: '1px solid rgba(0,212,255,0.2)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    On-Road Price
                  </a>
                  <Link href="/compare/" style={{ background: 'rgba(255,255,255,0.04)', color: '#C0C0C0', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '13px', padding: '11px 22px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Compare
                  </Link>
                </div>
              </div>

              {/* Hero image */}
              {m.thumbnail_url && (
                <div style={{ width: '240px', flexShrink: 0 }}>
                  <div style={{ position: 'relative', width: '240px', height: '150px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.4)' }}>
                    <Image
                      src={m.thumbnail_url}
                      alt={`${brand.name} ${m.name}`}
                      fill
                      sizes="240px"
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Mileage',   value: specsData?.mileage_arai ? `${specsData.mileage_arai} km/l` : '—' },
                { label: 'Power',     value: specsData?.power_bhp ? `${specsData.power_bhp} bhp` : '—' },
                { label: 'Engine',    value: specsData?.engine_cc ? `${specsData.engine_cc} cc` : '—' },
                { label: 'NCAP',      value: specsData?.ncap_rating ?? '—' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', fontWeight: 900, color: '#00D4FF', marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8E99A8', fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── OVERVIEW ── */}
          <section id="overview" style={{ marginBottom: '48px', scrollMarginTop: '60px' }}>
            <h2 style={SECTION_TITLE}>Key <span style={{ color: '#00D4FF' }}>Specifications</span></h2>
            <p style={SECTION_SUB}>{primaryVariant ? `${primaryVariant.name} · popular variant` : 'Specifications'}</p>

            {specsData ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
                {([
                  { icon: '⚙️', label: 'Engine',           value: specsData.engine_cc ? `${specsData.engine_cc} cc` : null },
                  { icon: '⚡', label: 'Power',             value: specsData.power_bhp ? `${specsData.power_bhp} bhp` : null },
                  { icon: '🔄', label: 'Torque',            value: specsData.torque_nm ? `${specsData.torque_nm} Nm` : null },
                  { icon: '⛽', label: 'Mileage (ARAI)',    value: specsData.mileage_arai ? `${specsData.mileage_arai} km/l` : null },
                  { icon: '🪣', label: 'Fuel Tank',         value: specsData.fuel_tank_l ? `${specsData.fuel_tank_l} L` : null },
                  { icon: '💺', label: 'Seating',           value: specsData.seating ? `${specsData.seating} persons` : null },
                  { icon: '🧳', label: 'Boot Space',        value: specsData.boot_space_l ? `${specsData.boot_space_l} L` : null },
                  { icon: '↕️', label: 'Ground Clearance', value: specsData.ground_clearance_mm ? `${specsData.ground_clearance_mm} mm` : null },
                  { icon: '📐', label: 'Dimensions',        value: specsData.length_mm && specsData.width_mm && specsData.height_mm ? `${specsData.length_mm}×${specsData.width_mm}×${specsData.height_mm} mm` : null },
                  { icon: '↔️', label: 'Wheelbase',         value: specsData.wheelbase_mm ? `${specsData.wheelbase_mm} mm` : null },
                  { icon: '⚖️', label: 'Kerb Weight',       value: specsData.kerb_weight_kg ? `${specsData.kerb_weight_kg} kg` : null },
                  { icon: '🔘', label: 'Tyre Size',         value: specsData.tyre_size || null },
                  { icon: '🛡️', label: 'NCAP Rating',       value: specsData.ncap_rating || null },
                ] as { icon: string; label: string; value: string | null }[])
                  .filter(item => item.value !== null)
                  .map(item => (
                    <div key={item.label} style={{
                      background: '#0A1F44',
                      border: '1px solid rgba(0,212,255,0.1)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                    }}>
                      <div style={{ fontSize: '22px', marginBottom: '8px' }}>{item.icon}</div>
                      <div style={{ fontSize: '11px', color: '#8E99A8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{item.value}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px', color: '#8E99A8', fontSize: '14px', background: '#0A1F44', borderRadius: '16px', border: '1px solid rgba(0,212,255,0.08)' }}>
                Specifications not yet available
              </div>
            )}
          </section>

          {/* ── VARIANTS ── */}
          <section id="variants" style={{ marginBottom: '48px', scrollMarginTop: '60px' }}>
            <h2 style={SECTION_TITLE}>{m.name} <span style={{ color: '#00D4FF' }}>Variants</span></h2>
            <p style={SECTION_SUB}>{variants.length} variant{variants.length !== 1 ? 's' : ''} · ex-showroom prices</p>

            {variants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#8E99A8', fontSize: '14px', background: '#0A1F44', borderRadius: '16px', border: '1px solid rgba(0,212,255,0.08)' }}>
                Variant details coming soon
              </div>
            ) : (
              <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0', padding: '12px 20px', background: 'rgba(0,212,255,0.06)', borderBottom: '1px solid rgba(0,212,255,0.12)' }}>
                  {['Variant', 'Fuel', 'Trans.', 'Ex-showroom'].map(h => (
                    <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: h === 'Ex-showroom' ? 'right' : 'left', paddingRight: h !== 'Ex-showroom' ? '16px' : '0' }}>
                      {h}
                    </span>
                  ))}
                </div>
                {/* Rows */}
                {variants.map((v, i) => (
                  <div key={v.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                    padding: '14px 20px', alignItems: 'center',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(0,212,255,0.02)',
                    borderBottom: i < variants.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none',
                  }}>
                    <div style={{ paddingRight: '16px' }}>
                      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{v.name}</span>
                      {v.is_popular && (
                        <span style={{ marginLeft: '8px', fontSize: '9px', fontWeight: 800, color: '#00D4FF', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', padding: '1px 7px', borderRadius: '20px', fontFamily: 'Montserrat, sans-serif', verticalAlign: 'middle' }}>
                          POPULAR
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#8E99A8', paddingRight: '16px' }}>{v.fuel_type ?? '—'}</span>
                    <span style={{ fontSize: '12px', color: '#8E99A8', paddingRight: '16px' }}>{v.transmission ?? '—'}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 700, color: '#00D4FF', textAlign: 'right' }}>
                      {formatPrice(v.ex_showroom_price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── MILEAGE ── */}
          <section id="mileage" style={{ marginBottom: '48px', scrollMarginTop: '60px' }}>
            <h2 style={SECTION_TITLE}>{m.name} <span style={{ color: '#00D4FF' }}>Mileage</span></h2>
            <p style={SECTION_SUB}>ARAI-certified fuel efficiency · variant wise</p>

            {variants.filter(v => specsByVariantId[v.id]?.mileage_arai).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#8E99A8', fontSize: '14px', background: '#0A1F44', borderRadius: '16px', border: '1px solid rgba(0,212,255,0.08)' }}>
                Mileage data not yet available
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                {variants.filter(v => specsByVariantId[v.id]?.mileage_arai).map(v => (
                  <div key={v.id} style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '14px', padding: '18px 20px' }}>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 900, color: '#00D4FF', marginBottom: '4px' }}>
                      {specsByVariantId[v.id].mileage_arai}
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#8E99A8', marginLeft: '4px' }}>km/l</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600, marginBottom: '2px' }}>{v.name}</div>
                    {v.fuel_type && (
                      <div style={{ fontSize: '11px', color: '#8E99A8' }}>{v.fuel_type}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── COLOURS ── */}
          <section id="colours" style={{ marginBottom: '48px', scrollMarginTop: '60px' }}>
            <h2 style={SECTION_TITLE}>{m.name} <span style={{ color: '#00D4FF' }}>Colours</span></h2>
            <p style={SECTION_SUB}>Available colour options</p>
            <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.08)', borderRadius: '16px', padding: '36px', textAlign: 'center', color: '#8E99A8', fontSize: '14px' }}>
              Colour images coming soon — check at your nearest dealership for the latest options.
            </div>
          </section>

          {/* AD ZONE 2 */}
          <div style={{ marginBottom: '48px' }}>
            <AdSlot zone="mid-feed-1" />
          </div>

          {/* ── SEO CONTENT ── */}
          {seo?.seo_content && (
            <section
              style={{ color: '#C0C0C0', fontSize: '14px', lineHeight: 1.9, marginBottom: '48px' }}
              dangerouslySetInnerHTML={{ __html: seo.seo_content }}
            />
          )}

          {/* ── FAQs ── */}
          <section id="faqs" style={{ marginBottom: '48px', scrollMarginTop: '60px' }}>
            <h2 style={SECTION_TITLE}>Frequently Asked <span style={{ color: '#00D4FF' }}>Questions</span></h2>
            <p style={SECTION_SUB}>Common questions about {brand.name} {m.name}</p>
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
            ) : (
              <ModelFaq
                brandName={brand.name}
                modelName={m.name}
                vehicleLabel={vehicleLabel}
                priceMin={m.price_min}
                variantCount={variants.length}
                mileage={specsData?.mileage_arai ?? null}
                engineCc={specsData?.engine_cc ?? null}
              />
            )}
          </section>

          <AdSlot zone="pre-footer" />

        </main>

        {/* ── SIDEBAR ── */}
        <aside style={{ position: 'sticky', top: '58px' }}>

          {/* On-Road Calculator */}
          <div id="on-road">
            {calcVariants.length > 0 && calcCities.length > 0 ? (
              <OnRoadCalculator variants={calcVariants} cities={calcCities} />
            ) : (
              <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '16px', padding: '20px', marginBottom: '20px', color: '#8E99A8', fontSize: '13px', textAlign: 'center' }}>
                Pricing data loading…
              </div>
            )}
          </div>

          {/* Rivals */}
          <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.12)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 14px' }}>
              Popular <span style={{ color: '#00D4FF' }}>Rivals</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rivals.map(r => (
                <Link key={r.href} href={r.href} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px',
                  background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)',
                  borderRadius: '10px', textDecoration: 'none',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}>
                    {r.name}
                  </span>
                  <span style={{ color: '#00D4FF', fontSize: '14px' }}>→</span>
                </Link>
              ))}
              <Link href="/compare/" style={{
                display: 'block', textAlign: 'center', padding: '9px',
                fontSize: '12px', fontWeight: 700, color: '#00D4FF',
                fontFamily: 'Montserrat, sans-serif', textDecoration: 'none',
                border: '1px dashed rgba(0,212,255,0.2)', borderRadius: '10px',
                marginTop: '2px',
              }}>
                Compare all →
              </Link>
            </div>
          </div>

          {/* Get Offers */}
          <div style={{ background: 'linear-gradient(135deg,#0A1F44,#0d3a6e)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '16px', padding: '22px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              Limited Time
            </div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px', lineHeight: 1.3 }}>
              Get Best Offers on {brand.name} {m.name}
            </div>
            <div style={{ fontSize: '12px', color: '#C0C0C0', marginBottom: '16px', lineHeight: 1.5 }}>
              Exchange bonus · Corporate discount · Free accessories
            </div>
            <GetOffersButton
              modelId={m.id}
              modelName={m.name}
              brandName={brand.name}
              modelSlug={modelSlug}
              variants={calcVariants}
              style={{ width: '100%', background: '#00D4FF', color: '#06142D', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '13px', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
            >
              Get Best Price →
            </GetOffersButton>
          </div>

        </aside>
      </div>

      {/* bottom padding */}
      <div style={{ height: '48px' }} />
      <EditSeoButton pageKey={pageKey} existingId={seo?.id} />
    </>
  )
}
