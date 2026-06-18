'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import HeroSlider from '@/components/HeroSlider'
import type { HeroSlide } from '@/components/HeroSlider'

type BrandOption = { id: string; name: string; slug: string }

const BIKE_BRANDS = [
  { label: 'Royal Enfield', slug: 'royal-enfield' },
  { label: 'Bajaj',         slug: 'bajaj'         },
  { label: 'Hero',          slug: 'hero'           },
  { label: 'Honda',         slug: 'honda'          },
  { label: 'TVS',           slug: 'tvs'            },
  { label: 'KTM',           slug: 'ktm'            },
  { label: 'Yamaha',        slug: 'yamaha'         },
  { label: 'Suzuki',        slug: 'suzuki'         },
]

const SCOOTER_BRANDS = [
  { label: 'Honda',        slug: 'honda'        },
  { label: 'TVS',          slug: 'tvs'          },
  { label: 'Yamaha',       slug: 'yamaha'       },
  { label: 'Suzuki',       slug: 'suzuki'       },
  { label: 'Ather',        slug: 'ather'        },
  { label: 'Ola Electric', slug: 'ola-electric' },
  { label: 'Hero',         slug: 'hero'         },
  { label: 'Bajaj',        slug: 'bajaj'        },
]

const CAR_BUDGETS = [
  { label: 'Under ₹5 Lakh',  slug: 'under-5-lakh'   },
  { label: '₹5 – 10 Lakh',   slug: '5-to-10-lakh'   },
  { label: '₹10 – 15 Lakh',  slug: '10-to-15-lakh'  },
  { label: '₹15 – 20 Lakh',  slug: '15-to-20-lakh'  },
  { label: '₹20 – 30 Lakh',  slug: '20-to-30-lakh'  },
  { label: '₹30 Lakh+',      slug: 'above-30-lakh'  },
]

const BIKE_BUDGETS = [
  { label: 'Under ₹1 Lakh',  slug: 'under-1-lakh'   },
  { label: '₹1 – 2 Lakh',    slug: '1-to-2-lakh'    },
  { label: '₹2 – 3 Lakh',    slug: '2-to-3-lakh'    },
  { label: '₹3 Lakh+',       slug: 'above-3-lakh'   },
]

const SCOOTER_BUDGETS = [
  { label: 'Under ₹80K',     slug: 'under-80k'       },
  { label: '₹80K – 1 Lakh',  slug: '80k-to-1-lakh'  },
  { label: '₹1 – 1.5 Lakh',  slug: '1-to-1.5-lakh'  },
  { label: '₹1.5 Lakh+',     slug: 'above-1.5-lakh' },
]

const CAR_BODIES = [
  { label: 'SUV',       slug: 'suv'       },
  { label: 'Hatchback', slug: 'hatchback' },
  { label: 'Sedan',     slug: 'sedan'     },
  { label: 'MPV',       slug: 'mpv'       },
  { label: 'Luxury',    slug: 'luxury'    },
]

type Tab = 'cars' | 'bikes' | 'scooters'

export default function HeroSearch({
  carBrands,
  slides = [],
}: {
  carBrands: BrandOption[]
  slides?: HeroSlide[]
}) {
  const router = useRouter()
  const [tab,           setTab]          = useState<Tab>('cars')
  const [carBrand,      setCarBrand]     = useState('')
  const [carBudget,     setCarBudget]    = useState('')
  const [carBody,       setCarBody]      = useState('')
  const [bikeBrand,     setBikeBrand]    = useState('')
  const [bikeBudget,    setBikeBudget]   = useState('')
  const [scooterBrand,  setScooterBrand] = useState('')
  const [scooterBudget, setScooterBudget]= useState('')

  function handleSearch() {
    if (tab === 'cars') {
      if (carBrand && !carBudget && !carBody) {
        router.push(`/${carBrand}-cars/`)
      } else {
        const p = new URLSearchParams()
        if (carBrand)  p.set('brand',  carBrand)
        if (carBudget) p.set('budget', carBudget)
        if (carBody)   p.set('body',   carBody)
        router.push(`/new-cars/${p.size ? '?' + p.toString() : ''}`)
      }
    } else if (tab === 'bikes') {
      if (bikeBrand && !bikeBudget) {
        router.push(`/${bikeBrand}-bikes/`)
      } else {
        const p = new URLSearchParams()
        if (bikeBrand)  p.set('brand',  bikeBrand)
        if (bikeBudget) p.set('budget', bikeBudget)
        router.push(`/new-bikes/${p.size ? '?' + p.toString() : ''}`)
      }
    } else {
      if (scooterBrand && !scooterBudget) {
        router.push(`/${scooterBrand}-scooters/`)
      } else {
        const p = new URLSearchParams()
        if (scooterBrand)  p.set('brand',  scooterBrand)
        if (scooterBudget) p.set('budget', scooterBudget)
        router.push(`/new-scooters/${p.size ? '?' + p.toString() : ''}`)
      }
    }
  }

  return (
    <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #1e3a6e' }}>

      {/* ── Slider background ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* Wrap in a stacking context so overlay can sit above slider internals */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {slides.length > 0
            ? <HeroSlider slides={slides} />
            : <div style={{ height: '380px', background: 'linear-gradient(135deg,#06142D 0%,#0d2855 60%,#06142D 100%)' }} />
          }
        </div>
        {/* Dark overlay — must be above slider (zIndex: 2 > slider wrapper zIndex: 1) */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'rgba(6,20,45,0.82)',
        }} />
      </div>

      {/* ── Search panel foreground ── */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 2rem' }}>

        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: '1.25rem' }}>
          Find your perfect <span style={{ color: '#00D4FF' }}>car, bike or scooter</span>
        </h1>

        {/* Vehicle type tabs */}
        <div className="ap-tabs">
          {(['cars', 'bikes', 'scooters'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`ap-tab-btn${tab === t ? ' active' : ''}`}
            >
              {t === 'cars' ? '🚗 Cars' : t === 'bikes' ? '🏍️ Bikes' : '🛵 Scooters'}
            </button>
          ))}
        </div>

        {/* Search fields */}
        <div className="ap-hero-search">
          <div className="ap-search-fields">
            {tab === 'cars' && (
              <>
                <select className="ap-search-field" value={carBrand} onChange={e => setCarBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {carBrands.map(b => {
                    const clean = b.slug.replace(/-bike$/, '').replace(/-scooter$/, '')
                    return <option key={b.id} value={clean}>{b.name}</option>
                  })}
                </select>
                <select className="ap-search-field" value={carBudget} onChange={e => setCarBudget(e.target.value)}>
                  <option value="">Any Budget</option>
                  {CAR_BUDGETS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
                <select className="ap-search-field" value={carBody} onChange={e => setCarBody(e.target.value)}>
                  <option value="">Any Body Type</option>
                  {CAR_BODIES.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
              </>
            )}

            {tab === 'bikes' && (
              <>
                <select className="ap-search-field" value={bikeBrand} onChange={e => setBikeBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {BIKE_BRANDS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
                <select className="ap-search-field" value={bikeBudget} onChange={e => setBikeBudget(e.target.value)}>
                  <option value="">Any Budget</option>
                  {BIKE_BUDGETS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
              </>
            )}

            {tab === 'scooters' && (
              <>
                <select className="ap-search-field" value={scooterBrand} onChange={e => setScooterBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {SCOOTER_BRANDS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
                <select className="ap-search-field" value={scooterBudget} onChange={e => setScooterBudget(e.target.value)}>
                  <option value="">Any Budget</option>
                  {SCOOTER_BUDGETS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
              </>
            )}

            <button className="ap-search-btn" onClick={handleSearch}>Search →</button>
          </div>

          {/* Stats row */}
          <div className="ap-stats-row">
            {[
              { num: '320+', label: 'Car Models'   },
              { num: '280+', label: 'Bike Models'  },
              { num: '120+', label: 'Scooters'     },
              { num: '60+',  label: 'Brands'       },
              { num: '48',   label: 'Cities'       },
            ].map(s => (
              <div key={s.label} className="ap-stat-item">
                <span className="ap-stat-number">{s.num}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
