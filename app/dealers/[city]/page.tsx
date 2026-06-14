import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getCanonicalUrl } from '@/lib/seo'
import type { Dealer } from '@/types/dealer'

export const revalidate = 3600

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Props = { params: Promise<{ city: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const { data } = await db.from('dealers').select('city').eq('city_slug', city).limit(1).single()
  if (!data) return { title: 'Dealers | AutoPortal360' }
  return {
    title: `Authorized Car & Bike Dealers in ${data.city} | AutoPortal360`,
    description: `Find authorized showrooms for cars, bikes and scooters in ${data.city}. Compare dealers, check ratings and get directions.`,
    alternates: { canonical: getCanonicalUrl(`/dealers/${city}/`) },
  }
}

export async function generateStaticParams() {
  const { data } = await db.from('dealers').select('city_slug').eq('is_active', true)
  const slugs = [...new Set((data ?? []).map(d => d.city_slug))]
  return slugs.map(city => ({ city }))
}

const TYPE_COLOR: Record<string, string> = { cars: '#00D4FF', bikes: '#FF6B35', scooters: '#A855F7' }

function TypePill({ type }: { type: string }) {
  const c = TYPE_COLOR[type] ?? '#8E99A8'
  return (
    <span style={{
      background: `${c}18`, border: `1px solid ${c}40`, color: c,
      padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700,
      textTransform: 'capitalize',
    }}>{type}</span>
  )
}

export default async function CityDealersPage({ params }: Props) {
  const { city: citySlug } = await params

  const { data: dealers } = await db
    .from('dealers')
    .select('*')
    .eq('is_active', true)
    .eq('city_slug', citySlug)
    .order('brand_name')

  if (!dealers || dealers.length === 0) notFound()

  const cityName = (dealers[0] as Dealer).city

  // Group by brand
  const byBrand = new Map<string, { brand: string; brand_slug: string; dealers: Dealer[] }>()
  for (const d of dealers as Dealer[]) {
    if (!byBrand.has(d.brand_slug)) {
      byBrand.set(d.brand_slug, { brand: d.brand_name, brand_slug: d.brand_slug, dealers: [] })
    }
    byBrand.get(d.brand_slug)!.dealers.push(d)
  }
  const brandGroups = [...byBrand.values()]

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1F44 0%, #06142D 100%)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        padding: '40px 20px 32px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#8E99A8', marginBottom: 16, alignItems: 'center' }}>
            <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/dealers/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Dealers</Link>
            <span>›</span>
            <span style={{ color: '#00D4FF' }}>{cityName}</span>
          </div>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
            fontSize: 'clamp(22px, 4vw, 32px)', color: '#FFFFFF', margin: '0 0 8px',
          }}>
            Authorized Dealers in {cityName}
          </h1>
          <p style={{ fontSize: 14, color: '#8E99A8', margin: 0 }}>
            {dealers.length} showroom{dealers.length !== 1 ? 's' : ''} · {brandGroups.length} brand{brandGroups.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Brand filter tabs */}
      <div style={{ borderBottom: '1px solid rgba(0,212,255,0.08)', padding: '0 20px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 4, overflowX: 'auto', padding: '12px 0' }}>
          <Link href={`/dealers/${citySlug}/`} style={{
            background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)',
            color: '#00D4FF', padding: '6px 14px', borderRadius: 20,
            fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            All Brands
          </Link>
          {brandGroups.map(bg => (
            <Link key={bg.brand_slug} href={`/dealers/${citySlug}/${bg.brand_slug}/`} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#C0C0C0', padding: '6px 14px', borderRadius: 20,
              fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              {bg.brand}
            </Link>
          ))}
        </div>
      </div>

      {/* Dealer list */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 72px' }}>
        {brandGroups.map(({ brand, brand_slug, dealers: brandDealers }) => (
          <section key={brand_slug} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 800,
                color: '#00D4FF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {brand}
              </h2>
              <Link href={`/dealers/${citySlug}/${brand_slug}/`} style={{
                fontSize: 12, color: '#8E99A8', textDecoration: 'none',
              }}>
                {brand} dealers in {cityName} →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {brandDealers.map(d => (
                <div key={d.id} style={{
                  background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
                  borderRadius: 14, padding: '18px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{
                        fontFamily: 'Montserrat, sans-serif', fontSize: 15, fontWeight: 800,
                        color: '#FFFFFF', marginBottom: 3,
                      }}>{d.name}</div>
                      {d.locality && <div style={{ fontSize: 12, color: '#8E99A8' }}>{d.locality}</div>}
                    </div>
                    {d.is_authorized && (
                      <span style={{
                        background: 'rgba(0,204,102,0.1)', border: '1px solid rgba(0,204,102,0.25)',
                        color: '#00CC66', padding: '2px 8px', borderRadius: 12,
                        fontSize: 9, fontWeight: 800, marginLeft: 8,
                      }}>✓ AUTH</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                    {d.vehicle_types.map(t => <TypePill key={t} type={t} />)}
                  </div>

                  {d.address && (
                    <div style={{ fontSize: 12, color: '#8E99A8', marginBottom: 8, display: 'flex', gap: 6 }}>
                      <span>📍</span><span>{d.address}</span>
                    </div>
                  )}
                  {d.working_hours && (
                    <div style={{ fontSize: 12, color: '#8E99A8', marginBottom: 10, display: 'flex', gap: 6 }}>
                      <span>🕐</span><span>{d.working_hours}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      {d.rating && (
                        <span style={{ color: '#FFB400', fontWeight: 700, fontSize: 13 }}>
                          ★ {Number(d.rating).toFixed(1)}
                          {d.review_count > 0 && (
                            <span style={{ fontSize: 11, color: '#8E99A8', fontWeight: 400 }}> ({d.review_count})</span>
                          )}
                        </span>
                      )}
                      {d.phone && (
                        <a href={`tel:${d.phone}`} style={{ fontSize: 12, color: '#00D4FF', textDecoration: 'none' }}>
                          📞 {d.phone}
                        </a>
                      )}
                    </div>
                    {d.google_maps_url && (
                      <a href={d.google_maps_url} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: 11, color: '#8E99A8', textDecoration: 'none', fontWeight: 600,
                      }}>Maps →</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
