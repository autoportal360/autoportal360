// app/dealers/brand/[brand]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Dealer } from '@/types/dealer'

type Props = { params: Promise<{ brand: string }> }

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function fetchBrandDealers(brandSlug: string) {
  const { data, error } = await getSupabase()
    .from('dealers')
    .select('city, city_slug, state, vehicle_types, brand_name')
    .eq('brand_slug', brandSlug)
    .eq('is_active', true)
  if (error) throw error
  return data ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  const data = await fetchBrandDealers(brand)
  if (!data.length) return { title: 'Brand Not Found | AutoPortal360' }
  const brandName = data[0].brand_name
  return {
    title: `${brandName} Dealers in India — All Cities | AutoPortal360`,
    description: `Find authorized ${brandName} dealers across India. Browse ${data.length}+ showrooms in all cities with contact details and directions.`,
    alternates: { canonical: `https://autoportal360.vercel.app/dealers/brand/${brand}/` },
  }
}

export default async function BrandDealersPage({ params }: Props) {
  const { brand } = await params
  const rows = await fetchBrandDealers(brand)
  if (!rows.length) notFound()

  const brandName = rows[0].brand_name

  // Aggregate cities with counts
  const cityMap = new Map<string, { city: string; city_slug: string; state: string; count: number; vehicle_types: Set<string> }>()
  for (const r of rows) {
    const k = r.city_slug
    if (cityMap.has(k)) {
      cityMap.get(k)!.count++;
      (r.vehicle_types as string[]).forEach(v => cityMap.get(k)!.vehicle_types.add(v))
    } else {
      cityMap.set(k, { city: r.city, city_slug: r.city_slug, state: r.state, count: 1, vehicle_types: new Set(r.vehicle_types as string[]) })
    }
  }
  const cities = Array.from(cityMap.values()).sort((a, b) => b.count - a.count)

  // Group by state for "Browse by state" section
  const stateMap = new Map<string, typeof cities>()
  for (const c of cities) {
    if (!stateMap.has(c.state)) stateMap.set(c.state, [])
    stateMap.get(c.state)!.push(c)
  }
  const states = Array.from(stateMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  const totalDealers = rows.length

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: `${brandName} Authorized Dealers in India`,
    url: `https://autoportal360.vercel.app/dealers/brand/${brand}/`,
    areaServed: { '@type': 'Country', name: 'India' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#06142D]">
        {/* Breadcrumb */}
        <div className="bg-[#0A1F44] border-b border-[#1e3a6e]">
          <div className="max-w-5xl mx-auto px-6 py-3">
            <nav className="flex items-center gap-2 text-sm text-[#C0C0C0] flex-wrap">
              <Link href="/" className="hover:text-[#00D4FF]">Home</Link>
              <span>›</span>
              <Link href="/dealers/" className="hover:text-[#00D4FF]">Dealers</Link>
              <span>›</span>
              <span className="text-white">{brandName}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-b from-[#0A1F44] to-[#06142D] py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              {/* Brand avatar */}
              <div className="w-16 h-16 rounded-2xl bg-[#00D4FF] flex items-center justify-center text-[#06142D] text-2xl font-bold shrink-0">
                {brandName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {brandName} Dealers in India
                </h1>
                <p className="text-[#C0C0C0] mt-1">
                  {totalDealers} authorized showrooms across {cities.length} cities
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 mt-5 flex-wrap">
              <div className="bg-[#111] border border-[#1e3a6e] rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-[#00D4FF]">{totalDealers}</p>
                <p className="text-[#C0C0C0] text-xs">Total Dealers</p>
              </div>
              <div className="bg-[#111] border border-[#1e3a6e] rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-[#00D4FF]">{cities.length}</p>
                <p className="text-[#C0C0C0] text-xs">Cities</p>
              </div>
              <div className="bg-[#111] border border-[#1e3a6e] rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-[#00D4FF]">{states.length}</p>
                <p className="text-[#C0C0C0] text-xs">States</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 pb-16">
          {/* ── Cities grid — direct, no state middleman ── */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-white mb-5">
              Select Your City
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cities.map(city => (
                <Link
                  key={city.city_slug}
                  href={`/dealers/${city.city_slug}/${brand}/`}
                  className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4 hover:border-[#00D4FF] hover:bg-[#0d2a5a] transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold group-hover:text-[#00D4FF] transition-colors">
                      {city.city}
                    </p>
                    <span className="bg-[#06142D] border border-[#1e3a6e] text-[#00D4FF] text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      {city.count}
                    </span>
                  </div>
                  <p className="text-[#666] text-xs">{city.state}</p>
                  {/* Vehicle type badges */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {Array.from(city.vehicle_types).map(vt => (
                      <span key={vt} className="text-[10px] text-[#C0C0C0] bg-[#111] px-1.5 py-0.5 rounded capitalize">
                        {vt}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Browse by State (secondary navigation) ── */}
          {states.length > 1 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-5">Browse by State</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {states.map(([state, stateCities]) => (
                  <div key={state} className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4">
                    <p className="text-white font-semibold mb-3 text-sm">{state}</p>
                    <div className="flex flex-wrap gap-2">
                      {stateCities.map(c => (
                        <Link
                          key={c.city_slug}
                          href={`/dealers/${c.city_slug}/${brand}/`}
                          className="text-[#C0C0C0] hover:text-[#00D4FF] text-sm transition-colors"
                        >
                          {c.city} ({c.count})
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
