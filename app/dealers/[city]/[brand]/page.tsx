import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getCanonicalUrl } from '@/lib/seo'
import type { Dealer } from '@/types'

export const revalidate = 3600

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Props = { params: Promise<{ city: string; brand: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, brand } = await params
  const { data } = await db.from('dealers')
    .select('city, brand_name')
    .eq('city_slug', city)
    .eq('brand_slug', brand)
    .limit(1)
    .single()
  if (!data) return { title: 'Dealers | AutoPortal360' }
  return {
    title: `Authorized ${data.brand_name} Dealers in ${data.city} | AutoPortal360`,
    description: `Find authorized ${data.brand_name} showrooms in ${data.city}. Book test drives, check prices, and get directions.`,
    alternates: { canonical: getCanonicalUrl(`/dealers/${city}/${brand}/`) },
  }
}

export async function generateStaticParams() {
  const { data } = await db.from('dealers').select('city_slug, brand_slug').eq('is_active', true)
  const pairs = [...new Set((data ?? []).map(d => `${d.city_slug}|${d.brand_slug}`))]
  return pairs.map(p => {
    const [city, brand] = p.split('|')
    return { city, brand }
  })
}

const TYPE_COLOR: Record<string, string> = { cars: '#00D4FF', bikes: '#FF6B35', scooters: '#A855F7' }

function TypePill({ type }: { type: string }) {
  const c = TYPE_COLOR[type] ?? '#8E99A8'
  return (
    <span style={{
      background: `${c}18`, border: `1px solid ${c}40`, color: c,
      padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
      textTransform: 'capitalize',
    }}>{type}</span>
  )
}

export default async function CityBrandDealersPage({ params }: Props) {
  const { city: citySlug, brand: brandSlug } = await params

  const { data: dealers } = await db
    .from('dealers')
    .select('*')
    .eq('is_active', true)
    .eq('city_slug', citySlug)
    .eq('brand_slug', brandSlug)
    .order('name')

  if (!dealers || dealers.length === 0) notFound()

  const cityName  = (dealers[0] as Dealer).city
  const brandName = (dealers[0] as Dealer).brand_name

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1F44 0%, #06142D 100%)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        padding: '40px 20px 32px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#8E99A8', marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/dealers/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Dealers</Link>
            <span>›</span>
            <Link href={`/dealers/${citySlug}/`} style={{ color: '#8E99A8', textDecoration: 'none' }}>{cityName}</Link>
            <span>›</span>
            <span style={{ color: '#00D4FF' }}>{brandName}</span>
          </div>

          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
            fontSize: 'clamp(20px, 4vw, 30px)', color: '#FFFFFF', margin: '0 0 8px',
          }}>
            {brandName} Dealers in {cityName}
          </h1>
          <p style={{ fontSize: 14, color: '#8E99A8', margin: 0 }}>
            {dealers.length} authorized showroom{dealers.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Dealer cards */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 72px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {(dealers as Dealer[]).map(d => (
            <div key={d.id} style={{
              background: '#0A1F44', border: '1px solid rgba(0,212,255,0.12)',
              borderRadius: 16, padding: '22px 24px',
            }}>
              {/* Name + badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{
                    fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 900,
                    color: '#FFFFFF', marginBottom: 4,
                  }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: '#8E99A8' }}>{brandName}</div>
                </div>
                {d.is_authorized && (
                  <span style={{
                    background: 'rgba(0,204,102,0.1)', border: '1px solid rgba(0,204,102,0.3)',
                    color: '#00CC66', padding: '3px 10px', borderRadius: 12,
                    fontSize: 10, fontWeight: 800, marginLeft: 10,
                  }}>✓ Authorized</span>
                )}
              </div>

              {/* Vehicle types */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {d.vehicle_types.map(t => <TypePill key={t} type={t} />)}
              </div>

              {/* Rating */}
              {d.rating && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: '#FFB400', fontWeight: 700, fontSize: 14 }}>
                    ★ {Number(d.rating).toFixed(1)}
                  </span>
                  {d.review_count > 0 && (
                    <span style={{ fontSize: 12, color: '#8E99A8', marginLeft: 6 }}>
                      ({d.review_count} reviews)
                    </span>
                  )}
                </div>
              )}

              {/* Address */}
              {(d.address || d.locality) && (
                <div style={{ fontSize: 13, color: '#8E99A8', marginBottom: 10, display: 'flex', gap: 8 }}>
                  <span>📍</span>
                  <div>
                    {d.address && <div>{d.address}</div>}
                    {d.locality && <div>{d.locality}{d.pincode ? ` — ${d.pincode}` : ''}</div>}
                  </div>
                </div>
              )}

              {/* Hours */}
              {d.working_hours && (
                <div style={{ fontSize: 12, color: '#8E99A8', marginBottom: 14, display: 'flex', gap: 8 }}>
                  <span>🕐</span><span>{d.working_hours}</span>
                </div>
              )}

              {/* CTA row */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {d.phone && (
                  <a href={`tel:${d.phone}`} style={{
                    background: '#00D4FF', color: '#06142D',
                    fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
                    fontSize: 12, padding: '9px 16px',
                    borderRadius: 8, textDecoration: 'none', flex: 1, textAlign: 'center',
                  }}>
                    📞 Call Now
                  </a>
                )}
                {d.google_maps_url && (
                  <a href={d.google_maps_url} target="_blank" rel="noopener noreferrer" style={{
                    background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
                    border: '1px solid rgba(0,212,255,0.2)',
                    fontSize: 12, fontWeight: 700, padding: '9px 16px',
                    borderRadius: 8, textDecoration: 'none', flex: 1, textAlign: 'center',
                  }}>
                    📍 Directions
                  </a>
                )}
                {d.website && (
                  <a href={d.website} target="_blank" rel="noopener noreferrer" style={{
                    background: 'rgba(255,255,255,0.04)', color: '#8E99A8',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: 12, fontWeight: 600, padding: '9px 16px',
                    borderRadius: 8, textDecoration: 'none', flex: 1, textAlign: 'center',
                  }}>
                    Website ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Back link */}
        <div style={{ marginTop: 32, display: 'flex', gap: 10 }}>
          <Link href={`/dealers/${citySlug}/`} style={{
            fontSize: 13, color: '#8E99A8', textDecoration: 'none',
          }}>
            ← All dealers in {cityName}
          </Link>
          <span style={{ color: '#555' }}>·</span>
          <Link href="/dealers/" style={{ fontSize: 13, color: '#8E99A8', textDecoration: 'none' }}>
            All cities
          </Link>
        </div>
      </div>
    </div>
  )
}
