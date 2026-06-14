// app/dealers/[city]/[brand]/page.tsx
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
  const [mainRes, otherBrandsRes] = await Promise.all([
    // Main: dealers of this brand in this city
    supabase.from('dealers').select('*')
      .eq('city_slug', citySlug).eq('brand_slug', brandSlug).eq('is_active', true)
      .order('rating', { ascending: false }),
    // Other brands in this city for "Other showrooms" section
    supabase.from('dealers').select('brand_slug, brand_name')
      .eq('city_slug', citySlug).eq('is_active', true)
      .neq('brand_slug', brandSlug),
  ])
  return {
    dealers:     (mainRes.data   ?? []) as Dealer[],
    otherBrands: otherBrandsRes.data ?? [],
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, brand } = await params
  const { dealers } = await fetchData(city, brand)
  if (!dealers.length) return { title: 'Not Found | AutoPortal360' }
  const { city: cityName, brand_name, state } = dealers[0]
  return {
    title: `${brand_name} Dealers in ${cityName} — ${dealers.length} Showrooms | AutoPortal360`,
    description:
      `Find all ${dealers.length} authorized ${brand_name} dealer showrooms in ${cityName}, ${state}. ` +
      `Get phone numbers, addresses, ratings and directions for ${brand_name} dealers near you.`,
    alternates: { canonical: `https://autoportal360.vercel.app/dealers/${city}/${brand}/` },
  }
}

export default async function BrandCityPage({ params }: Props) {
  const { city, brand } = await params
  const { dealers, otherBrands } = await fetchData(city, brand)
  if (!dealers.length) notFound()

  const { city: cityName, brand_name, state } = dealers[0]
  const avgRating = (dealers.reduce((s, d) => s + d.rating, 0) / dealers.length).toFixed(1)

  // Other brands count map
  const otherBrandMap = new Map<string, { brand_name: string; count: number }>()
  for (const r of otherBrands) {
    if (otherBrandMap.has(r.brand_slug)) otherBrandMap.get(r.brand_slug)!.count++
    else otherBrandMap.set(r.brand_slug, { brand_name: r.brand_name, count: 1 })
  }
  const otherBrandList = Array.from(otherBrandMap.entries())
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.count - a.count)

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brand_name} Dealers in ${cityName}`,
    url:  `https://autoportal360.vercel.app/dealers/${city}/${brand}/`,
    numberOfItems: dealers.length,
    itemListElement: dealers.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type':     'AutoDealer',
        name:        d.name,
        telephone:   d.phone   ?? undefined,
        email:       d.email   ?? undefined,
        url:         d.website ?? undefined,
        openingHours: d.working_hours ?? undefined,
        address: {
          '@type':          'PostalAddress',
          streetAddress:    d.address,
          addressLocality:  d.city,
          addressRegion:    d.state,
          postalCode:       d.pincode ?? undefined,
          addressCountry:   'IN',
        },
        ...(d.review_count > 0 && {
          aggregateRating: {
            '@type':       'AggregateRating',
            ratingValue:   d.rating,
            reviewCount:   d.review_count,
            bestRating:    5,
            worstRating:   1,
          },
        }),
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
            <nav className="flex items-center gap-2 text-sm text-[#C0C0C0] flex-wrap">
              <Link href="/" className="hover:text-[#00D4FF]">Home</Link>
              <span>›</span>
              <Link href="/dealers/" className="hover:text-[#00D4FF]">Dealers</Link>
              <span>›</span>
              <Link href={`/dealers/brand/${brand}/`} className="hover:text-[#00D4FF]">{brand_name}</Link>
              <span>›</span>
              <Link href={`/dealers/${city}/`} className="hover:text-[#00D4FF]">{cityName}</Link>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-b from-[#0A1F44] to-[#06142D] py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00D4FF] text-[#06142D] font-bold text-xl flex items-center justify-center shrink-0">
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

            {/* Summary stats */}
            <div className="flex gap-3 flex-wrap mt-5">
              <div className="bg-[#111] border border-[#1e3a6e] rounded-xl px-5 py-3 text-center">
                <p className="text-xl font-bold text-[#00D4FF]">{dealers.length}</p>
                <p className="text-[#C0C0C0] text-xs">Showrooms</p>
              </div>
              <div className="bg-[#111] border border-[#1e3a6e] rounded-xl px-5 py-3 text-center">
                <p className="text-xl font-bold text-[#00D4FF]">★ {avgRating}</p>
                <p className="text-[#C0C0C0] text-xs">Avg Rating</p>
              </div>
              <div className="bg-[#111] border border-[#1e3a6e] rounded-xl px-5 py-3 text-center">
                <p className="text-xl font-bold text-[#00D4FF]">
                  {dealers.filter(d => d.is_authorized).length}
                </p>
                <p className="text-[#C0C0C0] text-xs">Authorized</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main layout: cards + sidebar */}
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className="flex gap-8">

            {/* ── Dealer Cards ── */}
            <div className="flex-1 min-w-0">
              <div className="space-y-4">
                {dealers.map((dealer, idx) => (
                  <DealerFullCard key={dealer.id} dealer={dealer} rank={idx + 1} />
                ))}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-6 space-y-5">

                {/* Other brands in this city */}
                {otherBrandList.length > 0 && (
                  <div className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-5">
                    <h3 className="text-white font-semibold text-sm mb-4">
                      Other Brands in {cityName}
                    </h3>
                    <div className="space-y-2">
                      {otherBrandList.slice(0, 8).map(b => (
                        <Link
                          key={b.slug}
                          href={`/dealers/${city}/${b.slug}/`}
                          className="flex items-center justify-between py-1.5 text-[#C0C0C0] hover:text-[#00D4FF] transition-colors group"
                        >
                          <span className="text-sm group-hover:text-[#00D4FF]">{b.brand_name}</span>
                          <span className="text-xs text-[#666] group-hover:text-[#00D4FF]">{b.count}</span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/dealers/${city}/`}
                      className="block mt-4 text-[#00D4FF] text-xs hover:underline"
                    >
                      All dealers in {cityName} →
                    </Link>
                  </div>
                )}

                {/* Other cities for this brand */}
                <div className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-5">
                  <h3 className="text-white font-semibold text-sm mb-3">
                    {brand_name} in Other Cities
                  </h3>
                  <Link
                    href={`/dealers/brand/${brand}/`}
                    className="text-[#00D4FF] text-sm hover:underline"
                  >
                    View all {brand_name} cities →
                  </Link>
                </div>

              </div>
            </aside>
          </div>

          {/* Mobile: other brands */}
          {otherBrandList.length > 0 && (
            <section className="mt-10 lg:hidden">
              <h3 className="text-white font-semibold mb-4">Other Brands in {cityName}</h3>
              <div className="flex flex-wrap gap-2">
                {otherBrandList.map(b => (
                  <Link
                    key={b.slug}
                    href={`/dealers/${city}/${b.slug}/`}
                    className="bg-[#0A1F44] border border-[#1e3a6e] text-[#C0C0C0] hover:border-[#00D4FF] hover:text-[#00D4FF] text-sm px-3 py-1.5 rounded-full transition-all"
                  >
                    {b.brand_name} ({b.count})
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}

function DealerFullCard({ dealer, rank }: { dealer: Dealer; rank: number }) {
  return (
    <div className="bg-[#0A1F44] border border-[#1e3a6e] rounded-2xl p-5 hover:border-[#00D4FF]/50 transition-all">
      <div className="flex items-start gap-4">
        {/* Rank number */}
        <div className="w-9 h-9 rounded-full bg-[#06142D] border border-[#1e3a6e] text-[#C0C0C0] text-sm font-bold flex items-center justify-center shrink-0">
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-white font-bold text-base">{dealer.name}</h2>
            {dealer.is_authorized && (
              <span className="bg-green-900/40 text-green-400 border border-green-800 text-xs px-2 py-0.5 rounded-full font-medium">
                ✓ Authorized
              </span>
            )}
          </div>

          {/* Vehicle type tags */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {dealer.vehicle_types.map(vt => (
              <span key={vt} className="bg-[#06142D] border border-[#1e3a6e] text-[#00D4FF] text-xs px-2.5 py-0.5 rounded-full capitalize font-medium">
                {vt === 'cars' ? '🚗' : vt === 'bikes' ? '🏍️' : '🛵'} {vt}
              </span>
            ))}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm mb-4">
            <div className="flex items-start gap-2">
              <span className="text-[#00D4FF] shrink-0 mt-0.5">📍</span>
              <p className="text-[#C0C0C0] leading-snug">{dealer.address}</p>
            </div>
            {dealer.working_hours && (
              <div className="flex items-center gap-2">
                <span className="text-[#00D4FF]">🕒</span>
                <p className="text-[#C0C0C0]">{dealer.working_hours}</p>
              </div>
            )}
            {dealer.phone && (
              <div className="flex items-center gap-2">
                <span className="text-[#00D4FF]">📞</span>
                <a href={`tel:${dealer.phone}`} className="text-white hover:text-[#00D4FF] transition-colors font-medium">
                  {dealer.phone}
                </a>
              </div>
            )}
            {dealer.locality && (
              <div className="flex items-center gap-2">
                <span className="text-[#00D4FF]">📌</span>
                <p className="text-[#C0C0C0]">{dealer.locality}, {dealer.pincode ?? ''}</p>
              </div>
            )}
          </div>

          {/* Rating bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < Math.round(dealer.rating) ? 'text-yellow-400' : 'text-[#333]'}`}>★</span>
              ))}
            </div>
            <span className="text-white text-sm font-bold">{dealer.rating}</span>
            <span className="text-[#666] text-xs">({dealer.review_count} reviews)</span>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-2 flex-wrap">
            {dealer.phone && (
              <a
                href={`tel:${dealer.phone.replace(/[\s\-()]/g, '')}`}
                className="flex items-center gap-2 bg-[#00D4FF] text-[#06142D] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#4DEBFF] transition-colors"
              >
                📞 Call Now
              </a>
            )}
            {dealer.google_maps_url && (
              <a
                href={dealer.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-[#00D4FF] text-[#00D4FF] font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#00D4FF] hover:text-[#06142D] transition-all"
              >
                🗺️ Directions
              </a>
            )}
            {dealer.website && (
              <a
                href={dealer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#1e3a6e] text-[#C0C0C0] text-sm px-4 py-2.5 rounded-xl hover:border-white hover:text-white transition-colors"
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
