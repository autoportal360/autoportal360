import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Dealer, DealerBrandSummary } from '@/types/dealer'

type Props = { params: Promise<{ city: string }> }

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function fetchCityDealers(citySlug: string) {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('dealers')
    .select('*')
    .eq('city_slug', citySlug)
    .eq('is_active', true)
    .order('brand_name', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as Dealer[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const dealers = await fetchCityDealers(city)
  if (!dealers.length) return { title: 'Dealers Not Found | AutoPortal360' }

  const cityName  = dealers[0].city
  const stateName = dealers[0].state
  const count     = dealers.length

  return {
    title: `${count} Authorized Car & Bike Dealers in ${cityName} | AutoPortal360`,
    description:
      `Find authorized car, bike and scooter dealers in ${cityName}, ${stateName}. ` +
      `Browse ${count} verified showrooms with contact details, working hours and directions.`,
    alternates: {
      canonical: `https://autoportal360.vercel.app/dealers/${city}/`,
    },
  }
}

// Dealer Card Component
function DealerCard({ dealer }: { dealer: Dealer }) {
  return (
    <div className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-5 hover:border-[#00D4FF]/50 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold text-base">{dealer.name}</h3>
            {dealer.is_authorized && (
              <span className="bg-green-900/40 text-green-400 border border-green-700/50 text-xs px-2 py-0.5 rounded-full">
                ✓ Authorized
              </span>
            )}
          </div>
          <p className="text-[#00D4FF] text-sm mt-0.5">{dealer.brand_name}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-white text-sm font-medium">{dealer.rating}</span>
          </div>
          <span className="text-[#666] text-xs">{dealer.review_count} reviews</span>
        </div>
      </div>

      {/* Vehicle types */}
      <div className="flex gap-1.5 mb-3">
        {dealer.vehicle_types.map(vt => (
          <span
            key={vt}
            className="bg-[#111] border border-[#1e3a6e] text-[#C0C0C0] text-xs px-2 py-0.5 rounded capitalize"
          >
            {vt}
          </span>
        ))}
      </div>

      {/* Address */}
      <div className="space-y-1.5 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-[#00D4FF] mt-0.5">📍</span>
          <p className="text-[#C0C0C0]">{dealer.address}</p>
        </div>
        {dealer.working_hours && (
          <div className="flex items-center gap-2">
            <span className="text-[#00D4FF]">🕒</span>
            <p className="text-[#C0C0C0]">{dealer.working_hours}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-[#1e3a6e]">
        {dealer.phone && (
          <a
            href={`tel:${dealer.phone.replace(/\s+/g, '')}`}
            className="flex-1 bg-[#00D4FF] text-[#06142D] font-semibold text-sm py-2 rounded-lg text-center hover:bg-[#4DEBFF] transition-colors"
          >
            📞 Call Now
          </a>
        )}
        {dealer.google_maps_url && (
          <a
            href={dealer.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#111] border border-[#1e3a6e] text-white text-sm py-2 rounded-lg text-center hover:border-[#00D4FF] transition-colors"
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

  // Aggregate brands in this city
  const brandMap = new Map<string, DealerBrandSummary>()
  for (const d of dealers) {
    if (brandMap.has(d.brand_slug)) brandMap.get(d.brand_slug)!.count++
    else brandMap.set(d.brand_slug, { brand_name: d.brand_name, brand_slug: d.brand_slug, count: 1 })
  }
  const brands = Array.from(brandMap.values()).sort((a, b) => b.count - a.count)

  // LocalBusiness schema for the city
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
          postalCode: d.pincode ?? undefined,
        },
        telephone: d.phone ?? undefined,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#06142D]">
        {/* ── Breadcrumb ── */}
        <div className="bg-[#0A1F44] border-b border-[#1e3a6e]">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <nav className="flex items-center gap-2 text-sm text-[#C0C0C0]">
              <Link href="/" className="hover:text-[#00D4FF] transition-colors">Home</Link>
              <span>›</span>
              <Link href="/dealers/" className="hover:text-[#00D4FF] transition-colors">Dealers</Link>
              <span>›</span>
              <span className="text-white">{cityName}</span>
            </nav>
          </div>
        </div>

        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-[#0A1F44] to-[#06142D] py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Authorized Dealers in {cityName}
            </h1>
            <p className="text-[#C0C0C0]">
              {dealers.length} verified showrooms in {cityName}, {stateName}
            </p>
            {/* Brand filter pills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {brands.map(b => (
                <Link
                  key={b.brand_slug}
                  href={`/dealers/${city}/${b.brand_slug}/`}
                  className="bg-[#111] border border-[#1e3a6e] text-[#C0C0C0] hover:text-[#00D4FF] hover:border-[#00D4FF] text-sm px-3 py-1.5 rounded-full transition-all"
                >
                  {b.brand_name} ({b.count})
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dealer Grid ── */}
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dealers.map(dealer => (
              <DealerCard key={dealer.id} dealer={dealer} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
