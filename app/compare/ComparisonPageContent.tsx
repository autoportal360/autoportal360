import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { getCanonicalUrl } from '@/lib/seo'
import { supabase } from '@/lib/supabase'
import { breadcrumbSchema, faqSchema } from '@/lib/schema'
import {
  type VehicleType,
  type LoadedVehicle,
  loadVehiclesFromSlugs,
  generateFAQs,
  POPULAR_COMPARISONS_BY_TYPE,
} from './compareUtils'
import ComparisonTable from './ComparisonTable'

const TYPE_LABEL: Record<VehicleType, string> = { car: 'Cars', bike: 'Bikes', scooter: 'Scooters' }
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autoportal360.vercel.app'

// ─── page seo type ────────────────────────────────────────────────────────────

type PageSeoRow = {
  meta_title:    string | null
  intro_text:    string | null
  faqs:          { q: string; a: string }[] | null
  schema_jsonld: string | null
}

async function fetchPageSeo(pageKey: string): Promise<PageSeoRow | null> {
  const { data } = await supabase
    .from('page_seo').select('meta_title, intro_text, faqs, schema_jsonld')
    .eq('page_key', pageKey).maybeSingle()
  return data as PageSeoRow | null
}

// ─── about section ────────────────────────────────────────────────────────────

function AboutSection({ vehicles, vehicleType, pageSeo }: {
  vehicles: LoadedVehicle[]
  vehicleType: VehicleType
  pageSeo: PageSeoRow | null
}) {
  const [v1, v2] = vehicles
  const n1 = `${v1.brandName} ${v1.modelName}`
  const n2 = `${v2.brandName} ${v2.modelName}`
  const segment = vehicleType === 'car' ? 'car' : vehicleType === 'bike' ? 'motorcycle' : 'scooter'

  const priceMin = Math.min(v1.price_min ?? Infinity, v2.price_min ?? Infinity)
  const priceMax = Math.max(v1.price_max ?? 0, v2.price_max ?? 0)
  const priceRange = priceMin < Infinity && priceMax > 0
    ? `${formatPrice(priceMin)} – ${formatPrice(priceMax)}`
    : null

  const introText = pageSeo?.intro_text
    ? pageSeo.intro_text
    : `The ${n1} vs ${n2} is one of the most searched ${segment} comparisons in India.` +
      (priceRange ? ` Both are ${segment}s priced between ${priceRange}.` : '') +
      ` Here is a detailed comparison of specs, features, mileage and price to help you make the right buying decision.`

  return (
    <div style={{
      background: 'rgba(0,212,255,0.03)',
      border: '1px solid rgba(0,212,255,0.1)',
      borderRadius: 14, padding: '20px 22px', marginTop: 32,
    }}>
      <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 800, color: '#FFFFFF', margin: '0 0 10px' }}>
        About this Comparison
      </h2>
      <p style={{ fontSize: 14, color: '#C0C0C0', lineHeight: 1.75, margin: 0 }}>{introText}</p>
    </div>
  )
}

// ─── FAQ section ──────────────────────────────────────────────────────────────

function FaqSection({ vehicles, pageSeo }: { vehicles: LoadedVehicle[]; pageSeo: PageSeoRow | null }) {
  const rawFaqs = pageSeo?.faqs?.filter(f => f.q.trim())
  const faqs = rawFaqs?.length
    ? rawFaqs.map(f => ({ question: f.q, answer: f.a }))
    : generateFAQs(vehicles)

  if (!faqs.length) return null

  return (
    <div style={{ marginTop: 36 }}>
      <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px' }}>
        Frequently Asked Questions
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {faqs.map((faq, i) => (
          <details key={i} style={{
            background: '#0A1F44',
            border: '1px solid rgba(0,212,255,0.12)',
            borderRadius: 12,
          }}>
            <summary style={{
              padding: '14px 18px', cursor: 'pointer', listStyle: 'none',
              fontSize: 14, fontWeight: 700, color: '#FFFFFF',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              {faq.question}
              <span style={{ color: '#00D4FF', fontSize: 18, flexShrink: 0, marginLeft: 8 }}>+</span>
            </summary>
            <div style={{ padding: '0 18px 14px', fontSize: 13, color: '#C0C0C0', lineHeight: 1.7 }}>
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

// ─── related comparisons ──────────────────────────────────────────────────────

function RelatedComparisons({ vehicles, vehicleType, basePath, currentSlug }: {
  vehicles: LoadedVehicle[]
  vehicleType: VehicleType
  basePath: string
  currentSlug: string
}) {
  const allPopular = POPULAR_COMPARISONS_BY_TYPE[vehicleType]

  // Collect model slugs in the current comparison
  const currentModelSlugs = vehicles.map(v => `${v.brandSlug}-${v.modelSlug}`)

  // Related = any popular comparison that shares at least one model with the current but isn't identical
  const related = allPopular.filter(c => {
    if (c.slug === currentSlug) return false
    const parts = c.slug.split('-vs-').slice(0, 2)
    return parts.some(p => currentModelSlugs.some(s => p.startsWith(s)))
  })

  // Fill up to 4 with other popular comparisons if needed
  const extras = allPopular.filter(c => c.slug !== currentSlug && !related.find(r => r.slug === c.slug))
  const shown  = [...related, ...extras].slice(0, 4)

  if (!shown.length) return null

  const typeLabel = TYPE_LABEL[vehicleType].slice(0, -1) // Cars → Car

  return (
    <div style={{ marginTop: 36 }}>
      <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 800, color: '#FFFFFF', margin: '0 0 14px' }}>
        Related {typeLabel} Comparisons
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {shown.map(c => (
          <Link key={c.slug} href={`${basePath}/${c.slug}/`} style={{
            background: 'rgba(0,212,255,0.05)',
            border: '1px solid rgba(0,212,255,0.14)',
            borderRadius: 8, padding: '8px 14px',
            textDecoration: 'none', fontSize: 13, color: '#C0C0C0',
          }}>
            {c.label}
          </Link>
        ))}
        <Link href={basePath} style={{
          background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.22)',
          borderRadius: 8, padding: '8px 14px',
          textDecoration: 'none', fontSize: 13, color: '#00D4FF', fontWeight: 700,
        }}>
          Compare any {typeLabel.toLowerCase()} →
        </Link>
      </div>
    </div>
  )
}

// ─── JSON-LD scripts ──────────────────────────────────────────────────────────

function Schemas({ vehicles, vehicleType, basePath, comparison, pageSeo, faqs }: {
  vehicles: LoadedVehicle[]
  vehicleType: VehicleType
  basePath: string
  comparison: string
  pageSeo: PageSeoRow | null
  faqs: { question: string; answer: string }[]
}) {
  const typeLabel = TYPE_LABEL[vehicleType]
  const names = vehicles.map(v => `${v.brandName} ${v.modelName}`)
  const pageUrl = getCanonicalUrl(`${basePath}/${comparison}/`)

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Compare', url: `${SITE_URL}/compare/` },
    { name: `Compare ${typeLabel}`, url: `${SITE_URL}${basePath}/` },
    { name: names.join(' vs '), url: pageUrl },
  ])

  const faqSchem = faqs.length ? faqSchema(faqs) : null

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${names.join(' vs ')} Comparison`,
    url: pageUrl,
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Vehicle',
        name: `${v.brandName} ${v.modelName}`,
        brand: { '@type': 'Brand', name: v.brandName },
        ...(v.price_min ? { offers: { '@type': 'Offer', price: (v.price_min / 100000).toFixed(2), priceCurrency: 'INR' } } : {}),
        url: `${SITE_URL}/${v.brandPageSlug}/${v.modelSlug}/`,
      },
    })),
  }

  const schemas: object[] = [breadcrumb, itemList]
  if (faqSchem) schemas.push(faqSchem)
  if (pageSeo?.schema_jsonld) {
    try { schemas.push(JSON.parse(pageSeo.schema_jsonld)) } catch {}
  }

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
    </>
  )
}

// ─── main export ──────────────────────────────────────────────────────────────

export default async function ComparisonPageContent({
  comparison,
  basePath,
  vehicleType,
}: {
  comparison: string
  basePath: string
  vehicleType: VehicleType
}) {
  const parts = comparison.split('-vs-').slice(0, 3)
  if (parts.length < 2) notFound()

  const loaded   = await loadVehiclesFromSlugs(parts)
  const vehicles = loaded.filter(Boolean) as NonNullable<(typeof loaded)[number]>[]
  if (vehicles.length < 2) notFound()

  // Build a stable page key using model-level slugs (no variant)
  const modelSlugs = vehicles.map(v => `${v.brandSlug}-${v.modelSlug}`)
  const pageKey    = `compare-${vehicleType}-${modelSlugs.join('-vs-')}`
  const pageSeo    = await fetchPageSeo(pageKey)

  const title     = vehicles.map(v => `${v.brandName} ${v.modelName}`).join(' vs ')
  const typeLabel = TYPE_LABEL[vehicleType]

  // Compute FAQs once so both FaqSection and Schemas can use same data
  const rawFaqs = pageSeo?.faqs?.filter(f => f.q.trim())
  const faqs    = rawFaqs?.length
    ? rawFaqs.map(f => ({ question: f.q, answer: f.a }))
    : generateFAQs(vehicles)

  const emoji = vehicleType === 'car' ? '🚗' : vehicleType === 'bike' ? '🏍️' : '🛵'

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', padding: '28px 20px 72px', fontFamily: 'system-ui, sans-serif' }}>
      {/* JSON-LD */}
      <Schemas vehicles={vehicles} vehicleType={vehicleType} basePath={basePath} comparison={comparison} pageSeo={pageSeo} faqs={faqs} />

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#8E99A8', marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/compare" style={{ color: '#8E99A8', textDecoration: 'none' }}>Compare</Link>
          <span>›</span>
          <Link href={basePath} style={{ color: '#8E99A8', textDecoration: 'none' }}>{typeLabel}</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>{title}</span>
        </div>

        {/* H1 header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(19px, 4vw, 28px)',
            fontWeight: 900, color: '#FFFFFF',
            margin: '0 0 8px', lineHeight: 1.25,
          }}>
            {vehicles.map((v, i) => (
              <span key={v.modelId}>
                {i > 0 && <span style={{ color: '#8E99A8', fontSize: '0.7em', padding: '0 8px' }}>vs</span>}
                <span>{v.brandName} <span style={{ color: '#00D4FF' }}>{v.modelName}</span>{v.popularVariant?.name && v.selectedVariantSlug ? <span style={{ color: '#8E99A8', fontSize: '0.6em', marginLeft: 6 }}>{v.popularVariant.name}</span> : null}</span>
              </span>
            ))}
          </h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13, color: '#8E99A8', margin: 0 }}>
              {emoji} Side-by-side {vehicleType} comparison — prices, specs, mileage &amp; features
            </p>
            <Link href={basePath} style={{ fontSize: 11, fontWeight: 700, color: '#8E99A8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 12px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              + Change vehicles
            </Link>
          </div>
        </div>

        {/* Thumbnails strip */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 24,
          background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: 14, padding: 16, flexWrap: 'wrap',
        }}>
          {vehicles.map((v, i) => (
            <div key={v.modelId} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 180px' }}>
              {i > 0 && <div style={{ fontSize: 11, fontWeight: 800, color: '#8E99A8', marginRight: 4, flexShrink: 0 }}>VS</div>}
              <div style={{
                width: 80, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)',
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {v.thumbnail_url
                  ? <Image src={v.thumbnail_url} alt={v.modelName} fill style={{ objectFit: 'contain', padding: 4 }} sizes="80px" />
                  : <span style={{ fontSize: 28 }}>{emoji}</span>
                }
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#8E99A8', marginBottom: 1 }}>{v.brandName}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}>{v.modelName}</div>
                {v.popularVariant?.name && (
                  <div style={{ fontSize: 11, color: '#8E99A8' }}>
                    {v.selectedVariantSlug ? v.popularVariant.name : `Popular: ${v.popularVariant.name}`}
                  </div>
                )}
                {v.price_min && <div style={{ fontSize: 12, color: '#00D4FF', fontWeight: 700 }}>{formatPrice(v.price_min)}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <ComparisonTable vehicles={vehicles} showSummary={true} />

        {/* SEO sections below the table */}
        <AboutSection vehicles={vehicles} vehicleType={vehicleType} pageSeo={pageSeo} />
        <FaqSection vehicles={vehicles} pageSeo={pageSeo} />
        <RelatedComparisons vehicles={vehicles} vehicleType={vehicleType} basePath={basePath} currentSlug={comparison} />

      </div>
    </div>
  )
}
