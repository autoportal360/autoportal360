import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Dealer } from '@/types/dealer'

type Props = { params: Promise<{ city: string }> }

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function fetchCityDealers(citySlug: string): Promise<Dealer[]> {
  const { data, error } = await getSupabase()
    .from('dealers')
    .select('*')
    .eq('city_slug', citySlug)
    .eq('is_active', true)
    .order('rating', { ascending: false })
  if (error) throw error
  return (data ?? []) as Dealer[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const dealers = await fetchCityDealers(city)
  if (!dealers.length) return { title: 'Not Found | AutoPortal360' }
  const { city: cityName, state } = dealers[0]
  return {
    title: `${dealers.length} Authorized Dealers in ${cityName} — Cars, Bikes & Scooters | AutoPortal360`,
    description: `Find ${dealers.length} verified car, bike and scooter dealers in ${cityName}, ${state}. Compare showrooms by brand, ratings, contact info and directions.`,
    alternates: { canonical: `https://autoportal360.vercel.app/dealers/${city}/` },
  }
}

function DealerCardCompact({ dealer }: { dealer: Dealer }) {
  return (
    <div className="ap-card" style={{ padding: '1rem' }}>
      <div className="flex items-start justify-between mb-3" style={{ gap: '.75rem' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap mb-1" style={{ gap: '.5rem' }}>
            <h3 className="text-white font-semibold text-sm">{dealer.name}</h3>
            {dealer.is_authorized && (
              <span style={{
                background: 'rgba(20,83,45,.4)', color: '#4ade80',
                border: '1px solid #166534', fontSize: '.625rem',
                padding: '.125rem .375rem', borderRadius: '9999px', flexShrink: 0
              }}>
                ✓ Auth
              </span>
            )}
          </div>
          {dealer.address && (
            <p className="truncate" style={{ color: '#666', fontSize: '.75rem' }}>{dealer.address}</p>
          )}
          {dealer.working_hours && (
            <p className="text-[#C0C0C0] text-xs mt-1">🕒 {dealer.working_hours}</p>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="flex items-center" style={{ gap: '.125rem', justifyContent: 'flex-end' }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ fontSize: '.75rem', color: i < Math.round(dealer.rating) ? '#facc15' : '#333' }}>★</span>
            ))}
          </div>
          <p style={{ color: '#666', fontSize: '.625rem', marginTop: '.125rem' }}>{dealer.review_count} reviews</p>
        </div>
      </div>

      <div className="ap-cta-row">
        {dealer.phone && (
          <a
            href={`tel:${dealer.phone.replace(/[\s\-()]/g, '')}`}
            className="ap-cta-call"
          >
            📞 Call Now
          </a>
        )}
        {dealer.google_maps_url && (
          <a
            href={dealer.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ap-cta-dir"
          >
            🗺️ Directions
          </a>
        )}
      </div>
    </div>
  )
}

export default async function CityDealersPage({ params }: Props) {
  const { city } = await params
  const dealers = await fetchCityDealers(city)
  if (!dealers.length) notFound()

  const cityName  = dealers[0].city
  const stateName = dealers[0].state

  const brandMap = new Map<string, { brand_name: string; brand_slug: string; count: number }>()
  for (const d of dealers) {
    if (brandMap.has(d.brand_slug)) brandMap.get(d.brand_slug)!.count++
    else brandMap.set(d.brand_slug, { brand_name: d.brand_name, brand_slug: d.brand_slug, count: 1 })
  }
  const brands = Array.from(brandMap.values()).sort((a, b) => b.count - a.count)

  const carCount     = dealers.filter(d => d.vehicle_types.includes('cars')).length
  const bikeCount    = dealers.filter(d => d.vehicle_types.includes('bikes')).length
  const scooterCount = dealers.filter(d => d.vehicle_types.includes('scooters')).length

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Authorized Vehicle Dealers in ${cityName}`,
    url: `https://autoportal360.vercel.app/dealers/${city}/`,
    numberOfItems: dealers.length,
    itemListElement: dealers.slice(0, 10).map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'AutoDealer',
        name: d.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: d.address,
          addressLocality: d.city,
          addressRegion: d.state,
          addressCountry: 'IN',
        },
        telephone: d.phone ?? undefined,
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#06142D]">

        {/* Breadcrumb */}
        <div className="bg-[#0A1F44]" style={{ borderBottom: '1px solid #1e3a6e' }}>
          <div className="max-w-5xl mx-auto px-6 py-3">
            <nav className="flex items-center gap-2 text-sm text-[#C0C0C0]">
              <Link href="/" className="hover:text-[#00D4FF] transition-colors">Home</Link>
              <span style={{ color: '#444' }}>›</span>
              <Link href="/dealers/" className="hover:text-[#00D4FF] transition-colors">Dealers</Link>
              <span style={{ color: '#444' }}>›</span>
              <span className="text-white">{cityName}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-[#0A1F44] py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Authorized Dealers in {cityName}
            </h1>
            <p className="text-[#C0C0C0] text-sm mb-6">
              {stateName} · {dealers.length} verified showrooms
            </p>

            {/* Vehicle type counts */}
            <div className="ap-tab-group mb-6">
              {carCount > 0 && (
                <div className="ap-chip">
                  <span>🚗</span>
                  <span className="text-white text-sm font-medium">{carCount} Car dealers</span>
                </div>
              )}
              {bikeCount > 0 && (
                <div className="ap-chip">
                  <span>🏍️</span>
                  <span className="text-white text-sm font-medium">{bikeCount} Bike dealers</span>
                </div>
              )}
              {scooterCount > 0 && (
                <div className="ap-chip">
                  <span>🛵</span>
                  <span className="text-white text-sm font-medium">{scooterCount} Scooter dealers</span>
                </div>
              )}
            </div>

            {/* Brand filter pills */}
            <div className="flex flex-wrap" style={{ gap: '.5rem' }}>
              {brands.map(b => (
                <Link
                  key={b.brand_slug}
                  href={`/dealers/${city}/${b.brand_slug}/`}
                  className="ap-pill"
                >
                  {b.brand_name}<span className="ap-pill-count">{b.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Dealers grouped by brand */}
        <div className="max-w-5xl mx-auto px-6 py-10" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {brands.map(b => {
            const bDealers = dealers.filter(d => d.brand_slug === b.brand_slug)
            return (
              <section key={b.brand_slug}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white flex items-center" style={{ gap: '.5rem' }}>
                    <div className="ap-avatar-xs">
                      {b.brand_name.charAt(0)}
                    </div>
                    {b.brand_name} in {cityName}
                  </h2>
                  <Link href={`/dealers/${city}/${b.brand_slug}/`} className="text-[#00D4FF] text-sm hover:underline shrink-0">
                    View all {b.count} →
                  </Link>
                </div>

                <div className="ap-grid-dealers">
                  {bDealers.slice(0, 2).map(d => (
                    <DealerCardCompact key={d.id} dealer={d} />
                  ))}
                </div>

                {b.count > 2 && (
                  <Link
                    href={`/dealers/${city}/${b.brand_slug}/`}
                    className="ap-view-all"
                    style={{ marginTop: '.75rem' }}
                  >
                    +{b.count - 2} more {b.brand_name} dealers in {cityName} →
                  </Link>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </>
  )
}
