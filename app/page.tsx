import type { Metadata } from 'next'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import { supabase } from '@/lib/supabase'
import { getCanonicalUrl } from '@/lib/seo'
import type { Brand } from '@/types'
import SchemaMarkup from '@/components/SchemaMarkup'
import { websiteSchema, organizationSchema } from '@/lib/schema'
import RecentlyViewed from '@/components/RecentlyViewed'
import FuelTypeCars from '@/components/FuelTypeCars'
import HomeSeoContent from '@/components/HomeSeoContent'
import HeroSearch from '@/components/homepage/HeroSearch'
import type { HeroSlide } from '@/components/HeroSlider'
import PopularCars from '@/components/homepage/PopularCars'
import BudgetCars from '@/components/homepage/BudgetCars'
import BodyTypeNav from '@/components/homepage/BodyTypeNav'
import BrandGrid from '@/components/homepage/BrandGrid'
import QuickCompare from '@/components/homepage/QuickCompare'
import TwoWheelerHub from '@/components/homepage/TwoWheelerHub'
import LatestNews from '@/components/homepage/LatestNews'
import OnRoadCalc from '@/components/homepage/OnRoadCalc'
import ExplorePages from '@/components/homepage/ExplorePages'

export const metadata: Metadata = {
  title: 'AutoPortal360 — New Cars, Bikes & Scooters in India 2026',
  description: 'Research, compare and buy new cars, bikes and scooters in India. Specs, prices, mileage and on-road cost for every model — unbiased, always updated.',
  alternates: { canonical: getCanonicalUrl('/') },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: 'AutoPortal360 — New Cars, Bikes & Scooters in India 2026',
    description: 'Specs, prices and on-road cost for every car, bike and scooter in India.',
    url: getCanonicalUrl('/'),
    type: 'website',
  },
}

async function getCarBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('type', 'car')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) { console.error('Error fetching car brands:', error); return [] }
  return data || []
}

type SliderModelRow = {
  name: string; slug: string; type: 'car' | 'bike' | 'scooter'
  thumbnail_url: string | null; price_min: number | null; price_max: number | null
  brands: { name: string; slug: string; type: string } | null
  variants: { fuel_type: string | null }[]
}

type SliderSlideRow = {
  type: 'auto' | 'oem'; is_active: boolean
  start_date: string | null; end_date: string | null
  oem_advertiser: string | null; oem_banner_url: string | null
  oem_destination_url: string | null; oem_impression_pixel: string | null
  oem_click_tracking_url: string | null; oem_headline: string | null
  oem_subline: string | null; oem_cta_text: string | null
  models: SliderModelRow | null
}

function modelRowToSlide(m: SliderModelRow): HeroSlide {
  const brand = m.brands as { name: string; slug: string; type: string } | null
  const cleanBrandSlug = (brand?.slug ?? '').replace(/-bike$/, '').replace(/-scooter$/, '')
  return {
    type: 'auto',
    brandName:  brand?.name ?? '',
    brandSlug:  cleanBrandSlug,
    brandType:  m.type,
    modelName:  m.name,
    modelSlug:  m.slug,
    priceMin:   m.price_min,
    priceMax:   m.price_max,
    fuelTypes:  [...new Set((m.variants ?? []).map(v => v.fuel_type).filter((f): f is string => !!f))],
    thumbnail:  m.thumbnail_url,
  }
}

async function getSlides(): Promise<HeroSlide[]> {
  const today = new Date().toISOString().split('T')[0]

  const { data: dbSlides, error } = await supabase
    .from('slider_slides')
    .select(`
      type, is_active, start_date, end_date,
      oem_advertiser, oem_banner_url, oem_destination_url,
      oem_impression_pixel, oem_click_tracking_url,
      oem_headline, oem_subline, oem_cta_text,
      models(name, slug, type, thumbnail_url, price_min, price_max,
        brands(name, slug, type),
        variants(fuel_type)
      )
    `)
    .eq('is_active', true)
    .order('sort_order')

  const active = error ? [] : ((dbSlides ?? []) as unknown as SliderSlideRow[]).filter(s => {
    if (s.start_date && s.start_date > today) return false
    if (s.end_date   && s.end_date   < today) return false
    return true
  })

  if (active.length > 0) {
    return active.map((s): HeroSlide => {
      if (s.type === 'oem') {
        return {
          type: 'oem',
          advertiser:        s.oem_advertiser,
          bannerUrl:         s.oem_banner_url ?? '',
          destinationUrl:    s.oem_destination_url,
          impressionPixel:   s.oem_impression_pixel,
          clickTrackingUrl:  s.oem_click_tracking_url,
          headline:          s.oem_headline,
          subline:           s.oem_subline,
          ctaText:           s.oem_cta_text,
        }
      }
      if (!s.models) {
        return { type: 'oem', advertiser: null, bannerUrl: '', destinationUrl: null, impressionPixel: null, clickTrackingUrl: null, headline: null, subline: null, ctaText: null }
      }
      return modelRowToSlide(s.models as SliderModelRow)
    })
  }

  // Fallback: top 5 active models by price
  const { data: topModels } = await supabase
    .from('models')
    .select('name, slug, type, thumbnail_url, price_min, price_max, brands(name, slug, type), variants(fuel_type)')
    .eq('status', 'active')
    .not('price_min', 'is', null)
    .order('price_min', { ascending: false })
    .limit(5)

  return ((topModels ?? []) as unknown as SliderModelRow[]).map(modelRowToSlide)
}

const TRENDING = [
  { label: 'Tata Nexon',     slug: '/tata-cars/nexon/'             },
  { label: 'Maruti Swift',   slug: '/maruti-suzuki-cars/swift/'    },
  { label: 'Hyundai Creta',  slug: '/hyundai-cars/creta/'          },
  { label: 'Mahindra Thar',  slug: '/mahindra-cars/thar/'          },
  { label: 'Tata Punch',     slug: '/tata-cars/punch/'             },
  { label: 'Kia Seltos',     slug: '/kia-cars/seltos/'             },
  { label: 'Maruti Brezza',  slug: '/maruti-suzuki-cars/brezza/'   },
  { label: 'Hyundai Venue',  slug: '/hyundai-cars/venue/'          },
  { label: 'MG Hector',      slug: '/mg-cars/hector/'              },
  { label: 'Toyota Fortuner',slug: '/toyota-cars/fortuner/'        },
]

export default async function HomePage() {
  const [carBrands, slides] = await Promise.all([getCarBrands(), getSlides()])

  return (
    <>
      <SchemaMarkup schemas={[websiteSchema(), organizationSchema()]} />

      {/* 1 — Top ad billboard */}
      <AdSlot zone="hero-billboard" />

      {/* 2 — Hero search (slider rotates as background) */}
      <HeroSearch carBrands={carBrands} slides={slides} />

      {/* 3 — Recently viewed */}
      <RecentlyViewed />

      {/* 4 — Trending pills */}
      <div style={{ borderBottom: '1px solid #1e3a6e' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0.75rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto' }}>
            <span style={{ color: '#C0C0C0', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
              🔥 Trending:
            </span>
            {TRENDING.map(m => (
              <Link key={m.slug} href={m.slug} className="ap-trending-pill">{m.label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* 5 — Popular cars (tabbed: Popular / Latest / Upcoming / Electric) */}
      <PopularCars />

      {/* 6 — Cars by budget */}
      <BudgetCars />

      {/* 7 — Browse by body type */}
      <BodyTypeNav />

      {/* 8 — Popular brand grid */}
      <BrandGrid />

      {/* 9 — Ad slot (mid-feed-1) */}
      <section style={{ padding: '0.75rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <AdSlot zone="mid-feed-1" />
        </div>
      </section>

      {/* 10 — Cars by fuel type */}
      <section style={{ padding: '2.5rem 0', borderBottom: '1px solid #1e3a6e' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <FuelTypeCars />
        </div>
      </section>

      {/* 11 — Quick compare */}
      <QuickCompare />

      {/* 12 — Two-wheeler hub (bikes + scooters) */}
      <TwoWheelerHub />

      {/* 13 — Ad slot (mid-feed-2) */}
      <section style={{ padding: '0.75rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <AdSlot zone="mid-feed-2" />
        </div>
      </section>

      {/* 14 — Latest news */}
      <LatestNews />

      {/* 15 — Dealer CTA */}
      <section style={{ padding: '2.5rem 0', borderBottom: '1px solid #1e3a6e' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="ap-dealer-cta">
            <div className="ap-dealer-cta-text">
              <div className="ap-dealer-cta-title">🏪 Find authorized dealers near you</div>
              <div className="ap-dealer-cta-sub">28+ verified showrooms across 8 cities — cars, bikes and scooters</div>
            </div>
            <div className="ap-dealer-cta-btns">
              <Link
                href="/dealers/"
                className="ap-btn-cyan"
                style={{ display: 'inline-block', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.8125rem' }}
              >
                Browse Dealers →
              </Link>
              <Link
                href="/dealers/list-your-showroom/"
                className="ap-btn-outline"
                style={{ display: 'inline-block', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.8125rem' }}
              >
                List Your Showroom
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 16 — On-road price calculator */}
      <OnRoadCalc />

      {/* 17 — Explore CMS guide pages */}
      <ExplorePages />

      {/* 18 — SEO content */}
      <HomeSeoContent />
    </>
  )
}
