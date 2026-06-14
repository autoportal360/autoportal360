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
    description: `Find authorized ${brandName} dealers across all cities in India. Browse showrooms with contact details and directions.`,
    alternates: { canonical: `https://autoportal360.vercel.app/dealers/brand/${brand}/` },
  }
}

export default async function BrandDealersPage({ params }: Props) {
  const { brand } = await params
  const rows = await fetchBrandData(brand)
  if (!rows.length) notFound()

  const brandName = rows[0].brand_name

  type CityEntry = { city: string; city_slug: string; state: string; count: number; types: Set<string> }
  const cityMap = new Map<string, CityEntry>()
  for (const r of rows) {
    const k = r.city_slug
    if (cityMap.has(k)) {
      cityMap.get(k)!.count++;
      (r.vehicle_types as string[]).forEach(v => cityMap.get(k)!.types.add(v))
    } else {
      cityMap.set(k, { city: r.city, city_slug: r.city_slug, state: r.state, count: 1, types: new Set(r.vehicle_types as string[]) })
    }
  }
  const cities = Array.from(cityMap.values()).sort((a, b) => b.count - a.count)

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

      {/* Breadcrumb */}
      <div className="bg-[#0A1F44]" style={{ borderBottom: '1px solid #1e3a6e' }}>
        <div className="max-w-5xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-[#C0C0C0]">
            <Link href="/" className="hover:text-[#00D4FF] transition-colors">Home</Link>
            <span style={{ color: '#444' }}>›</span>
            <Link href="/dealers/" className="hover:text-[#00D4FF] transition-colors">Dealers</Link>
            <span style={{ color: '#444' }}>›</span>
            <span className="text-white">{brandName}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#0A1F44] py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-8" style={{ gap: '1.25rem' }}>
            <div className="ap-avatar-xl">
              <span style={{ userSelect: 'none' }}>{brandName.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {brandName} Dealers in India
              </h1>
              <p className="text-[#C0C0C0] text-sm mt-1">
                {totalDealers} authorized showrooms across {totalCities} {totalCities === 1 ? 'city' : 'cities'}
              </p>
            </div>
          </div>

          {/* Stat boxes */}
          <div className="ap-stat-group">
            {[
              { label: 'Total Dealers', value: totalDealers },
              { label: 'Cities',        value: totalCities  },
              { label: 'States',        value: totalStates  },
            ].map(s => (
              <div key={s.label} className="ap-stat">
                <p className="text-3xl font-bold text-[#00D4FF]">{s.value}</p>
                <p className="text-[#C0C0C0] text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

        {/* Select Your City */}
        <section>
          <h2 className="text-lg font-bold text-white mb-5">Select Your City</h2>
          <div className="ap-grid-2x3">
            {cities.map(c => (
              <Link
                key={c.city_slug}
                href={`/dealers/${c.city_slug}/${brand}/`}
                className="ap-card"
              >
                <div className="flex items-center justify-between mb-2" style={{ gap: '.5rem' }}>
                  <p className="text-white font-semibold text-sm leading-tight">{c.city}</p>
                  <div className="ap-count-badge"><span>{c.count}</span></div>
                </div>
                <p style={{ color: '#666', fontSize: '.75rem', marginBottom: '.5rem' }}>{c.state}</p>
                <div className="flex flex-wrap" style={{ gap: '.25rem' }}>
                  {Array.from(c.types).map(vt => (
                    <span key={vt} className="ap-type-chip">{vt}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by State */}
        {states.length > 1 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-5">Browse by State</h2>
            <div className="ap-grid-states">
              {states.map(([state, stateCities]) => (
                <div key={state} className="ap-panel">
                  <p className="text-white font-semibold text-sm mb-3">{state}</p>
                  <div className="ap-stack-rows">
                    {stateCities.map(sc => (
                      <Link
                        key={sc.city_slug}
                        href={`/dealers/${sc.city_slug}/${brand}/`}
                        className="flex items-center justify-between py-1 group"
                      >
                        <span className="text-[#C0C0C0] text-sm group-hover:text-[#00D4FF] transition-colors">
                          {sc.city}
                        </span>
                        <span className="group-hover:text-[#00D4FF] transition-colors"
                          style={{ color: '#666', fontSize: '.75rem' }}>
                          {sc.count} dealer{sc.count !== 1 ? 's' : ''}
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
