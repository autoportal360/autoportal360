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
  const carBrands = await getCarBrands()

  return (
    <>
      <SchemaMarkup schemas={[websiteSchema(), organizationSchema()]} />

      {/* 1 — Top ad billboard */}
      <AdSlot zone="hero-billboard" />

      {/* 2 — Hero search */}
      <HeroSearch carBrands={carBrands} />

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

      {/* 9 — Ad slot */}
      <section style={{ padding: '0.75rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="ap-ad-slot">📢 Advertisement</div>
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

      {/* 13 — Ad slot */}
      <section style={{ padding: '0.75rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="ap-ad-slot">📢 Advertisement</div>
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
