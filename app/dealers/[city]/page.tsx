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
    <div className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4 hover:border-[#00D4FF] transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-white font-semibold text-sm">{dealer.name}</h3>
            {dealer.is_authorized && (
              <span className="shrink-0 bg-green-900/40 text-green-400 border border-green-800 text-[10px] px-1.5 py-0.5 rounded-full">
                ✓ Auth
              </span>
            )}
          </div>
          {dealer.address && (
            <p className="text-[#666] text-xs truncate">{dealer.address}</p>
          )}
          {dealer.working_hours && (
            <p className="text-[#C0C0C0] text-xs mt-1">🕒 {dealer.working_hours}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-0.5 justify-end">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-xs ${i < Math.round(dealer.rating) ? 'text-yellow-400' : 'text-[#333]'}`}>★</span>
            ))}
          </div>
          <p className="text-[#666] text-[10px] mt-0.5">{dealer.review_count} reviews</p>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-[#1e3a6e]">
        {dealer.phone && (
          <a
            href={`tel:${dealer.phone.replace(/[\s\-()]/g, '')}`}
            className="flex-1 bg-[#00D4FF] text-[#06142D] font-bold text-xs py-2 rounded-lg text-center hover:bg-[#4DEBFF] transition-colors"
          >
            📞 Call Now
          </a>
        )}
        {dealer.google_maps_url && (
          <a
            href={dealer.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#06142D] border border-[#1e3a6e] text-[#C0C0C0] text-xs py-2 rounded-lg text-center hover:border-[#00D4FF] hover:text-white transition-colors"
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
        <div className="bg-[#0A1F44] border-b border-[#1e3a6e]">
          <div className="max-w-5xl mx-auto px-6 py-3">
            <nav className="flex items-center gap-2 text-sm text-[#C0C0C0]">
              <Link href="/" className="hover:text-[#00D4FF] transition-colors">Home</Link>
              <span className="text-[#444]">›</span>
              <Link href="/dealers/" className="hover:text-[#00D4FF] transition-colors">Dealers</Link>
              <span className="text-[#444]">›</span>
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
            <div className="flex gap-3 flex-wrap mb-6">
              {carCount > 0 && (
                <div className="flex items-center gap-2 bg-[#06142D] border border-[#1e3a6e] rounded-xl px-4 py-2">
                  <span>🚗</span>
                  <span className="text-white text-sm font-medium">{carCount} Car dealers</span>
                </div>
              )}
              {bikeCount > 0 && (
                <div className="flex items-center gap-2 bg-[#06142D] border border-[#1e3a6e] rounded-xl px-4 py-2">
                  <span>🏍️</span>
                  <span className="text-white text-sm font-medium">{bikeCount} Bike dealers</span>
                </div>
              )}
              {scooterCount > 0 && (
                <div className="flex items-center gap-2 bg-[#06142D] border border-[#1e3a6e] rounded-xl px-4 py-2">
                  <span>🛵</span>
                  <span className="text-white text-sm font-medium">{scooterCount} Scooter dealers</span>
                </div>
              )}
            </div>

            {/* Brand filter pills */}
            <div className="flex flex-wrap gap-2">
              {brands.map(b => (
                <Link
                  key={b.brand_slug}
                  href={`/dealers/${city}/${b.brand_slug}/`}
                  className="bg-[#06142D] border border-[#1e3a6e] text-[#C0C0C0] hover:border-[#00D4FF] hover:text-[#00D4FF] text-sm px-4 py-1.5 rounded-full transition-all"
                >
                  {b.brand_name}
                  <span className="ml-1.5 text-[#00D4FF] text-xs font-bold">{b.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Dealers grouped by brand */}
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
          {brands.map(b => {
            const bDealers = dealers.filter(d => d.brand_slug === b.brand_slug)
            return (
              <section key={b.brand_slug}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#00D4FF] text-[#06142D] text-xs font-bold flex items-center justify-center shrink-0 select-none">
                      {b.brand_name.charAt(0)}
                    </span>
                    {b.brand_name} in {cityName}
                  </h2>
                  <Link href={`/dealers/${city}/${b.brand_slug}/`} className="text-[#00D4FF] text-sm hover:underline shrink-0">
                    View all {b.count} →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bDealers.slice(0, 2).map(d => (
                    <DealerCardCompact key={d.id} dealer={d} />
                  ))}
                </div>

                {b.count > 2 && (
                  <Link
                    href={`/dealers/${city}/${b.brand_slug}/`}
                    className="mt-3 block w-full py-2.5 bg-[#0A1F44] border border-[#1e3a6e] rounded-xl text-center text-[#C0C0C0] text-sm hover:border-[#00D4FF] hover:text-[#00D4FF] transition-colors"
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
