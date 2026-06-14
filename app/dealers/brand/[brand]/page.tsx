import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

type Props = { params: Promise<{ brand: string }> }

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function fetchBrandData(brandSlug: string) {
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
  const rows = await fetchBrandData(brand)
  if (!rows.length) return { title: 'Not Found | AutoPortal360' }
  const brandName = rows[0].brand_name
  return {
    title: `${brandName} Dealers in India | AutoPortal360`,
    description: `Find authorized ${brandName} dealers across all cities in India.`,
    alternates: { canonical: `https://autoportal360.vercel.app/dealers/brand/${brand}/` },
  }
}

export default async function BrandDealersPage({ params }: Props) {
  const { brand } = await params
  const rows = await fetchBrandData(brand)
  if (!rows.length) notFound()

  const brandName = rows[0].brand_name

  // ── Build city map ──
  type CityEntry = {
    city: string
    city_slug: string
    state: string
    count: number
    types: Set<string>
  }
  const cityMap = new Map<string, CityEntry>()
  for (const r of rows) {
    const k = r.city_slug
    if (cityMap.has(k)) {
      cityMap.get(k)!.count++;
      (r.vehicle_types as string[]).forEach(v => cityMap.get(k)!.types.add(v))
    } else {
      cityMap.set(k, {
        city: r.city,
        city_slug: r.city_slug,
        state: r.state,
        count: 1,
        types: new Set(r.vehicle_types as string[]),
      })
    }
  }
  const cities = Array.from(cityMap.values()).sort((a, b) => b.count - a.count)

  // ── Build state map ──
  const stateMap = new Map<string, CityEntry[]>()
  for (const c of cities) {
    if (!stateMap.has(c.state)) stateMap.set(c.state, [])
    stateMap.get(c.state)!.push(c)
  }
  const states = Array.from(stateMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  const totalDealers = rows.length
  const totalCities  = cities.length
  const totalStates  = states.length

  return (
    <div className="min-h-screen bg-[#06142D]">

      {/* ── Breadcrumb ── */}
      <div className="bg-[#0A1F44] border-b border-[#1e3a6e]">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-[#C0C0C0]">
            <Link href="/" className="hover:text-[#00D4FF] transition-colors">Home</Link>
            <span className="text-[#444]">›</span>
            <Link href="/dealers/" className="hover:text-[#00D4FF] transition-colors">Dealers</Link>
            <span className="text-[#444]">›</span>
            <span className="text-white">{brandName}</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="bg-[#0A1F44] py-12 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Brand identity row */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#00D4FF] flex items-center justify-center shrink-0">
              <span className="text-[#06142D] font-bold text-2xl leading-none">
                {brandName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {brandName} Dealers in India
              </h1>
              <p className="text-[#C0C0C0] text-sm mt-1">
                {totalDealers} authorized showrooms across {totalCities} cities
              </p>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-[#06142D] border border-[#1e3a6e] rounded-xl px-6 py-4 text-center min-w-[100px]">
              <p className="text-3xl font-bold text-[#00D4FF]">{totalDealers}</p>
              <p className="text-[#C0C0C0] text-xs mt-1">Total Dealers</p>
            </div>
            <div className="bg-[#06142D] border border-[#1e3a6e] rounded-xl px-6 py-4 text-center min-w-[100px]">
              <p className="text-3xl font-bold text-[#00D4FF]">{totalCities}</p>
              <p className="text-[#C0C0C0] text-xs mt-1">Cities</p>
            </div>
            <div className="bg-[#06142D] border border-[#1e3a6e] rounded-xl px-6 py-4 text-center min-w-[100px]">
              <p className="text-3xl font-bold text-[#00D4FF]">{totalStates}</p>
              <p className="text-[#C0C0C0] text-xs mt-1">States</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* ── Select Your City ── */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-white mb-5">Select Your City</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cities.map(city => (
              <Link
                key={city.city_slug}
                href={`/dealers/${city.city_slug}/${brand}/`}
                className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4 hover:border-[#00D4FF] hover:bg-[#0d2a5a] transition-all block"
              >
                {/* Top row: city name + count badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-white font-semibold text-sm leading-tight">{city.city}</p>
                  <div className="w-8 h-8 rounded-full bg-[#06142D] border border-[#1e3a6e] flex items-center justify-center shrink-0">
                    <span className="text-[#00D4FF] text-xs font-bold">{city.count}</span>
                  </div>
                </div>
                <p className="text-[#666] text-xs mb-2">{city.state}</p>
                {/* Vehicle type tags */}
                <div className="flex gap-1 flex-wrap">
                  {Array.from(city.types).map(vt => (
                    <span
                      key={vt}
                      className="bg-[#06142D] border border-[#1e3a6e] text-[#C0C0C0] text-[10px] px-2 py-0.5 rounded-full capitalize"
                    >
                      {vt}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Browse by State ── */}
        {states.length > 1 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-5">Browse by State</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {states.map(([state, stateCities]) => (
                <div key={state} className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4">
                  <p className="text-white font-semibold text-sm mb-3">{state}</p>
                  <div className="space-y-1.5">
                    {stateCities.map(c => (
                      <Link
                        key={c.city_slug}
                        href={`/dealers/${c.city_slug}/${brand}/`}
                        className="flex items-center justify-between group"
                      >
                        <span className="text-[#C0C0C0] text-sm group-hover:text-[#00D4FF] transition-colors">
                          {c.city}
                        </span>
                        <span className="text-[#666] text-xs group-hover:text-[#00D4FF] transition-colors">
                          {c.count} dealer{c.count !== 1 ? 's' : ''}
                        </span>
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
  )
}
