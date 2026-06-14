'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BrandSummary { brand_name: string; brand_slug: string; count: number }
interface CitySummary  { city: string; city_slug: string; state: string; count: number }

export default function DealersPage() {
  const router = useRouter()
  const [brands, setBrands]         = useState<BrandSummary[]>([])
  const [cities, setCities]         = useState<CitySummary[]>([])
  const [totalDealers, setTotal]    = useState(0)
  const [loading, setLoading]       = useState(true)
  const [showAllBrands, setShowAll] = useState(false)
  const [selectedBrand, setBrand]   = useState('')
  const [selectedCity, setCity]     = useState('')
  const [activeTab, setTab]         = useState('All')

  useEffect(() => {
    Promise.all([
      fetch('/api/dealers/brands').then(r => r.json()),
      fetch('/api/dealers/cities').then(r => r.json()),
      fetch('/api/dealers?per_page=1').then(r => r.json()),
    ]).then(([b, c, d]) => {
      setBrands(Array.isArray(b) ? b : [])
      setCities(Array.isArray(c) ? c : [])
      setTotal(d.total ?? 0)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleFind = () => {
    if (selectedBrand && selectedCity) router.push(`/dealers/${selectedCity}/${selectedBrand}/`)
    else if (selectedBrand) router.push(`/dealers/brand/${selectedBrand}/`)
    else if (selectedCity) router.push(`/dealers/${selectedCity}/`)
  }

  const displayBrands = showAllBrands ? brands : brands.slice(0, 12)

  const TABS = ['All', 'Cars', 'Bikes', 'Scooters']

  return (
    <div className="min-h-screen bg-[#06142D]">

      {/* ── HERO ── */}
      <section className="bg-[#0A1F44] pt-12 pb-14 px-6">
        <div className="max-w-4xl mx-auto">

          {!loading && (
            <div className="flex items-center gap-6 mb-8 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="block w-2 h-2 rounded-full bg-[#00D4FF]"></span>
                <span className="text-[#C0C0C0] text-sm">{totalDealers} verified dealers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="block w-2 h-2 rounded-full bg-[#00D4FF]"></span>
                <span className="text-[#C0C0C0] text-sm">{cities.length} cities</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="block w-2 h-2 rounded-full bg-[#00D4FF]"></span>
                <span className="text-[#C0C0C0] text-sm">{brands.length} brands</span>
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Find Authorized Dealers
          </h1>
          <p className="text-[#00D4FF] text-2xl md:text-3xl font-bold mb-4">
            Near You in India
          </p>
          <p className="text-[#C0C0C0] text-base mb-8">
            Cars, bikes and scooters — select brand and city to find verified showrooms instantly.
          </p>

          {/* ── Finder ── */}
          <div className="bg-[#06142D] border border-[#1e3a6e] rounded-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 border-b sm:border-b-0 sm:border-r border-[#1e3a6e]">
                <label className="block text-[#666] text-xs px-4 pt-3">BRAND</label>
                <select
                  value={selectedBrand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full bg-[#06142D] text-white text-sm px-4 pb-3 pt-1 focus:outline-none cursor-pointer"
                >
                  <option value="">Select Brand</option>
                  {brands.map(b => (
                    <option key={b.brand_slug} value={b.brand_slug}>
                      {b.brand_name} — {b.count} dealers
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 border-b sm:border-b-0 sm:border-r border-[#1e3a6e]">
                <label className="block text-[#666] text-xs px-4 pt-3">CITY</label>
                <select
                  value={selectedCity}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-[#06142D] text-white text-sm px-4 pb-3 pt-1 focus:outline-none cursor-pointer"
                >
                  <option value="">Select City</option>
                  {cities.map(c => (
                    <option key={c.city_slug} value={c.city_slug}>
                      {c.city}, {c.state}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleFind}
                disabled={!selectedBrand && !selectedCity}
                className="bg-[#00D4FF] text-[#06142D] font-bold text-sm px-8 py-4 hover:bg-[#4DEBFF] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Find Dealers →
              </button>
            </div>
          </div>

          {/* ── Vehicle type tabs ── */}
          <div className="flex gap-2 mt-5 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                  activeTab === tab
                    ? 'bg-[#00D4FF] text-[#06142D] border-[#00D4FF]'
                    : 'bg-transparent text-[#C0C0C0] border-[#1e3a6e] hover:border-[#00D4FF] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* ── Browse by Brand ── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Browse by Brand</h2>
            <span className="text-[#C0C0C0] text-sm">{brands.length} brands</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#0A1F44] rounded-xl h-28 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {displayBrands.map(brand => (
                  <Link
                    key={brand.brand_slug}
                    href={`/dealers/brand/${brand.brand_slug}/`}
                    className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4 hover:border-[#00D4FF] hover:bg-[#0d2a5a] transition-all text-center block"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#00D4FF] flex items-center justify-center mx-auto mb-3">
                      <span className="text-[#06142D] font-bold text-lg leading-none">
                        {brand.brand_name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-white text-sm font-semibold leading-tight">
                      {brand.brand_name}
                    </p>
                    <p className="text-[#666] text-xs mt-1">
                      {brand.count} dealers
                    </p>
                  </Link>
                ))}
              </div>

              {brands.length > 12 && (
                <button
                  onClick={() => setShowAll(v => !v)}
                  className="mt-4 w-full py-3 border border-[#1e3a6e] rounded-xl text-[#00D4FF] text-sm hover:border-[#00D4FF] transition-colors"
                >
                  {showAllBrands ? 'Show Less ↑' : `View All ${brands.length} Brands ↓`}
                </button>
              )}
            </>
          )}
        </section>

        {/* ── Browse by City ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Browse by City</h2>
            <span className="text-[#C0C0C0] text-sm">{cities.length} cities</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#0A1F44] rounded-xl h-20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cities.map(city => (
                <Link
                  key={city.city_slug}
                  href={`/dealers/${city.city_slug}/`}
                  className="bg-[#0A1F44] border border-[#1e3a6e] rounded-xl p-4 hover:border-[#00D4FF] hover:bg-[#0d2a5a] transition-all block"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{city.city}</p>
                      <p className="text-[#666] text-xs mt-0.5">{city.state}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#06142D] border border-[#1e3a6e] flex items-center justify-center shrink-0">
                      <span className="text-[#00D4FF] text-xs font-bold">{city.count}</span>
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
