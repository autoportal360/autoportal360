'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

const DEFAULT_SLIDE: HeroOemSlide = {
  type: 'oem',
  advertiser: 'AutoPortal360',
  bannerUrl: '',
  destinationUrl: '/new-cars',
  impressionPixel: null,
  clickTrackingUrl: null,
  headline: 'Find Your Perfect Car, Bike or Scooter',
  subline: 'Compare 320+ models from 60+ brands across India',
  ctaText: null,
}

// ── Per-slide content ─────────────────────────────────────────────────────────

function AutoContent({ slide }: { slide: HeroAutoSlide }) {
  const suffix = slide.brandType === 'car' ? 'cars' : slide.brandType === 'bike' ? 'bikes' : 'scooters'
  const modelHref = `/${slide.brandSlug}-${suffix}/${slide.modelSlug}/`
  const priceLabel = slide.priceMin && slide.priceMax
    ? formatPriceRange(slide.priceMin, slide.priceMax)
    : slide.priceMin
    ? `From ${formatPrice(slide.priceMin)}`
    : null

  return (
    <>
      <span className="ap-hero-slide-brand">{slide.brandName}</span>
      <h2 className="ap-hero-slide-title">{slide.modelName}</h2>
      {priceLabel && <p className="ap-hero-slide-price">{priceLabel}</p>}
      <div className="ap-hero-slide-ctas">
        <Link href={modelHref} className="ap-hero-cta-primary">Get Offers →</Link>
        <Link href={modelHref} className="ap-hero-cta-secondary">View Details</Link>
      </div>
    </>
  )
}

function OemContent({ slide }: { slide: HeroOemSlide }) {
  function firePixel() {
    if (slide.clickTrackingUrl) {
      const t = new window.Image(); t.src = slide.clickTrackingUrl
    }
  }

  return (
    <>
      {slide.advertiser && <span className="ap-hero-oem-brand">{slide.advertiser}</span>}
      {slide.headline && <h2 className="ap-hero-oem-headline">{slide.headline}</h2>}
      {slide.subline && <p className="ap-hero-oem-subline">{slide.subline}</p>}
      {slide.ctaText && (
        <a
          href={slide.destinationUrl || '/new-cars'}
          className="ap-hero-oem-cta"
          target="_blank"
          rel="noopener noreferrer"
          onClick={firePixel}
        >
          {slide.ctaText} →
        </a>
      )}
    </>
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
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)

  const displaySlides: HeroSlide[] = slides.length > 0 ? slides : [DEFAULT_SLIDE]

  const advance = useCallback(() => {
    setCurrent(c => (c + 1) % displaySlides.length)
  }, [displaySlides.length])

  useEffect(() => {
    if (paused || displaySlides.length <= 1) return
    const t = setInterval(advance, 5000)
    return () => clearInterval(t)
  }, [paused, advance, displaySlides.length])

  useEffect(() => {
    const slide = displaySlides[current]
    if (slide?.type === 'oem' && slide.impressionPixel) {
      const img = new window.Image(); img.src = slide.impressionPixel
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

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
    <>
      {/* ── Full-width hero slider ── */}
      <div
        className="ap-hero-slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {displaySlides.map((slide, i) => {
          const isAuto  = slide.type === 'auto'
          const imgUrl  = isAuto ? (slide as HeroAutoSlide).thumbnail  : (slide as HeroOemSlide).bannerUrl
          const imgAlt  = isAuto
            ? `${(slide as HeroAutoSlide).brandName} ${(slide as HeroAutoSlide).modelName}`
            : ((slide as HeroOemSlide).advertiser ?? 'Advertisement')
          const typeEmoji = isAuto
            ? (slide as HeroAutoSlide).brandType === 'bike' ? '🏍️'
              : (slide as HeroAutoSlide).brandType === 'scooter' ? '🛵' : '🚗'
            : '🚗'

          return (
            <div
              key={i}
              className="ap-hero-slide"
              style={{ display: i === current ? 'flex' : 'none' }}
            >
              {/* Background image */}
              <div className="ap-hero-slide-bg">
                {imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgUrl}
                    alt={imgAlt}
                    style={isAuto
                      ? { objectFit: 'contain', objectPosition: 'right bottom', paddingRight: '2%', paddingTop: '4%' }
                      : { objectFit: 'cover', objectPosition: 'center center' }
                    }
                  />
                ) : (
                  <div className="ap-hero-slide-bg-placeholder">{typeEmoji}</div>
                )}
              </div>

              {isAuto ? (
                <>
                  {/* Auto slide: left-to-right gradient, text on left */}
                  <div className="ap-hero-slide-overlay" />
                  <div className="ap-hero-slide-content">
                    <AutoContent slide={slide as HeroAutoSlide} />
                  </div>
                </>
              ) : (
                <>
                  {/* OEM slide: bottom-only gradient, text pinned bottom-left */}
                  <div className="ap-hero-oem-overlay" />
                  <div className="ap-hero-oem-content">
                    <OemContent slide={slide as HeroOemSlide} />
                  </div>
                </>
              )}
            </div>
          )
        })}

        {/* Navigation dots */}
        {displaySlides.length > 1 && (
          <div className="ap-hero-dots">
            {displaySlides.map((_, i) => (
              <button
                key={i}
                className={`ap-hero-dot${i === current ? ' active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Search section (below slider) ── */}
      <section className="ap-search-section">
        <div className="ap-search-container">

          {/* Heading + tabs row */}
          <div className="ap-search-tabs-row">
            <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0, whiteSpace: 'nowrap' }}>
              Search <span style={{ color: '#00D4FF' }}>cars, bikes &amp; scooters</span>
            </h1>
            <div style={{ display: 'flex', gap: '0.375rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
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
          </div>

          {/* Search fields */}
          <div className="ap-search-fields-row">
            {tab === 'cars' && (
              <>
                <select className="ap-search-select" value={carBrand} onChange={e => setCarBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {carBrands.map(b => {
                    const clean = b.slug.replace(/-bike$/, '').replace(/-scooter$/, '')
                    return <option key={b.id} value={clean}>{b.name}</option>
                  })}
                </select>
                <select className="ap-search-select" value={carBudget} onChange={e => setCarBudget(e.target.value)}>
                  <option value="">Any Budget</option>
                  {CAR_BUDGETS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
                <select className="ap-search-select" value={carBody} onChange={e => setCarBody(e.target.value)}>
                  <option value="">Any Body Type</option>
                  {CAR_BODIES.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
              </>
            )}
            {tab === 'bikes' && (
              <>
                <select className="ap-search-select" value={bikeBrand} onChange={e => setBikeBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {BIKE_BRANDS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
                <select className="ap-search-select" value={bikeBudget} onChange={e => setBikeBudget(e.target.value)}>
                  <option value="">Any Budget</option>
                  {BIKE_BUDGETS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
              </>
            )}
            {tab === 'scooters' && (
              <>
                <select className="ap-search-select" value={scooterBrand} onChange={e => setScooterBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {SCOOTER_BRANDS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
                <select className="ap-search-select" value={scooterBudget} onChange={e => setScooterBudget(e.target.value)}>
                  <option value="">Any Budget</option>
                  {SCOOTER_BUDGETS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                </select>
              </>
            )}
            <button className="ap-search-submit" onClick={handleSearch}>Search →</button>
          </div>

          {/* Stats */}
          <div className="ap-search-stats">
            <span className="ap-search-stat"><strong>320+</strong> Car Models</span>
            <span className="ap-search-stat"><strong>280+</strong> Bike Models</span>
            <span className="ap-search-stat"><strong>120+</strong> Scooters</span>
            <span className="ap-search-stat"><strong>60+</strong> Brands</span>
            <span className="ap-search-stat"><strong>48</strong> Cities</span>
          </div>
        </div>
      </section>
    </>
  )
}
