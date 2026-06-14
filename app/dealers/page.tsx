import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { DealerCitySummary, DealerBrandSummary } from '@/types/dealer'

export const metadata: Metadata = {
  title: 'Find Authorized Car & Bike Dealers in India | AutoPortal360',
  description:
    'Locate authorized car, bike and scooter dealers across 974 Indian cities. Compare showrooms by brand — Tata, Maruti Suzuki, Hyundai, Bajaj, Hero, TVS and more.',
  alternates: { canonical: 'https://autoportal360.vercel.app/dealers/' },
}

async function fetchDealerOverview() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [dealersRes, citiesRes] = await Promise.all([
    supabase.from('dealers').select('brand_slug, brand_name, city, city_slug, state').eq('is_active', true),
    supabase.from('dealers').select('city, city_slug, state').eq('is_active', true),
  ])

  // Aggregate brands
  const brandMap = new Map<string, DealerBrandSummary>()
  for (const row of dealersRes.data ?? []) {
    const key = row.brand_slug
    if (brandMap.has(key)) brandMap.get(key)!.count++
    else brandMap.set(key, { brand_name: row.brand_name, brand_slug: row.brand_slug, count: 1 })
  }

  // Aggregate cities
  const cityMap = new Map<string, DealerCitySummary>()
  for (const row of citiesRes.data ?? []) {
    const key = row.city_slug
    if (cityMap.has(key)) cityMap.get(key)!.count++
    else cityMap.set(key, { city: row.city, city_slug: row.city_slug, state: row.state, count: 1 })
  }

  return {
    brands: Array.from(brandMap.values()).sort((a, b) => b.count - a.count),
    cities: Array.from(cityMap.values()).sort((a, b) => b.count - a.count),
    totalDealers: (dealersRes.data ?? []).length,
  }
}

export default async function DealersPage() {
  const { brands, cities, totalDealers } = await fetchDealerOverview()

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Authorized Vehicle Dealers in India',
    description: `Find ${totalDealers} authorized car, bike and scooter dealers across India`,
    url: 'https://autoportal360.vercel.app/dealers/',
    numberOfItems: totalDealers,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#06142D]">
        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-[#0A1F44] to-[#06142D] py-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Find Authorized Dealers in India
            </h1>
            <p className="text-[#C0C0C0] text-lg">
              {totalDealers} verified showrooms across {cities.length} cities.
              Cars, bikes and scooters — all in one place.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* ── Browse by Brand ── */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6">
              Browse Dealer Showrooms by Brand
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {brands.map(brand => (
                <Link
                  key={brand.brand_slug}
                  href={`/dealers/?brand=${brand.brand_slug}`}
                  className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4 hover:border-[#00D4FF] hover:bg-[#0d2a5a] transition-all group text-center"
                >
                  <div className="w-10 h-10 bg-[#111] rounded-full flex items-center justify-center mx-auto mb-2 border border-[#1e3a6e] group-hover:border-[#00D4FF]">
                    <span className="text-[#00D4FF] text-sm font-bold">
                      {brand.brand_name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium group-hover:text-[#00D4FF] transition-colors">
                    {brand.brand_name}
                  </p>
                  <p className="text-[#C0C0C0] text-xs mt-0.5">
                    {brand.count} dealer{brand.count !== 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Browse by City ── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6">
              Browse Dealers by City
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cities.map(city => (
                <Link
                  key={city.city_slug}
                  href={`/dealers/${city.city_slug}/`}
                  className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4 hover:border-[#00D4FF] hover:bg-[#0d2a5a] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium group-hover:text-[#00D4FF] transition-colors">
                        {city.city}
                      </p>
                      <p className="text-[#C0C0C0] text-xs mt-0.5">{city.state}</p>
                    </div>
                    <span className="bg-[#111] text-[#00D4FF] text-xs font-bold px-2.5 py-1 rounded-full border border-[#1e3a6e]">
                      {city.count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
