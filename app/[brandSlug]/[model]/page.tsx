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
import ModelHeroImage from '@/components/ModelHeroImage'
import ModelStickyBar from '@/components/ModelStickyBar'
import { getPageSeo } from '@/lib/page-seo'
import EditSeoButton from '@/components/EditSeoButton'
import SchemaMarkup from '@/components/SchemaMarkup'
import { vehicleProductSchema, breadcrumbSchema, faqSchema } from '@/lib/schema'
import TrackRecentView from '@/components/TrackRecentView'
import VariantAccordion from '@/components/model/VariantAccordion'
import ProsConsCard from '@/components/model/ProsConsCard'
import RatingBreakdown from '@/components/model/RatingBreakdown'
import SimilarCars from '@/components/model/SimilarCars'
import LatestUpdates from '@/components/model/LatestUpdates'

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

type ModelImageRow = {
  id: string
  url: string
  alt_text: string | null
  type: string
  sort_order: number
}

type ModelColourRow = {
  id: string
  name: string
  hex_code: string | null
  image_url: string | null
  sort_order: number
}

// ─── Slug parsing ─────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  const [{ data: variantsRaw }, { data: citiesRaw }, seo, { data: imagesRaw }, { data: coloursRaw }] = await Promise.all([
    supabase.from('variants').select('*').eq('model_id', m.id).order('sort_order'),
    supabase.from('cities').select('id, name, states(rto_percentage, handling_charge)').eq('is_featured', true).order('name'),
    getPageSeo(pageKey),
    supabase.from('model_images').select('*').eq('model_id', m.id).order('sort_order'),
    supabase.from('model_colours').select('*').eq('model_id', m.id).order('sort_order'),
  ])

  const variants     = (variantsRaw  ?? []) as unknown as VariantRow[]
  const cities       = (citiesRaw    ?? []) as unknown as CityRow[]
  const modelImages  = (imagesRaw    ?? []) as ModelImageRow[]
  const modelColours = (coloursRaw   ?? []) as ModelColourRow[]

  const primaryVariant = variants.find(v => v.is_popular) ?? variants[0] ?? null

  let specsByVariantId: Record<string, Spec> = {}
  if (variants.length > 0) {
    const { data: allSpecsRaw } = await supabase
      .from('specs').select('*').in('variant_id', variants.map(v => v.id))
    specsByVariantId = Object.fromEntries(
      ((allSpecsRaw ?? []) as Spec[]).map(s => [s.variant_id, s])
    )
  }
  const specsData = primaryVariant ? (specsByVariantId[primaryVariant.id] ?? null) : null

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

  const calcVariants: CalcVariant[] = variants.map(v => ({
    id: v.id, name: v.name, ex_showroom_price: v.ex_showroom_price,
  }))
  const calcCities: CalcCity[] = cities.map(c => ({
    id: c.id, name: c.name, states: c.states,
  }))

  const rivals = RIVALS[vehicleType]

  const modelPros = [
    specsData?.mileage_arai
      ? `Excellent fuel efficiency — ${specsData.mileage_arai} km/l (ARAI certified)`
      : 'Competitive fuel economy for the segment',
    variants.length > 1
      ? `Wide variant range — ${variants.length} options from budget to premium`
      : 'Well-equipped for the price',
    m.price_min
      ? `Value for money pricing from ${formatPrice(m.price_min)} ex-showroom`
      : 'Aggressive pricing for its segment',
    'Strong resale value and wide service network across India',
    specsData?.seating
      ? `${specsData.seating}-seater cabin with practical storage space`
      : 'Spacious and practical cabin layout',
  ]

  const modelCons = [
    'Rear seat comfort could be improved for long highway journeys',
    'Road and wind noise (NVH) levels are average at highway speeds',
    'Advanced driver-assistance features limited to top trims only',
    'Boot space could be more generous for family use',
    'Wireless Android Auto / Apple CarPlay not standard across all variants',
  ]

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

      <div className="ap-model-page-content">
      <div className="model-layout" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 0' }}>

        {/* ── MAIN COLUMN ── */}
        <main style={{ minWidth: 0 }}>

          {/* BREADCRUMB */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8E99A8', marginBottom: '20px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href={listingHref} style={{ color: '#8E99A8', textDecoration: 'none' }}>New {vehicleLabel}</Link>
            <span>›</span>
            <Link href={`/${brandSlug}/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>{brand.name}</Link>
            <span>›</span>
            <span style={{ color: '#00D4FF' }}>{m.name}</span>
          </div>

          {/* ── MODEL HERO ── */}
          <div className="ap-model-hero-wrap">

            {/* Image carousel — first in DOM so it's on top on mobile */}
            <ModelHeroImage
              images={modelImages.map(img => img.url)}
              alt={`${brand.name} ${m.name}`}
              fallback={vehicleType === 'car' ? '🚗' : vehicleType === 'bike' ? '🏍️' : '🛵'}
            />

            {/* Quick links */}
            <div className="ap-model-hero-links">
              <Link href={`/${brandSlug}/${modelSlug}/colours/`} className="ap-model-hero-link">
                🎨 {modelColours.length > 0 ? `${modelColours.length} Colours` : 'Colours'}
              </Link>
              <Link href={`/${brandSlug}/${modelSlug}/images/`} className="ap-model-hero-link">
                📸 {modelImages.length > 0 ? `${modelImages.length} Images` : 'Images'}
              </Link>
            </div>

            {/* Text info */}
            <div className="ap-model-info">
              <div className="ap-m-tags">
                <span className="ap-m-tag" style={{ color: '#00D4FF', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  {brand.name}
                </span>
                {m.body_type && <span className="ap-m-tag">{m.body_type}</span>}
                {fuelTypes.map(ft => (
                  <span key={ft} className="ap-m-tag" style={
                    ft === 'Electric'
                      ? { background: 'rgba(0,255,128,0.08)', border: '1px solid rgba(0,255,128,0.2)', color: '#00FF80' }
                      : undefined
                  }>{ft}</span>
                ))}
                {specsData?.ncap_rating && (
                  <span className="ap-m-tag" style={{ color: '#FFB400', background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.2)' }}>
                    {specsData.ncap_rating} NCAP
                  </span>
                )}
              </div>

              <h1 className="ap-model-info-name">
                {seo?.h1 ? seo.h1 : <>{brand.name} <span style={{ color: '#00D4FF' }}>{m.name}</span></>}
              </h1>
              {seo?.intro_text && (
                <p style={{ fontSize: '13px', color: '#C0C0C0', margin: '6px 0', lineHeight: 1.7 }}>{seo.intro_text}</p>
              )}

              {priceLabel && (
                <div className="ap-model-info-price">
                  {priceLabel}
                  <span className="ap-model-info-price-label">ex-showroom</span>
                </div>
              )}

              {heroOnRoad && heroCity && (
                <div className="ap-m-onroad">
                  On-road in {heroCity.name}:{' '}
                  <strong style={{ color: '#fff' }}>{formatPrice(heroOnRoad.total)}</strong>
                  <span style={{ color: '#8E99A8' }}> (est. base variant)</span>
                </div>
              )}

              <div className="ap-model-actions">
                <GetOffersButton
                  modelId={m.id}
                  modelName={m.name}
                  brandName={brand.name}
                  modelSlug={modelSlug}
                  variants={calcVariants}
                  className="ap-model-action-btn ap-model-action-primary"
                >
                  Get Offers
                </GetOffersButton>
                <a href="#on-road" className="ap-model-action-btn">On-Road Price</a>
                <Link href={`/compare/${vehicleType}s/?v1=${brand.slug}-${modelSlug}`} className="ap-model-action-btn">
                  Compare
                </Link>
                <Link href={`/dealers/?brand=${brandSlug}`} className="ap-model-action-btn">
                  Dealers
                </Link>
              </div>
            </div>
          </div>

          {/* Quick specs */}
          <div className="ap-m-specs" style={{ marginBottom: '36px' }}>
            {[
              { label: 'Mileage', value: specsData?.mileage_arai ? `${specsData.mileage_arai} km/l` : '—' },
              { label: 'Power',   value: specsData?.power_bhp   ? `${specsData.power_bhp} bhp`     : '—' },
              { label: 'Engine',  value: specsData?.engine_cc   ? `${specsData.engine_cc} cc`       : '—' },
              { label: 'NCAP',    value: specsData?.ncap_rating ?? '—' },
            ].map(s => (
              <div key={s.label} className="ap-m-spec">
                <div className="ap-m-spec-val">{s.value}</div>
                <div className="ap-m-spec-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── KEY SPECIFICATIONS ── */}
          <section id="overview" style={{ marginBottom: '48px', scrollMarginTop: '60px' }}>
            <h2 className="ap-m-section-title">Key <span>Specifications</span></h2>
            <p className="ap-m-section-sub">{primaryVariant ? `${primaryVariant.name} · popular variant` : 'Specifications'}</p>

            {specsData ? (
              <div className="ap-m-keyspecs">
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
                    <div key={item.label} className="ap-m-keyspec">
                      <div className="ap-m-keyspec-icon">{item.icon}</div>
                      <div className="ap-m-keyspec-label">{item.label}</div>
                      <div className="ap-m-keyspec-val">{item.value}</div>
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
            <h2 className="ap-m-section-title">{m.name} <span>Variants</span></h2>
            <p className="ap-m-section-sub">{variants.length} variant{variants.length !== 1 ? 's' : ''} · tap to expand details</p>
            <VariantAccordion
              variants={variants}
              specs={specsByVariantId}
              modelName={m.name}
            />
          </section>

          {/* ── PROS & CONS ── */}
          <section style={{ marginBottom: '48px' }}>
            <h2 className="ap-m-section-title">{m.name} <span>Pros & Cons</span></h2>
            <p className="ap-m-section-sub">What owners love and dislike</p>
            <ProsConsCard pros={modelPros} cons={modelCons} />
          </section>

          {/* ── OWNER RATINGS ── */}
          <section style={{ marginBottom: '48px' }}>
            <h2 className="ap-m-section-title">Owner <span>Ratings</span></h2>
            <p className="ap-m-section-sub">Based on verified owner reviews</p>
            <RatingBreakdown modelName={m.name} />
          </section>

          {/* ── MILEAGE ── */}
          <section id="mileage" style={{ marginBottom: '48px', scrollMarginTop: '60px' }}>
            <h2 className="ap-m-section-title">{m.name} <span>Mileage</span></h2>
            <p className="ap-m-section-sub">ARAI-certified fuel efficiency · variant wise</p>

            {variants.filter(v => specsByVariantId[v.id]?.mileage_arai).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#8E99A8', fontSize: '14px', background: '#0A1F44', borderRadius: '16px', border: '1px solid rgba(0,212,255,0.08)' }}>
                Mileage data not yet available
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {variants.filter(v => specsByVariantId[v.id]?.mileage_arai).map(v => (
                  <div key={v.id} style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '24px', fontWeight: 900, color: '#00D4FF' }}>
                      {specsByVariantId[v.id].mileage_arai}
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#8E99A8', marginLeft: '3px' }}>km/l</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#fff', fontWeight: 600, marginTop: '4px' }}>{v.name}</div>
                    {v.fuel_type && <div style={{ fontSize: '10px', color: '#8E99A8' }}>{v.fuel_type}</div>}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── IMAGES PREVIEW ── */}
          {modelImages.length > 0 && (
            <section id="images" style={{ marginBottom: '48px', scrollMarginTop: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h2 className="ap-m-section-title">{m.name} <span>Images</span></h2>
                <Link href={`/${brandSlug}/${modelSlug}/images/`} style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 700, textDecoration: 'none' }}>
                  View All {modelImages.length} →
                </Link>
              </div>
              <p className="ap-m-section-sub">Exterior, interior and detail photos</p>
              <div className="ap-m-img-scroll">
                {modelImages.slice(0, 6).map(img => (
                  <Link key={img.id} href={`/${brandSlug}/${modelSlug}/images/`} className="ap-m-img-thumb" style={{ textDecoration: 'none' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt_text ?? `${brand.name} ${m.name} ${img.type}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── COLOURS ── */}
          <section id="colours" style={{ marginBottom: '48px', scrollMarginTop: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h2 className="ap-m-section-title">{m.name} <span>Colours</span></h2>
              {modelColours.length > 0 && (
                <Link href={`/${brandSlug}/${modelSlug}/colours/`} style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 700, textDecoration: 'none' }}>
                  View All →
                </Link>
              )}
            </div>
            <p className="ap-m-section-sub">
              {modelColours.length > 0
                ? `${modelColours.length} colour option${modelColours.length !== 1 ? 's' : ''} available`
                : 'Available colour options'}
            </p>

            {modelColours.length > 0 ? (
              <div className="ap-m-colours">
                {modelColours.map(colour => (
                  <div key={colour.id} className="ap-m-colour">
                    <div className="ap-m-colour-swatch" style={{ background: colour.hex_code ?? '#555' }} />
                    <span className="ap-m-colour-name">{colour.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.08)', borderRadius: '16px', padding: '36px', textAlign: 'center', color: '#8E99A8', fontSize: '14px' }}>
                Colour options coming soon — check at your nearest dealership.
              </div>
            )}
          </section>

          {/* ── SIMILAR CARS ── */}
          <section style={{ marginBottom: '48px' }}>
            <h2 className="ap-m-section-title">Similar <span>{vehicleLabel}</span></h2>
            <p className="ap-m-section-sub">More {brand.name} models you might like</p>
            <SimilarCars brandSlug={brandSlug} currentModelId={m.id} vehicleType={vehicleType} />
          </section>

          {/* ── LATEST UPDATES ── */}
          <section style={{ marginBottom: '48px' }}>
            <h2 className="ap-m-section-title">Latest <span>Updates</span></h2>
            <p className="ap-m-section-sub">Recent news about {brand.name} {m.name}</p>
            <LatestUpdates modelName={m.name} brandName={brand.name} priceMin={m.price_min} />
          </section>

          {/* AD ZONE 2 */}
          <div style={{ marginBottom: '48px' }}>
            <AdSlot zone="mid-feed-1" />
          </div>

          {/* SEO CONTENT */}
          {seo?.seo_content && (
            <section
              style={{ color: '#C0C0C0', fontSize: '14px', lineHeight: 1.9, marginBottom: '48px' }}
              dangerouslySetInnerHTML={{ __html: seo.seo_content }}
            />
          )}

          {/* ── FAQs ── */}
          <section id="faqs" style={{ marginBottom: '48px', scrollMarginTop: '60px' }}>
            <h2 className="ap-m-section-title">Frequently Asked <span>Questions</span></h2>
            <p className="ap-m-section-sub">Common questions about {brand.name} {m.name}</p>
            {seo?.faqs && seo.faqs.length > 0 ? (
              <div className="ap-m-faq">
                {seo.faqs.map((faq, i) => (
                  <details key={i} className="ap-m-faq-item">
                    <summary>
                      {faq.q}
                      <span style={{ color: '#00D4FF', fontSize: '1rem', flexShrink: 0 }}>+</span>
                    </summary>
                    <div className="ap-m-faq-a">{faq.a}</div>
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
      </div>

      <ModelStickyBar
        brandSlug={brandSlug}
        modelSlug={modelSlug}
        modelId={m.id}
        modelName={m.name}
        brandName={brand.name}
        variants={calcVariants}
      />
      <TrackRecentView
        brand={brand.name}
        model={m.name}
        price={priceLabel ?? ''}
        slug={`/${brandSlug}/${modelSlug}/`}
      />
      <EditSeoButton pageKey={pageKey} existingId={seo?.id} />
    </>
  )
}
