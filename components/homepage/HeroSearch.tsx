'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { HeroSlide, HeroAutoSlide, HeroOemSlide } from '@/components/HeroSlider'
import { formatPriceRange, formatPrice } from '@/lib/utils'

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

// ── Slide card (right panel) ───────────────────────────────────────────────────

function AutoSlideCard({ slide }: { slide: HeroAutoSlide }) {
  const suffix = slide.brandType === 'car' ? 'cars' : slide.brandType === 'bike' ? 'bikes' : 'scooters'
  const modelHref = `/${slide.brandSlug}-${suffix}/${slide.modelSlug}/`
  const priceLabel = slide.priceMin && slide.priceMax
    ? formatPriceRange(slide.priceMin, slide.priceMax)
    : slide.priceMin
    ? `From ${formatPrice(slide.priceMin)}`
    : null
  const typeEmoji = slide.brandType === 'bike' ? '🏍️' : slide.brandType === 'scooter' ? '🛵' : '🚗'

  return (
    <div className="ap-slide-card">
      {slide.thumbnail ? (
        <div className="ap-slide-img">
          <Image
            src={slide.thumbnail}
            alt={`${slide.brandName} ${slide.modelName}`}
            fill
            sizes="(min-width: 768px) 42vw, 100vw"
            style={{ objectFit: 'contain', objectPosition: 'center 30%', padding: '0.75rem 0.75rem 0' }}
            priority
          />
        </div>
      ) : (
        <div className="ap-slide-no-img">{typeEmoji}</div>
      )}
      <div className="ap-slide-overlay" />
      <div className="ap-slide-content">
        <span className="ap-slide-brand">{slide.brandName}</span>
        <div className="ap-slide-model">{slide.modelName}</div>
        {priceLabel && <div className="ap-slide-price">{priceLabel}</div>}
        <div className="ap-slide-ctas">
          <Link href={modelHref} className="ap-slide-cta-primary">Get Offers →</Link>
          <Link href={modelHref} className="ap-slide-cta-secondary">View Details</Link>
        </div>
      </div>
    </div>
  )
}

function OemSlideCard({ slide }: { slide: HeroOemSlide }) {
  function handleClick() {
    if (slide.clickTrackingUrl) {
      const t = new window.Image(); t.src = slide.clickTrackingUrl
    }
    if (slide.destinationUrl) {
      window.open(slide.destinationUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className="ap-slide-card"
      onClick={handleClick}
      style={{ cursor: slide.destinationUrl ? 'pointer' : 'default' }}
    >
      {slide.bannerUrl ? (
        <div className="ap-slide-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.bannerUrl} alt={slide.advertiser ?? 'Advertisement'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div className="ap-slide-no-img">📢</div>
      )}
      <div className="ap-slide-overlay" />
      <div className="ap-slide-content">
        {slide.advertiser && <span className="ap-slide-brand">{slide.advertiser} · AD</span>}
        {slide.headline && <div className="ap-slide-model">{slide.headline}</div>}
        {slide.subline && <div className="ap-slide-price">{slide.subline}</div>}
        {slide.ctaText && (
          <div className="ap-slide-ctas">
            <button
              onClick={e => { e.stopPropagation(); handleClick() }}
              className="ap-slide-cta-primary"
            >
              {slide.ctaText}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptySlideCard() {
  return (
    <div className="ap-slide-card">
      <div className="ap-slide-no-img">🚗</div>
      <div className="ap-slide-overlay" />
      <div className="ap-slide-content">
        <div className="ap-slide-model">Explore 320+ Models</div>
        <div className="ap-slide-price">Cars · Bikes · Scooters</div>
        <div className="ap-slide-ctas">
          <Link href="/new-cars/" className="ap-slide-cta-primary">Browse Cars →</Link>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

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
  const [currentSlide,  setCurrentSlide] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

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

  const slide = slides[currentSlide] ?? null

  return (
    <section className="ap-hero-section">
      <div className="ap-hero-layout">

        {/* ── LEFT: search ── */}
        <div className="ap-hero-left">
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: '1.25rem', fontFamily: 'Montserrat, sans-serif' }}>
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

          {/* Search card */}
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

        {/* ── RIGHT: slide card ── */}
        <div className="ap-hero-right">
          {slide === null
            ? <EmptySlideCard />
            : slide.type === 'auto'
            ? <AutoSlideCard slide={slide} />
            : <OemSlideCard slide={slide} />
          }

          {slides.length > 1 && (
            <div className="ap-slide-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`ap-slide-dot${i === currentSlide ? ' active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
