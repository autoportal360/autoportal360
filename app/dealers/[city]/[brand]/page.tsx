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

async function fetchBrandCityDealers(citySlug: string, brandSlug: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('dealers')
    .select('*')
    .eq('city_slug', citySlug)
    .eq('brand_slug', brandSlug)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as Dealer[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, brand } = await params
  const dealers = await fetchBrandCityDealers(city, brand)
  if (!dealers.length) return { title: 'Dealers Not Found | AutoPortal360' }

  const cityName  = dealers[0].city
  const brandName = dealers[0].brand_name
  const count     = dealers.length

  return {
    title: `${brandName} Dealers in ${cityName} (${count} Showrooms) | AutoPortal360`,
    description:
      `Find all ${count} authorized ${brandName} dealer showrooms in ${cityName}. ` +
      `Get contact details, addresses, working hours, and directions for ${brandName} dealers near you.`,
    alternates: {
      canonical: `https://autoportal360.vercel.app/dealers/${city}/${brand}/`,
    },
  }
}

function DealerDetailCard({ dealer }: { dealer: Dealer }) {
  return (
    <div className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-6 hover:border-[#00D4FF]/50 transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-white font-semibold text-lg">{dealer.name}</h2>
            {dealer.is_authorized && (
              <span className="bg-green-900/40 text-green-400 border border-green-700/50 text-xs px-2.5 py-1 rounded-full font-medium">
                ✓ Authorized
              </span>
            )}
          </div>
          {dealer.locality && (
            <p className="text-[#C0C0C0] text-sm mt-1">{dealer.locality}, {dealer.city}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1 mb-0.5">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${i < Math.round(dealer.rating) ? 'text-yellow-400' : 'text-[#333]'}`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-[#C0C0C0] text-xs">
            {dealer.rating}/5 · {dealer.review_count} reviews
          </p>
        </div>
      </div>

      {/* Vehicle types */}
      <div className="flex gap-2 mb-4">
        {dealer.vehicle_types.map(vt => (
          <span
            key={vt}
            className="bg-[#06142D] border border-[#1e3a6e] text-[#00D4FF] text-xs px-3 py-1 rounded-full capitalize font-medium"
          >
            {vt}
          </span>
        ))}
      </div>

      {/* Contact info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-[#00D4FF] shrink-0">📍</span>
            <p className="text-[#C0C0C0]">{dealer.address}</p>
          </div>
          {dealer.pincode && (
            <div className="flex items-center gap-2">
              <span className="text-[#00D4FF]">🏷️</span>
              <p className="text-[#C0C0C0]">PIN: {dealer.pincode}</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {dealer.working_hours && (
            <div className="flex items-center gap-2">
              <span className="text-[#00D4FF]">🕒</span>
              <p className="text-[#C0C0C0]">{dealer.working_hours}</p>
            </div>
          )}
          {dealer.phone && (
            <div className="flex items-center gap-2">
              <span className="text-[#00D4FF]">📞</span>
              <a href={`tel:${dealer.phone}`} className="text-white hover:text-[#00D4FF] transition-colors">
                {dealer.phone}
              </a>
            </div>
          )}
          {dealer.email && (
            <div className="flex items-center gap-2">
              <span className="text-[#00D4FF]">✉️</span>
              <a href={`mailto:${dealer.email}`} className="text-[#C0C0C0] hover:text-[#00D4FF] transition-colors truncate">
                {dealer.email}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3 mt-5 pt-4 border-t border-[#1e3a6e]">
        {dealer.phone && (
          <a
            href={`tel:${dealer.phone.replace(/[\s-]/g, '')}`}
            className="flex-1 bg-[#00D4FF] text-[#06142D] font-semibold text-sm py-2.5 rounded-lg text-center hover:bg-[#4DEBFF] transition-colors"
          >
            📞 Call Dealer
          </a>
        )}
        {dealer.google_maps_url && (
          <a
            href={dealer.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-transparent border border-[#00D4FF] text-[#00D4FF] text-sm py-2.5 rounded-lg text-center hover:bg-[#00D4FF] hover:text-[#06142D] transition-all font-semibold"
          >
            🗺️ Get Directions
          </a>
        )}
        {dealer.website && (
          <a
            href={dealer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#111] border border-[#1e3a6e] text-[#C0C0C0] text-sm py-2.5 px-4 rounded-lg hover:border-white hover:text-white transition-colors"
          >
            🌐
          </a>
        )}
      </div>

      {/* LocalBusiness schema for individual dealer */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AutoDealer',
            name: dealer.name,
            description: `Authorized ${dealer.brand_name} dealer in ${dealer.city}`,
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
            openingHours: dealer.working_hours ?? undefined,
            url: dealer.website ?? undefined,
            aggregateRating: dealer.review_count > 0 ? {
              '@type': 'AggregateRating',
              ratingValue: dealer.rating,
              reviewCount: dealer.review_count,
              bestRating: '5',
              worstRating: '1',
            } : undefined,
          }),
        }}
      />
    </div>
  )
}

export default async function BrandCityDealersPage({ params }: Props) {
  const { city, brand } = await params
  const dealers = await fetchBrandCityDealers(city, brand)

  if (!dealers.length) notFound()

  const cityName  = dealers[0].city
  const brandName = dealers[0].brand_name

  return (
    <div className="min-h-screen bg-[#06142D]">
      {/* ── Breadcrumb ── */}
      <div className="bg-[#0A1F44] border-b border-[#1e3a6e]">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-[#C0C0C0] flex-wrap">
            <Link href="/" className="hover:text-[#00D4FF] transition-colors">Home</Link>
            <span>›</span>
            <Link href="/dealers/" className="hover:text-[#00D4FF] transition-colors">Dealers</Link>
            <span>›</span>
            <Link href={`/dealers/${city}/`} className="hover:text-[#00D4FF] transition-colors">{cityName}</Link>
            <span>›</span>
            <span className="text-white">{brandName}</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-[#0A1F44] to-[#06142D] py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {brandName} Dealers in {cityName}
          </h1>
          <p className="text-[#C0C0C0]">
            {dealers.length} authorized {brandName} showroom{dealers.length !== 1 ? 's' : ''} in {cityName}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Link
              href={`/dealers/${city}/`}
              className="text-[#00D4FF] text-sm hover:underline"
            >
              ← All dealers in {cityName}
            </Link>
            <Link
              href="/dealers/"
              className="text-[#C0C0C0] text-sm hover:text-white transition-colors"
            >
              Browse all cities
            </Link>
          </div>
        </div>
      </section>

      {/* ── Dealer Cards ── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="space-y-5">
          {dealers.map(dealer => (
            <DealerDetailCard key={dealer.id} dealer={dealer} />
          ))}
        </div>
      </div>
    </div>
  )
}
