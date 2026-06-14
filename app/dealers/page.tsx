import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getCanonicalUrl } from '@/lib/seo'
import type { Dealer } from '@/types'

export const revalidate = 3600

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const metadata: Metadata = {
  title: 'Find Authorized Car & Bike Dealers Near You | AutoPortal360',
  description: 'Browse authorized showrooms for cars, bikes and scooters across Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Jaipur and more.',
  alternates: { canonical: getCanonicalUrl('/dealers/') },
}

type Props = { searchParams: Promise<{ brand?: string; type?: string }> }

const TYPE_COLOR: Record<string, string> = { cars: '#00D4FF', bikes: '#FF6B35', scooters: '#A855F7' }

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <span style={{ color: '#FFB400', fontWeight: 700, fontSize: 13 }}>
      ★ {rating.toFixed(1)}
    </span>
  )
}

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

export default async function DealersPage({ searchParams }: Props) {
  const { brand = '', type = '' } = await searchParams

  let query = db
    .from('dealers')
    .select('*')
    .eq('is_active', true)
    .order('city')
    .order('brand_name')

  if (brand) query = query.eq('brand_slug', brand)
  if (type)  query = query.contains('vehicle_types', [type])

  const [{ data: dealers = [] }, { data: allDealers = [] }] = await Promise.all([
    query,
    db.from('dealers').select('brand_slug, brand_name, vehicle_types').eq('is_active', true),
  ])

  const brands = [...new Map((allDealers ?? []).map(d => [d.brand_slug, d.brand_name])).entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Group by city
  const byCity = new Map<string, { city: string; city_slug: string; dealers: Dealer[] }>()
  for (const d of (dealers ?? []) as Dealer[]) {
    if (!byCity.has(d.city_slug)) {
      byCity.set(d.city_slug, { city: d.city, city_slug: d.city_slug, dealers: [] })
    }
    byCity.get(d.city_slug)!.dealers.push(d)
  }
  const cities = [...byCity.values()]

  const SELECT: React.CSSProperties = {
    background: '#0A1F44', border: '1px solid rgba(0,212,255,0.2)',
    borderRadius: 8, padding: '9px 14px', color: '#C0C0C0', fontSize: 13,
    outline: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1F44 0%, #06142D 100%)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        padding: '40px 20px 32px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#8E99A8', marginBottom: 16, alignItems: 'center' }}>
            <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: '#00D4FF' }}>Dealers</span>
          </div>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
            fontSize: 'clamp(22px, 4vw, 32px)', color: '#FFFFFF', margin: '0 0 10px',
          }}>
            Find Authorized Dealers
          </h1>
          <p style={{ fontSize: 14, color: '#8E99A8', margin: '0 0 24px' }}>
            {(dealers ?? []).length} authorized showrooms across {cities.length} cities
          </p>

          {/* Filters */}
          <form method="get" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select name="brand" defaultValue={brand} style={SELECT}>
              <option value="">All Brands</option>
              {brands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
            <select name="type" defaultValue={type} style={SELECT}>
              <option value="">All Types</option>
              <option value="cars">Cars</option>
              <option value="bikes">Bikes</option>
              <option value="scooters">Scooters</option>
            </select>
            <button type="submit" style={{
              background: '#00D4FF', color: '#06142D',
              fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
              fontSize: 13, padding: '9px 20px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
            }}>
              Search
            </button>
            {(brand || type) && (
              <Link href="/dealers/" style={{
                background: 'rgba(255,255,255,0.06)', color: '#8E99A8',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '9px 16px', fontSize: 13,
                textDecoration: 'none', display: 'flex', alignItems: 'center',
              }}>
                Clear
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* City sections */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 72px' }}>
        {cities.length === 0 ? (
          <div style={{
            background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: 14, padding: '48px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏪</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>No dealers found</div>
            <p style={{ fontSize: 13, color: '#8E99A8', marginBottom: 20 }}>Try removing a filter.</p>
            <Link href="/dealers/" style={{
              background: '#00D4FF', color: '#06142D',
              fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
              padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 13,
            }}>View All Dealers</Link>
          </div>
        ) : cities.map(({ city, city_slug, dealers: cityDealers }) => (
          <section key={city_slug} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 900,
                color: '#FFFFFF', margin: 0,
              }}>
                {city}
                <span style={{ fontSize: 13, fontWeight: 600, color: '#8E99A8', marginLeft: 10 }}>
                  {cityDealers.length} dealer{cityDealers.length !== 1 ? 's' : ''}
                </span>
              </h2>
              <Link href={`/dealers/${city_slug}/`} style={{
                fontSize: 12, color: '#00D4FF', textDecoration: 'none', fontWeight: 600,
              }}>
                View all in {city} →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {cityDealers.map(d => (
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
                      <div style={{ fontSize: 12, color: '#8E99A8' }}>
                        {d.brand_name}{d.locality ? ` · ${d.locality}` : ''}
                      </div>
                    </div>
                    {d.is_authorized && (
                      <span style={{
                        background: 'rgba(0,204,102,0.1)', border: '1px solid rgba(0,204,102,0.25)',
                        color: '#00CC66', padding: '2px 8px', borderRadius: 12,
                        fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap', marginLeft: 8,
                      }}>✓ AUTH</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                    {d.vehicle_types.map(t => <TypePill key={t} type={t} />)}
                  </div>

                  {d.address && (
                    <div style={{ fontSize: 12, color: '#8E99A8', marginBottom: 8, display: 'flex', gap: 6 }}>
                      <span>📍</span>
                      <span>{d.address}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {d.rating && <StarRating rating={d.rating} />}
                      {d.phone && (
                        <a href={`tel:${d.phone}`} style={{ fontSize: 12, color: '#00D4FF', textDecoration: 'none' }}>
                          📞 {d.phone}
                        </a>
                      )}
                    </div>
                    {d.google_maps_url && (
                      <a href={d.google_maps_url} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: 11, color: '#8E99A8', textDecoration: 'none', fontWeight: 600,
                      }}>
                        Maps →
                      </a>
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
