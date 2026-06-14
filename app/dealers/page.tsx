'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BrandSummary { brand_name: string; brand_slug: string; count: number }
interface CitySummary  { city: string; city_slug: string; state: string; count: number }

const VEHICLE_TABS = ['All', 'Cars', 'Bikes', 'Scooters'] as const
type VehicleTab = typeof VEHICLE_TABS[number]

export default function DealersPage() {
  const router = useRouter()
  const [brands, setBrands]               = useState<BrandSummary[]>([])
  const [cities, setCities]               = useState<CitySummary[]>([])
  const [totalDealers, setTotalDealers]   = useState(0)
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState<VehicleTab>('All')
  const [showAllBrands, setShowAllBrands] = useState(false)

  // Finder state
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCity, setSelectedCity]   = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/dealers/brands').then(r => r.json()),
      fetch('/api/dealers/cities').then(r => r.json()),
      fetch('/api/dealers?per_page=1').then(r => r.json()),
    ]).then(([b, c, d]) => {
      setBrands(b)
      setCities(c)
      setTotalDealers(d.total ?? 0)
      setLoading(false)
    })
  }, [])

  const handleFindDealers = () => {
    if (selectedBrand && selectedCity) {
      router.push(`/dealers/${selectedCity}/${selectedBrand}/`)
    } else if (selectedBrand) {
      router.push(`/dealers/brand/${selectedBrand}/`)
    } else if (selectedCity) {
      router.push(`/dealers/${selectedCity}/`)
    }
  }

  const filteredBrands = brands
  const displayBrands  = showAllBrands ? filteredBrands : filteredBrands.slice(0, 12)

  const brandColor = (name: string) => {
    const colors = ['#00D4FF', '#2ECC71', '#FF6B35', '#A855F7', '#F59E0B', '#EC4899']
    return colors[name.charCodeAt(0) % colors.length]
  }

  return (
    <div className="min-h-screen bg-[#06142D]">
      {/* ── Hero + Finder ── */}
      <section className="bg-gradient-to-b from-[#0A1F44] via-[#0A1F44] to-[#06142D] pt-14 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Stats */}
          <div className="flex items-center gap-6 mb-8 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D4FF] inline-block" />
              <span className="text-[#C0C0C0] text-sm">{loading ? '…' : totalDealers} verified dealers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D4FF] inline-block" />
              <span className="text-[#C0C0C0] text-sm">{loading ? '…' : cities.length} cities</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D4FF] inline-block" />
              <span className="text-[#C0C0C0] text-sm">{loading ? '…' : brands.length} brands</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
            Find Authorized Dealers<br />
            <span className="text-[#00D4FF]">Near You in India</span>
          </h1>
          <p className="text-[#C0C0C0] mb-8 text-base">
            Cars, bikes and scooters — select a brand and city to find verified showrooms instantly.
          </p>

          {/* Finder bar */}
          <div className="bg-[#111] border border-[#1e3a6e] rounded-2xl p-1.5 flex flex-col sm:flex-row gap-1.5">
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="flex-1 bg-transparent px-5 py-3.5 text-white text-sm focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#111]">Select Brand</option>
              {brands.map(b => (
                <option key={b.brand_slug} value={b.brand_slug} className="bg-[#111]">
                  {b.brand_name} ({b.count})
                </option>
              ))}
            </select>
            <div className="hidden sm:block w-px bg-[#1e3a6e] my-2" />
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="flex-1 bg-transparent px-5 py-3.5 text-white text-sm focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#111]">Select City</option>
              {cities.map(c => (
                <option key={c.city_slug} value={c.city_slug} className="bg-[#111]">
                  {c.city}, {c.state}
                </option>
              ))}
            </select>
            <button
              onClick={handleFindDealers}
              disabled={!selectedBrand && !selectedCity}
              className="bg-[#00D4FF] text-[#06142D] font-bold px-8 py-3.5 rounded-xl hover:bg-[#4DEBFF] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm shrink-0"
            >
              Find Dealers →
            </button>
          </div>

          {/* Vehicle type tabs */}
          <div className="flex gap-2 mt-5">
            {VEHICLE_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[#00D4FF] text-[#06142D]'
                    : 'bg-[#0A1F44] border border-[#1e3a6e] text-[#C0C0C0] hover:border-[#00D4FF] hover:text-white'
                }`}
              >
                {tab === 'All' ? '🚗🏍️ All' : tab === 'Cars' ? '🚗 Cars' : tab === 'Bikes' ? '🏍️ Bikes' : '🛵 Scooters'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        {/* ── Browse by Brand ── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Browse by Brand</h2>
            <span className="text-[#C0C0C0] text-sm">{brands.length} brands</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-[#0A1F44] rounded-xl h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {displayBrands.map(brand => (
                  <Link
                    key={brand.brand_slug}
                    href={`/dealers/brand/${brand.brand_slug}/`}
                    className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4 hover:border-[#00D4FF] hover:bg-[#0d2a5a] transition-all group text-center"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2.5 font-bold text-lg text-[#06142D]"
                      style={{ backgroundColor: brandColor(brand.brand_name) }}
                    >
                      {brand.brand_name.charAt(0)}
                    </div>
                    <p className="text-white text-xs font-semibold group-hover:text-[#00D4FF] transition-colors leading-tight">
                      {brand.brand_name}
                    </p>
                    <p className="text-[#666] text-xs mt-0.5">{brand.count} dealers</p>
                  </Link>
                ))}
              </div>
              {filteredBrands.length > 12 && (
                <button
                  onClick={() => setShowAllBrands(v => !v)}
                  className="mt-4 w-full py-3 border border-[#1e3a6e] rounded-xl text-[#00D4FF] text-sm hover:border-[#00D4FF] transition-colors"
                >
                  {showAllBrands ? 'Show Less' : `View All ${filteredBrands.length} Brands ↓`}
                </button>
              )}
            </>
          )}
        </section>

        {/* ── Browse by City ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Browse by City</h2>
            <span className="text-[#C0C0C0] text-sm">{cities.length} cities</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#0A1F44] rounded-xl h-20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cities.map(city => (
                <Link
                  key={city.city_slug}
                  href={`/dealers/${city.city_slug}/`}
                  className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4 hover:border-[#00D4FF] hover:bg-[#0d2a5a] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold group-hover:text-[#00D4FF] transition-colors">
                        {city.city}
                      </p>
                      <p className="text-[#666] text-xs mt-0.5">{city.state}</p>
                    </div>
                    <div className="bg-[#06142D] border border-[#1e3a6e] text-[#00D4FF] text-xs font-bold w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                      {city.count}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
