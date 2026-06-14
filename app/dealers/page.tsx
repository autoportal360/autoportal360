'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BrandSummary { brand_name: string; brand_slug: string; count: number }
interface CitySummary  { city: string; city_slug: string; state: string; count: number }

const TABS = ['All', 'Cars', 'Bikes', 'Scooters']

export default function DealersPage() {
  const router = useRouter()
  const [brands, setBrands]   = useState<BrandSummary[]>([])
  const [cities, setCities]   = useState<CitySummary[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [brand, setBrand]     = useState('')
  const [city, setCity]       = useState('')
  const [tab, setTab]         = useState('All')

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/dealers/brands').then(r => r.json()),
      fetch('/api/dealers/cities').then(r => r.json()),
      fetch('/api/dealers?per_page=1').then(r => r.json()),
    ]).then(([br, cr, dr]) => {
      if (br.status === 'fulfilled' && Array.isArray(br.value)) setBrands(br.value)
      if (cr.status === 'fulfilled' && Array.isArray(cr.value)) setCities(cr.value)
      if (dr.status === 'fulfilled' && dr.value?.total)          setTotal(dr.value.total)
      setLoading(false)
    })
  }, [])

  const handleFind = () => {
    if (brand && city)  router.push(`/dealers/${city}/${brand}/`)
    else if (brand)     router.push(`/dealers/brand/${brand}/`)
    else if (city)      router.push(`/dealers/${city}/`)
  }

  const displayBrands = showAll ? brands : brands.slice(0, 12)

  return (
    <div className="min-h-screen bg-[#06142D]">

      {/* ── HERO ── */}
      <section className="bg-[#0A1F44] pt-12 pb-14 px-6">
        <div className="max-w-5xl mx-auto">

          {!loading && (
            <div className="flex items-center gap-2 mb-7 flex-wrap text-sm text-[#C0C0C0]">
              <span>{total} verified dealers</span>
              <span style={{ color: '#1e3a6e' }}>·</span>
              <span>{cities.length} cities</span>
              <span style={{ color: '#1e3a6e' }}>·</span>
              <span>{brands.length} brands</span>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
            Find Authorized Dealers
          </h1>
          <p className="text-[#00D4FF] text-2xl md:text-3xl font-bold mb-4">
            Near You in India
          </p>
          <p className="text-[#C0C0C0] text-sm mb-8 max-w-xl">
            Cars, bikes and scooters — select a brand and city to find verified showrooms instantly.
          </p>

          {/* Finder bar */}
          <div className="ap-finder">
            <div className="ap-finder-row">
              <div className="ap-finder-field">
                <label className="block text-[#666] text-[10px] font-semibold tracking-widest mb-1">BRAND</label>
                <select
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full bg-[#06142D] text-white text-sm focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="">All Brands</option>
                  {brands.map(b => (
                    <option key={b.brand_slug} value={b.brand_slug}>{b.brand_name} ({b.count})</option>
                  ))}
                </select>
              </div>
              <div className="ap-finder-field">
                <label className="block text-[#666] text-[10px] font-semibold tracking-widest mb-1">CITY</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-[#06142D] text-white text-sm focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="">All Cities</option>
                  {cities.map(c => (
                    <option key={c.city_slug} value={c.city_slug}>{c.city}, {c.state}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleFind}
                disabled={!brand && !city}
                className="bg-[#00D4FF] text-[#06142D] font-bold text-sm px-8 py-4 hover:bg-[#4DEBFF] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
              >
                Find Dealers →
              </button>
            </div>
          </div>

          {/* Vehicle tabs */}
          <div className="ap-tab-group">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`ap-tab${tab === t ? ' ap-tab-active' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="max-w-5xl mx-auto px-6 py-12" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

        {/* Browse by Brand */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Browse by Brand</h2>
            {!loading && <span className="text-[#C0C0C0] text-sm">{brands.length} brands</span>}
          </div>

          {loading ? (
            <div className="ap-grid-brands">
              {[...Array(8)].map((_, i) => <div key={i} className="ap-skeleton-tall" />)}
            </div>
          ) : (
            <>
              <div className="ap-grid-brands">
                {displayBrands.map(b => (
                  <Link key={b.brand_slug} href={`/dealers/brand/${b.brand_slug}/`} className="ap-card-centered">
                    <div className="ap-avatar">
                      <span style={{ color: '#06142D', fontWeight: 700, fontSize: '1.125rem', lineHeight: 1 }}>
                        {b.brand_name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-white text-sm font-semibold leading-tight">{b.brand_name}</p>
                    <p style={{ color: '#666', fontSize: '.75rem', marginTop: '.25rem' }}>{b.count} dealers</p>
                  </Link>
                ))}
              </div>

              {brands.length > 12 && (
                <button
                  onClick={() => setShowAll(v => !v)}
                  className="ap-view-all"
                  style={{ marginTop: '1rem' }}
                >
                  {showAll ? 'Show Less ↑' : `View All ${brands.length} Brands ↓`}
                </button>
              )}
            </>
          )}
        </section>

        {/* Browse by City */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Browse by City</h2>
            {!loading && <span className="text-[#C0C0C0] text-sm">{cities.length} cities</span>}
          </div>

          {loading ? (
            <div className="ap-grid-cities">
              {[...Array(8)].map((_, i) => <div key={i} className="ap-skeleton" />)}
            </div>
          ) : (
            <div className="ap-grid-cities">
              {cities.map(c => (
                <Link key={c.city_slug} href={`/dealers/${c.city_slug}/`} className="ap-card">
                  <div className="flex items-center justify-between" style={{ gap: '.5rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <p className="text-white font-semibold text-sm truncate">{c.city}</p>
                      <p style={{ color: '#666', fontSize: '.75rem', marginTop: '.125rem' }}>{c.state}</p>
                    </div>
                    <div className="ap-count-badge">
                      <span>{c.count}</span>
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
