import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Dealer } from '@/types/dealer'

type Props = { params: Promise<{ city: string; brand: string }> }

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function fetchData(citySlug: string, brandSlug: string) {
  const supabase = getSupabase()
  const [mainRes, otherRes] = await Promise.all([
    supabase.from('dealers').select('*')
      .eq('city_slug', citySlug).eq('brand_slug', brandSlug).eq('is_active', true)
      .order('rating', { ascending: false }),
    supabase.from('dealers').select('brand_slug, brand_name')
      .eq('city_slug', citySlug).eq('is_active', true)
      .neq('brand_slug', brandSlug),
  ])
  return {
    dealers:     (mainRes.data ?? []) as Dealer[],
    otherBrands: otherRes.data ?? [],
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, brand } = await params
  const { dealers } = await fetchData(city, brand)
  if (!dealers.length) return { title: 'Not Found | AutoPortal360' }
  const { city: cityName, brand_name, state } = dealers[0]
  return {
    title: `${brand_name} Dealers in ${cityName} — ${dealers.length} Showrooms | AutoPortal360`,
    description: `Find all ${dealers.length} authorized ${brand_name} dealer showrooms in ${cityName}, ${state}. Get phone numbers, addresses, ratings and directions.`,
    alternates: { canonical: `https://autoportal360.vercel.app/dealers/${city}/${brand}/` },
  }
}

function DealerFullCard({ dealer, rank }: { dealer: Dealer; rank: number }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: dealer.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: dealer.address,
      addressLocality: dealer.city,
      addressRegion: dealer.state,
      postalCode: dealer.pincode ?? undefined,
      addressCountry: 'IN',
    },
    telephone: dealer.phone ?? undefined,
    email: dealer.email ?? undefined,
    url: dealer.website ?? undefined,
    openingHours: dealer.working_hours ?? undefined,
    ...(dealer.review_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: dealer.rating,
        reviewCount: dealer.review_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }

  return (
    <div className="ap-card-p5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex items-start" style={{ gap: '1rem' }}>
        {/* Rank */}
        <div className="ap-rank-badge" style={{ userSelect: 'none' }}>{rank}</div>

        <div className="flex-1 min-w-0">
          {/* Name + authorized badge */}
          <div className="flex items-center flex-wrap mb-2" style={{ gap: '.5rem' }}>
            <h2 className="text-white font-bold text-base">{dealer.name}</h2>
            {dealer.is_authorized && (
              <span style={{
                background: 'rgba(20,83,45,.4)', color: '#4ade80',
                border: '1px solid #166534', fontSize: '.75rem',
                padding: '.125rem .5rem', borderRadius: '9999px', fontWeight: 500, flexShrink: 0
              }}>
                ✓ Authorized
              </span>
            )}
          </div>

          {/* Vehicle type tags */}
          <div className="flex flex-wrap mb-4" style={{ gap: '.375rem' }}>
            {dealer.vehicle_types.map(vt => (
              <span key={vt} className="ap-type-chip">
                {vt === 'cars' ? '🚗' : vt === 'bikes' ? '🏍️' : '🛵'} {vt}
              </span>
            ))}
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 text-sm mb-4" style={{ gap: '.5rem' }}>
            <div className="flex items-start" style={{ gap: '.5rem' }}>
              <span className="text-[#00D4FF] shrink-0 mt-0.5">📍</span>
              <p className="text-[#C0C0C0] leading-snug">{dealer.address}</p>
            </div>
            {dealer.locality && (
              <div className="flex items-center" style={{ gap: '.5rem' }}>
                <span className="text-[#00D4FF]">📌</span>
                <p className="text-[#C0C0C0]">{dealer.locality}{dealer.pincode ? ` — ${dealer.pincode}` : ''}</p>
              </div>
            )}
            {dealer.working_hours && (
              <div className="flex items-center" style={{ gap: '.5rem' }}>
                <span className="text-[#00D4FF]">🕒</span>
                <p className="text-[#C0C0C0]">{dealer.working_hours}</p>
              </div>
            )}
            {dealer.phone && (
              <div className="flex items-center" style={{ gap: '.5rem' }}>
                <span className="text-[#00D4FF]">📞</span>
                <a href={`tel:${dealer.phone}`} className="text-white hover:text-[#00D4FF] transition-colors font-medium">
                  {dealer.phone}
                </a>
              </div>
            )}
            {dealer.email && (
              <div className="flex items-center" style={{ gap: '.5rem' }}>
                <span className="text-[#00D4FF]">✉️</span>
                <a href={`mailto:${dealer.email}`} className="text-[#C0C0C0] hover:text-[#00D4FF] transition-colors text-xs truncate">
                  {dealer.email}
                </a>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center mb-4" style={{ gap: '.5rem' }}>
            <div className="flex items-center" style={{ gap: '.125rem' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ fontSize: '.875rem', color: i < Math.round(dealer.rating) ? '#facc15' : '#333' }}>★</span>
              ))}
            </div>
            <span className="text-white text-sm font-bold">{dealer.rating}</span>
            <span style={{ color: '#666', fontSize: '.75rem' }}>({dealer.review_count} reviews)</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap" style={{ gap: '.5rem' }}>
            {dealer.phone && (
              <a
                href={`tel:${dealer.phone.replace(/[\s\-()]/g, '')}`}
                className="ap-btn-cyan"
              >
                📞 Call Now
              </a>
            )}
            {dealer.google_maps_url && (
              <a
                href={dealer.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ap-btn-outline"
              >
                🗺️ Directions
              </a>
            )}
            {dealer.website && (
              <a
                href={dealer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="ap-btn-ghost"
              >
                🌐 Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function BrandCityPage({ params }: Props) {
  const { city, brand } = await params
  const { dealers, otherBrands } = await fetchData(city, brand)
  if (!dealers.length) notFound()

  const { city: cityName, brand_name, state } = dealers[0]
  const avgRating = (dealers.reduce((s, d) => s + d.rating, 0) / dealers.length).toFixed(1)
  const authCount = dealers.filter(d => d.is_authorized).length

  const otherBrandMap = new Map<string, { brand_name: string; count: number }>()
  for (const r of otherBrands) {
    if (otherBrandMap.has(r.brand_slug)) otherBrandMap.get(r.brand_slug)!.count++
    else otherBrandMap.set(r.brand_slug, { brand_name: r.brand_name, count: 1 })
  }
  const otherBrandList = Array.from(otherBrandMap.entries())
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen bg-[#06142D]">

      {/* Breadcrumb */}
      <div className="bg-[#0A1F44]" style={{ borderBottom: '1px solid #1e3a6e' }}>
        <div className="max-w-5xl mx-auto px-6 py-3">
          <nav className="flex items-center flex-wrap gap-2 text-sm text-[#C0C0C0]">
            <Link href="/" className="hover:text-[#00D4FF] transition-colors">Home</Link>
            <span style={{ color: '#444' }}>›</span>
            <Link href="/dealers/" className="hover:text-[#00D4FF] transition-colors">Dealers</Link>
            <span style={{ color: '#444' }}>›</span>
            <Link href={`/dealers/brand/${brand}/`} className="hover:text-[#00D4FF] transition-colors">{brand_name}</Link>
            <span style={{ color: '#444' }}>›</span>
            <Link href={`/dealers/${city}/`} className="hover:text-[#00D4FF] transition-colors">{cityName}</Link>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#0A1F44] py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6" style={{ gap: '1rem' }}>
            <div className="ap-avatar-lg" style={{ userSelect: 'none' }}>
              {brand_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {brand_name} Dealers in {cityName}
              </h1>
              <p className="text-[#C0C0C0] text-sm mt-1">
                {state} · {dealers.length} authorized showroom{dealers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="ap-stat-group">
            {[
              { label: 'Showrooms',  value: dealers.length },
              { label: 'Avg Rating', value: `★ ${avgRating}` },
              { label: 'Authorized', value: authCount },
            ].map(s => (
              <div key={s.label} className="ap-stat">
                <p className="text-xl font-bold text-[#00D4FF]">{s.value}</p>
                <p className="text-[#C0C0C0] text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content + sidebar */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start" style={{ gap: '2rem' }}>

          {/* Dealer cards */}
          <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dealers.map((d, i) => (
              <DealerFullCard key={d.id} dealer={d} rank={i + 1} />
            ))}
          </div>

          {/* Sidebar */}
          <aside className="ap-sidebar-wrap">
            <div className="ap-sidebar">
              {otherBrandList.length > 0 && (
                <div className="ap-panel">
                  <p className="text-white font-semibold text-sm mb-4">Other Brands in {cityName}</p>
                  <div className="ap-stack-rows">
                    {otherBrandList.slice(0, 8).map(b => (
                      <Link
                        key={b.slug}
                        href={`/dealers/${city}/${b.slug}/`}
                        className="flex items-center justify-between py-1 group"
                      >
                        <span className="text-[#C0C0C0] text-sm group-hover:text-[#00D4FF] transition-colors">{b.brand_name}</span>
                        <span style={{ color: '#666', fontSize: '.75rem' }} className="group-hover:text-[#00D4FF] transition-colors">{b.count}</span>
                      </Link>
                    ))}
                  </div>
                  <Link href={`/dealers/${city}/`} className="block mt-4 text-[#00D4FF] text-xs hover:underline">
                    All dealers in {cityName} →
                  </Link>
                </div>
              )}

              <div className="ap-panel">
                <p className="text-white font-semibold text-sm mb-3">{brand_name} in Other Cities</p>
                <Link href={`/dealers/brand/${brand}/`} className="text-[#00D4FF] text-sm hover:underline">
                  View all {brand_name} cities →
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile: other brands */}
        {otherBrandList.length > 0 && (
          <section style={{ marginTop: '2.5rem' }}>
            <p className="text-white font-semibold mb-4">Other Brands in {cityName}</p>
            <div className="flex flex-wrap" style={{ gap: '.5rem' }}>
              {otherBrandList.map(b => (
                <Link
                  key={b.slug}
                  href={`/dealers/${city}/${b.slug}/`}
                  className="ap-pill"
                >
                  {b.brand_name}<span className="ap-pill-count">{b.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
