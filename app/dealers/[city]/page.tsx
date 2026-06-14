// app/dealers/[city]/page.tsx
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

async function fetchCityDealers(citySlug: string) {
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
    description: `Find ${dealers.length} verified car, bike and scooter dealers in ${cityName}, ${state}. Compare showrooms by brand with ratings, contact info and directions.`,
    alternates: { canonical: `https://autoportal360.vercel.app/dealers/${city}/` },
  }
}

export default async function CityDealersPage({ params }: Props) {
  const { city } = await params
  const dealers = await fetchCityDealers(city)
  if (!dealers.length) notFound()

  const cityName  = dealers[0].city
  const stateName = dealers[0].state

  // Brand summary for filter pills
  const brandMap = new Map<string, { brand_name: string; brand_slug: string; count: number }>()
  for (const d of dealers) {
    if (brandMap.has(d.brand_slug)) brandMap.get(d.brand_slug)!.count++
    else brandMap.set(d.brand_slug, { brand_name: d.brand_name, brand_slug: d.brand_slug, count: 1 })
  }
  const brands = Array.from(brandMap.values()).sort((a, b) => b.count - a.count)

  // Count by vehicle type
  const carCount     = dealers.filter(d => d.vehicle_types.includes('cars')).length
  const bikeCount    = dealers.filter(d => d.vehicle_types.includes('bikes')).length
  const scooterCount = dealers.filter(d => d.vehicle_types.includes('scooters')).length

  return (
    <div className="min-h-screen bg-[#06142D]">
      {/* Breadcrumb */}
      <div className="bg-[#0A1F44] border-b border-[#1e3a6e]">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-[#C0C0C0] flex-wrap">
            <Link href="/" className="hover:text-[#00D4FF]">Home</Link>
            <span>›</span>
            <Link href="/dealers/" className="hover:text-[#00D4FF]">Dealers</Link>
            <span>›</span>
            <span className="text-white">{cityName}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0A1F44] to-[#06142D] py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Authorized Dealers in {cityName}
          </h1>
          <p className="text-[#C0C0C0] mb-6">
            {stateName} · {dealers.length} verified showrooms
          </p>

          {/* Vehicle type counts */}
          <div className="flex gap-3 flex-wrap mb-6">
            {carCount > 0 && (
              <div className="flex items-center gap-2 bg-[#111] border border-[#1e3a6e] rounded-xl px-4 py-2">
                <span className="text-lg">🚗</span>
                <span className="text-white text-sm font-medium">{carCount} Car dealers</span>
              </div>
            )}
            {bikeCount > 0 && (
              <div className="flex items-center gap-2 bg-[#111] border border-[#1e3a6e] rounded-xl px-4 py-2">
                <span className="text-lg">🏍️</span>
                <span className="text-white text-sm font-medium">{bikeCount} Bike dealers</span>
              </div>
            )}
            {scooterCount > 0 && (
              <div className="flex items-center gap-2 bg-[#111] border border-[#1e3a6e] rounded-xl px-4 py-2">
                <span className="text-lg">🛵</span>
                <span className="text-white text-sm font-medium">{scooterCount} Scooter dealers</span>
              </div>
            )}
          </div>

          {/* Brand filter pills — each links to brand+city page */}
          <div className="flex flex-wrap gap-2">
            {brands.map(b => (
              <Link
                key={b.brand_slug}
                href={`/dealers/${city}/${b.brand_slug}/`}
                className="bg-[#0A1F44] border border-[#1e3a6e] text-[#C0C0C0] hover:text-white hover:border-[#00D4FF] hover:bg-[#0d2a5a] text-sm px-4 py-2 rounded-full transition-all"
              >
                {b.brand_name}
                <span className="ml-1.5 text-[#00D4FF] text-xs font-bold">{b.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dealer list grouped by brand */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {brands.map(brand => {
          const brandDealers = dealers.filter(d => d.brand_slug === brand.brand_slug)
          return (
            <section key={brand.brand_slug} className="mb-10">
              {/* Brand header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#00D4FF] text-[#06142D] text-sm font-bold flex items-center justify-center">
                    {brand.brand_name.charAt(0)}
                  </span>
                  {brand.brand_name} in {cityName}
                </h2>
                <Link
                  href={`/dealers/${city}/${brand.brand_slug}/`}
                  className="text-[#00D4FF] text-sm hover:underline"
                >
                  View all {brand.count} →
                </Link>
              </div>

              {/* Dealer cards row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brandDealers.slice(0, 2).map(dealer => (
                  <DealerCardCompact key={dealer.id} dealer={dealer} />
                ))}
              </div>

              {brand.count > 2 && (
                <Link
                  href={`/dealers/${city}/${brand.brand_slug}/`}
                  className="mt-3 block w-full py-2.5 border border-[#1e3a6e] rounded-xl text-center text-[#C0C0C0] text-sm hover:border-[#00D4FF] hover:text-[#00D4FF] transition-colors"
                >
                  +{brand.count - 2} more {brand.brand_name} dealers in {cityName} →
                </Link>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function DealerCardCompact({ dealer }: { dealer: Dealer }) {
  return (
    <div className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4 hover:border-[#00D4FF]/40 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold text-sm truncate">{dealer.name}</h3>
            {dealer.is_authorized && (
              <span className="shrink-0 bg-green-900/40 text-green-400 border border-green-800 text-[10px] px-1.5 py-0.5 rounded-full">
                ✓ Auth
              </span>
            )}
          </div>
          <p className="text-[#666] text-xs mt-1 truncate">{dealer.address}</p>
          {dealer.working_hours && (
            <p className="text-[#C0C0C0] text-xs mt-1">🕒 {dealer.working_hours}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 justify-end">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-white text-xs font-bold">{dealer.rating}</span>
          </div>
          <p className="text-[#666] text-[10px]">{dealer.review_count} reviews</p>
        </div>
      </div>
      {dealer.phone && (
        <a
          href={`tel:${dealer.phone}`}
          className="mt-3 flex items-center gap-2 text-[#00D4FF] text-sm hover:underline"
        >
          📞 {dealer.phone}
        </a>
      )}
    </div>
  )
}
