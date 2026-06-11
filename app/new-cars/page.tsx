import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import type { Brand } from '@/types'
import BrandGrid from './BrandGrid'
import FaqAccordion from './FaqAccordion'
import { getCanonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'New Cars in India 2026 — All Brands, Prices & Specs',
  description:
    'Browse every new car brand and model available in India. Compare ex-showroom prices, on-road costs, mileage, safety ratings and variant specs. Updated June 2026.',
  alternates: { canonical: getCanonicalUrl('/new-cars/') },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: 'New Cars in India 2026 — All Brands, Prices & Specs',
    description:
      'Compare every new car brand in India — prices, specs, mileage and on-road cost in your city.',
    url: getCanonicalUrl('/new-cars/'),
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
  if (error) {
    console.error('Error fetching car brands:', error)
    return []
  }
  return data || []
}

const BODY_TYPES = [
  { icon: '🚙', name: 'SUV',        count: 82,  href: '/suv-cars/' },
  { icon: '🚗', name: 'Hatchback',  count: 44,  href: '/hatchback-cars/' },
  { icon: '🚘', name: 'Sedan',      count: 28,  href: '/sedan-cars/' },
  { icon: '🚐', name: 'MPV',        count: 16,  href: '/mpv-cars/' },
  { icon: '⚡', name: 'Electric',   count: 24,  href: '/electric-cars/' },
  { icon: '🏎️', name: 'Luxury',    count: 38,  href: '/luxury-cars/' },
  { icon: '🛻', name: 'Pickup',     count: 8,   href: '/pickup-cars/' },
  { icon: '🚑', name: 'Commercial', count: 12,  href: '/commercial-vehicles/' },
]

const BUDGETS = [
  { label: 'Under ₹5 Lakh',     href: '/new-cars/budget-under-5-lakh/' },
  { label: '₹5 – ₹10 Lakh',    href: '/new-cars/budget-5-10-lakh/' },
  { label: '₹10 – ₹20 Lakh',   href: '/new-cars/budget-10-20-lakh/' },
  { label: '₹20 – ₹50 Lakh',   href: '/new-cars/budget-20-50-lakh/' },
  { label: '₹50L – ₹1 Crore',  href: '/new-cars/budget-50-lakh-1-crore/' },
  { label: 'Above ₹1 Crore',    href: '/new-cars/budget-above-1-crore/' },
]

export default async function NewCarsPage() {
  const brands = await getCarBrands()

  return (
    <div>

      {/* AD ZONE 1 — HERO BILLBOARD */}
      <AdSlot zone="hero-billboard" />

      {/* BREADCRUMB */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8E99A8' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>New Cars</span>
        </div>
      </div>

      {/* PAGE HEADER */}
      <section style={{
        padding: '36px 24px 28px',
        background: 'linear-gradient(180deg,rgba(0,212,255,0.04) 0%,transparent 70%)',
        borderBottom: '1px solid rgba(0,212,255,0.08)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
            color: '#00D4FF', fontSize: '10px', fontWeight: 700,
            padding: '4px 12px', borderRadius: '20px', marginBottom: '14px',
            letterSpacing: '1px', textTransform: 'uppercase',
            fontFamily: 'Montserrat, sans-serif',
          }}>
            🚗 {brands.length > 0 ? `${brands.length} Brands` : 'All Brands'} · 320+ Models
          </div>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '32px', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '10px', color: '#FFFFFF',
          }}>
            New Cars in India <span style={{ color: '#00D4FF' }}>2026</span>
          </h1>
          <p style={{
            color: '#C0C0C0', fontSize: '15px',
            maxWidth: '640px', lineHeight: 1.7, margin: 0,
          }}>
            Browse every car brand and model on sale in India. Compare ex-showroom prices,
            on-road costs, fuel efficiency, safety ratings and variant-wise specs — all in one place.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 24px' }}>

        {/* ── ALL BRANDS + ALPHA FILTER ── */}
        <section style={{ marginBottom: '52px' }}>
          <div style={{
            display: 'flex', alignItems: 'baseline',
            justifyContent: 'space-between', flexWrap: 'wrap',
            gap: '10px', marginBottom: '20px',
          }}>
            <div>
              <h2 style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
                fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px',
              }}>
                All Car <span style={{ color: '#00D4FF' }}>Brands</span>
              </h2>
              <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
                Filter by first letter or browse all {brands.length} brands
              </p>
            </div>
          </div>
          <BrandGrid brands={brands} />
        </section>

        {/* AD ZONE 2 */}
        <div style={{ marginBottom: '52px' }}>
          <AdSlot zone="mid-feed-1" />
        </div>

        {/* ── BODY TYPE ── */}
        <section style={{ marginBottom: '52px' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
            fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px',
          }}>
            Cars by <span style={{ color: '#00D4FF' }}>Body Type</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#8E99A8', marginBottom: '20px' }}>
            Find the right car shape for your lifestyle
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '10px',
          }}>
            {BODY_TYPES.map(bt => (
              <Link key={bt.href} href={bt.href} style={{
                background: '#111111', border: '1px solid rgba(0,212,255,0.12)',
                borderRadius: '12px', padding: '20px 8px 14px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '6px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '28px' }}>{bt.icon}</span>
                <span style={{
                  fontSize: '12px', fontWeight: 700, color: '#C0C0C0',
                  fontFamily: 'Montserrat, sans-serif',
                }}>{bt.name}</span>
                <span style={{ fontSize: '10px', color: '#8E99A8' }}>{bt.count} cars</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── BUDGET BANDS ── */}
        <section style={{ marginBottom: '52px' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
            fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px',
          }}>
            Cars by <span style={{ color: '#00D4FF' }}>Budget</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#8E99A8', marginBottom: '20px' }}>
            Start with your budget, find the best options in your range
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {BUDGETS.map(b => (
              <Link key={b.href} href={b.href} style={{
                background: '#0A1F44', border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: '30px', padding: '10px 22px',
                fontSize: '13px', fontWeight: 700, color: '#C0C0C0',
                textDecoration: 'none', fontFamily: 'Montserrat, sans-serif',
              }}>{b.label}</Link>
            ))}
          </div>
        </section>

        {/* AD ZONE 3 */}
        <div style={{ marginBottom: '52px' }}>
          <AdSlot zone="mid-feed-2" />
        </div>

        {/* ── SEO CONTENT ── */}
        <section style={{
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: '16px', padding: '32px', marginBottom: '52px',
        }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '20px',
            fontWeight: 800, marginBottom: '20px',
          }}>
            New Cars in India — <span style={{ color: '#00D4FF' }}>Buyer&apos;s Guide 2026</span>
          </h2>
          <div style={{
            color: '#C0C0C0', fontSize: '14px',
            lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <p style={{ margin: 0 }}>
              India is one of the world&apos;s fastest-growing automotive markets, with over 4.2 million
              passenger vehicles sold in FY 2024–25. The market spans everything from sub-₹4 Lakh
              hatchbacks to ₹10 Crore ultra-luxury SUVs. Maruti Suzuki leads with over 42% market share,
              while Tata Motors has emerged as the dominant EV brand with models like the Nexon EV,
              Punch EV, and Tiago EV.
            </p>
            <p style={{ margin: 0 }}>
              The SUV segment now accounts for nearly 55% of all passenger car sales, driven by the
              Hyundai Creta, Maruti Brezza, Kia Seltos, and Mahindra Scorpio-N. Compact SUVs priced
              between ₹8 Lakh and ₹15 Lakh represent the sweet spot. Sedans have seen a mild revival,
              with the Honda City and Hyundai Verna remaining strong sellers in Tier-1 cities.
            </p>
            <p style={{ margin: 0 }}>
              Electric vehicles are gaining rapid traction. FAME-II subsidies and state EV policies have
              brought entry-level EV prices to ₹8–10 Lakh after subsidy. Tata Motors leads with over 70%
              EV market share, but faces increasing competition from MG, BYD, Hyundai Ioniq, Mahindra BE
              series, and upcoming launches from Maruti Suzuki and Toyota.
            </p>
            <p style={{ margin: 0 }}>
              When buying a new car in India, always compare ex-showroom vs on-road prices — the gap can
              be ₹1–3 Lakh depending on your state&apos;s RTO charges. Check the NCAP safety rating: India
              now has its own Bharat NCAP programme alongside Global NCAP. AutoPortal360 lets you
              calculate on-road prices for any city, compare variants side-by-side, and get unbiased
              spec data for every model on sale.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ marginBottom: '52px' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
            fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px',
          }}>
            Frequently Asked <span style={{ color: '#00D4FF' }}>Questions</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#8E99A8', marginBottom: '24px' }}>
            Everything you need to know about buying a new car in India
          </p>
          <FaqAccordion />
        </section>

      </div>

      {/* AD ZONE 4 — PRE-FOOTER */}
      <AdSlot zone="pre-footer" />

    </div>
  )
}
