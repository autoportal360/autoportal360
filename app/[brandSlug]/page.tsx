import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import { formatPriceRange, formatPrice } from '@/lib/utils'
import { getCanonicalUrl } from '@/lib/seo'
import type { Brand } from '@/types'
import ModelGrid, { type ModelRow } from './ModelGrid'
import BrandFaq from './BrandFaq'
import { getPageSeo } from '@/lib/page-seo'
import EditSeoButton from '@/components/EditSeoButton'

export const dynamic = 'force-dynamic'

// ─── Slug parsing ─────────────────────────────────────────────────────────────

type VehicleType = 'car' | 'bike' | 'scooter'

interface ParsedSlug {
  brandName: string
  vehicleType: VehicleType
  vehicleLabel: string
  listingHref: string
}

function parseSlug(brandSlug: string): ParsedSlug | null {
  if (brandSlug.endsWith('-cars')) {
    return {
      brandName: brandSlug.slice(0, -5),
      vehicleType: 'car',
      vehicleLabel: 'Cars',
      listingHref: '/new-cars/',
    }
  }
  if (brandSlug.endsWith('-bikes')) {
    return {
      brandName: brandSlug.slice(0, -6),
      vehicleType: 'bike',
      vehicleLabel: 'Bikes',
      listingHref: '/new-bikes/',
    }
  }
  if (brandSlug.endsWith('-scooters')) {
    return {
      brandName: brandSlug.slice(0, -9),
      vehicleType: 'scooter',
      vehicleLabel: 'Scooters',
      listingHref: '/new-scooters/',
    }
  }
  return null
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

const getBrand = cache(async (slug: string, type: VehicleType): Promise<Brand | null> => {
  const { data } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .eq('type', type)
    .eq('is_active', true)
    .single()
  if (data) return data

  // Bikes/scooters may carry a type suffix in the DB slug (e.g. 'honda-scooter')
  // to avoid unique constraint collisions with the car slug ('honda').
  if (type === 'bike' || type === 'scooter') {
    const { data: data2 } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', `${slug}-${type}`)
      .eq('type', type)
      .eq('is_active', true)
      .single()
    return data2 ?? null
  }

  return null
})

async function getModels(brandId: string, type: VehicleType): Promise<ModelRow[]> {
  const { data, error } = await supabase
    .from('models')
    .select('*, variants(fuel_type)')
    .eq('brand_id', brandId)
    .eq('type', type)
    .neq('status', 'discontinued')
    .order('price_min', { ascending: true })
  if (error) { console.error('Error fetching models:', error); return [] }
  return (data ?? []) as unknown as ModelRow[]
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}): Promise<Metadata> {
  const { brandSlug } = await params
  const parsed = parseSlug(brandSlug)
  if (!parsed) return { title: 'Not Found' }

  const brand = await getBrand(parsed.brandName, parsed.vehicleType)
  if (!brand) return { title: 'Brand Not Found' }

  const priceStr = brand.price_min && brand.price_max
    ? ` · ${formatPriceRange(brand.price_min, brand.price_max)}`
    : brand.price_min
    ? ` · From ${formatPrice(brand.price_min)}`
    : ''

  const pageKey = `brand-${brandSlug}`
  const seo = await getPageSeo(pageKey)

  return {
    title: seo?.meta_title ?? `${brand.name} ${parsed.vehicleLabel} Price in India 2026 — All Models${priceStr}`,
    description: seo?.meta_description ?? `Browse all ${brand.name} ${parsed.vehicleLabel.toLowerCase()} in India. Compare prices, specs, mileage and on-road cost in your city.`,
    alternates: { canonical: getCanonicalUrl(`/${brandSlug}/`) },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: `${brand.name} ${parsed.vehicleLabel} in India 2026 — Prices & Specs`,
      description: `All ${brand.name} models · Compare variants · On-road price in your city`,
      url: getCanonicalUrl(`/${brandSlug}/`),
      type: 'website',
    },
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function BrandVehiclePage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const parsed = parseSlug(brandSlug)
  if (!parsed) notFound()

  const { brandName, vehicleType, vehicleLabel, listingHref } = parsed

  const brand = await getBrand(brandName, vehicleType)
  if (!brand) notFound()

  const pageKey = `brand-${brandSlug}`
  const [models, seo] = await Promise.all([
    getModels(brand.id, vehicleType),
    getPageSeo(pageKey),
  ])

  const compareModels = models.filter(m => m.status === 'active').slice(0, 4)
  const comparisons: { a: string; b: string; href: string }[] = []
  for (let i = 0; i < compareModels.length - 1 && comparisons.length < 3; i++) {
    comparisons.push({
      a: compareModels[i].name,
      b: compareModels[i + 1].name,
      href: `/compare/${brandName}-${compareModels[i].slug}-vs-${brandName}-${compareModels[i + 1].slug}/`,
    })
  }

  const priceLabel = brand.price_min && brand.price_max
    ? formatPriceRange(brand.price_min, brand.price_max)
    : brand.price_min
    ? `From ${formatPrice(brand.price_min)}`
    : null

  return (
    <div>
      {seo?.schema_jsonld && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.schema_jsonld }} />
      )}

      {/* AD ZONE 1 — HERO BILLBOARD */}
      <AdSlot zone="hero-billboard" />

      {/* BREADCRUMB */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8E99A8' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href={listingHref} style={{ color: '#8E99A8', textDecoration: 'none' }}>New {vehicleLabel}</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>{brand.name} {vehicleLabel}</span>
        </div>
      </div>

      {/* BRAND HERO */}
      <section style={{
        padding: '36px 24px 32px',
        background: 'linear-gradient(180deg,rgba(0,212,255,0.05) 0%,transparent 70%)',
        borderBottom: '1px solid rgba(0,212,255,0.08)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>

          {/* Brand monogram */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '18px', flexShrink: 0,
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Montserrat, sans-serif', fontSize: '24px', fontWeight: 900, color: '#00D4FF',
          }}>
            {brand.name.slice(0, 2).toUpperCase()}
          </div>

          {/* Brand info */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h1 style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 900,
                letterSpacing: '-0.8px', color: '#FFFFFF', margin: 0,
              }}>
                {seo?.h1 ? seo.h1 : <>{brand.name} <span style={{ color: '#00D4FF' }}>{vehicleLabel}</span></>}
              </h1>
              {brand.country && (
                <span style={{
                  fontSize: '11px', color: '#8E99A8',
                  background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)',
                  padding: '3px 10px', borderRadius: '20px',
                }}>{brand.country}</span>
              )}
            </div>

            {brand.tagline && (
              <p style={{ color: '#C0C0C0', fontSize: '15px', margin: '0 0 14px', lineHeight: 1.5 }}>
                {brand.tagline}
              </p>
            )}

            {/* Stats strip */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 900, color: '#00D4FF' }}>
                  {models.length}
                </div>
                <div style={{ fontSize: '11px', color: '#8E99A8', marginTop: '1px' }}>Models</div>
              </div>
              {priceLabel && (
                <div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 900, color: '#00D4FF' }}>
                    {priceLabel}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8E99A8', marginTop: '1px' }}>Price range</div>
                </div>
              )}
              {brand.founded_year && (
                <div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 900, color: '#00D4FF' }}>
                    {brand.founded_year}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8E99A8', marginTop: '1px' }}>Founded</div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* ── MODELS + FILTER ── */}
        <section style={{ marginBottom: '52px' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
            fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px',
          }}>
            {brand.name} <span style={{ color: '#00D4FF' }}>Models</span> in India
          </h2>
          <p style={{ fontSize: '13px', color: '#8E99A8', marginBottom: '20px' }}>
            {models.length} model{models.length !== 1 ? 's' : ''} · Filter by body type and fuel
          </p>

          {models.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 24px',
              background: '#111111', borderRadius: '16px',
              border: '1px solid rgba(0,212,255,0.08)',
              color: '#8E99A8', fontSize: '15px',
            }}>
              No active models found for {brand.name} — check back soon.
            </div>
          ) : (
            <ModelGrid models={models} brandSlug={brandSlug} vehicleType={vehicleType} />
          )}
        </section>

        {/* AD ZONE 2 */}
        <div style={{ marginBottom: '52px' }}>
          <AdSlot zone="mid-feed-1" />
        </div>

        {/* ── POPULAR COMPARISONS ── */}
        {comparisons.length > 0 && (
          <section style={{ marginBottom: '52px' }}>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
              fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px',
            }}>
              Popular <span style={{ color: '#00D4FF' }}>Comparisons</span>
            </h2>
            <p style={{ fontSize: '13px', color: '#8E99A8', marginBottom: '20px' }}>
              Compare {brand.name} models head-to-head
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {comparisons.map(c => (
                <Link key={c.href} href={c.href} style={{
                  background: '#0A1F44',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '12px', padding: '14px 18px',
                  textDecoration: 'none', display: 'flex',
                  alignItems: 'center', gap: '10px',
                  minWidth: '240px', flex: 1,
                }}>
                  <div style={{
                    fontFamily: 'Montserrat, sans-serif', fontSize: '13px',
                    fontWeight: 700, color: '#FFFFFF',
                  }}>{c.a}</div>
                  <div style={{
                    fontFamily: 'Montserrat, sans-serif', fontSize: '11px',
                    fontWeight: 900, color: '#00D4FF', flexShrink: 0,
                  }}>VS</div>
                  <div style={{
                    fontFamily: 'Montserrat, sans-serif', fontSize: '13px',
                    fontWeight: 700, color: '#FFFFFF',
                  }}>{c.b}</div>
                  <div style={{ marginLeft: 'auto', color: '#00D4FF', fontSize: '14px' }}>→</div>
                </Link>
              ))}
              <Link href="/compare/" style={{
                background: 'transparent',
                border: '1px dashed rgba(0,212,255,0.2)',
                borderRadius: '12px', padding: '14px 18px',
                textDecoration: 'none', display: 'flex',
                alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: 700, color: '#00D4FF',
                fontFamily: 'Montserrat, sans-serif',
              }}>
                All comparisons →
              </Link>
            </div>
          </section>
        )}

        {/* ── SEO CONTENT BLOCK ── */}
        <section style={{
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: '16px', padding: '32px', marginBottom: '52px',
        }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '20px',
            fontWeight: 800, marginBottom: '20px',
          }}>
            About <span style={{ color: '#00D4FF' }}>{brand.name} {vehicleLabel}</span> in India
          </h2>
          {seo?.seo_content ? (
            <div
              style={{ color: '#C0C0C0', fontSize: '14px', lineHeight: 1.9 }}
              dangerouslySetInnerHTML={{ __html: seo.seo_content }}
            />
          ) : (
            <div style={{
              color: '#C0C0C0', fontSize: '14px',
              lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: '14px',
            }}>
              <p style={{ margin: 0 }}>
                {brand.name} is one of the leading {vehicleLabel.toLowerCase()} brands available in India
                {brand.country ? `, headquartered in ${brand.country}` : ''}.
                {brand.founded_year ? ` Founded in ${brand.founded_year}, the brand` : ' The brand'} offers a
                comprehensive lineup of{' '}
                {models.length > 0
                  ? `${models.length} model${models.length > 1 ? 's' : ''} including ` +
                    models.slice(0, 3).map(m => m.name).join(', ') +
                    (models.length > 3 ? ' and more' : '')
                  : 'models'}.
              </p>
              <p style={{ margin: 0 }}>
                {priceLabel
                  ? `${brand.name} ${vehicleLabel.toLowerCase()} in India are priced ${priceLabel} (ex-showroom). `
                  : ''}
                Prices vary by city — on-road costs include RTO registration fees
                (8–15% depending on state), comprehensive insurance, and handling charges.
                Use the Price tab on each model card to calculate the exact on-road price in your city.
              </p>
              <p style={{ margin: 0 }}>
                When choosing a {brand.name} {vehicleLabel.slice(0, -1).toLowerCase()}, compare the
                variant-wise feature list and check the safety rating for your shortlisted model.
                The Specs page for each model gives you ARAI-certified mileage, engine displacement,
                power output, and ground clearance — everything you need before visiting a showroom.
              </p>
            </div>
          )}
        </section>

        {/* ── FAQ ── */}
        <section style={{ marginBottom: '52px' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
            fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px',
          }}>
            Frequently Asked <span style={{ color: '#00D4FF' }}>Questions</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#8E99A8', marginBottom: '24px' }}>
            Common questions about {brand.name} {vehicleLabel.toLowerCase()} in India
          </p>
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
            <BrandFaq brandName={brand.name} vehicleLabel={vehicleLabel} />
          )}
        </section>

      </div>

      {/* AD ZONE 3 — PRE-FOOTER */}
      <AdSlot zone="pre-footer" />

      <EditSeoButton pageKey={pageKey} existingId={seo?.id} />
    </div>
  )
}
