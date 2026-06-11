import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import type { Brand } from '@/types'
import BrandGrid from './BrandGrid'
import FaqAccordion from './FaqAccordion'
import { getCanonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'New Bikes in India 2026 — All Brands, Prices & Specs',
  description:
    'Browse every new bike brand and model available in India. Compare ex-showroom prices, on-road costs, mileage, ABS and variant specs. Updated June 2026.',
  alternates: { canonical: getCanonicalUrl('/new-bikes/') },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: 'New Bikes in India 2026 — All Brands, Prices & Specs',
    description:
      'Compare every new bike brand in India — prices, specs, mileage and on-road cost in your city.',
    url: getCanonicalUrl('/new-bikes/'),
    type: 'website',
  },
}

async function getBikeBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('type', 'bike')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) {
    console.error('Error fetching bike brands:', error)
    return []
  }
  return data || []
}

const BODY_TYPES = [
  { icon: '⚡', name: 'Sport',       count: 28, href: '/sport-bikes/' },
  { icon: '🏍️', name: 'Cruiser',    count: 18, href: '/cruiser-bikes/' },
  { icon: '🚲', name: 'Commuter',    count: 45, href: '/commuter-bikes/' },
  { icon: '🏔️', name: 'Adventure',  count: 22, href: '/adventure-bikes/' },
  { icon: '🔥', name: 'Naked Sport', count: 15, href: '/naked-bikes/' },
  { icon: '🛣️', name: 'Street',     count: 12, href: '/street-bikes/' },
]

const BUDGETS = [
  { label: 'Under ₹50,000',    href: '/new-bikes/budget-under-50000/' },
  { label: '₹50K – ₹1 Lakh',  href: '/new-bikes/budget-50k-1-lakh/' },
  { label: '₹1 – ₹2 Lakh',    href: '/new-bikes/budget-1-2-lakh/' },
  { label: '₹2 – ₹3 Lakh',    href: '/new-bikes/budget-2-3-lakh/' },
  { label: '₹3 – ₹5 Lakh',    href: '/new-bikes/budget-3-5-lakh/' },
  { label: 'Above ₹5 Lakh',    href: '/new-bikes/budget-above-5-lakh/' },
]

export default async function NewBikesPage() {
  const brands = await getBikeBrands()

  return (
    <div>

      {/* AD ZONE 1 — HERO BILLBOARD */}
      <AdSlot zone="hero-billboard" />

      {/* BREADCRUMB */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8E99A8' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>New Bikes</span>
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
            🏍️ {brands.length > 0 ? `${brands.length} Brands` : 'All Brands'} · 280+ Models
          </div>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '32px', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '10px', color: '#FFFFFF',
          }}>
            New Bikes in India <span style={{ color: '#00D4FF' }}>2026</span>
          </h1>
          <p style={{
            color: '#C0C0C0', fontSize: '15px',
            maxWidth: '640px', lineHeight: 1.7, margin: 0,
          }}>
            Browse every bike brand and model on sale in India. Compare ex-showroom prices,
            on-road costs, fuel efficiency, ABS features and variant-wise specs — all in one place.
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
                All Bike <span style={{ color: '#00D4FF' }}>Brands</span>
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

        {/* ── BIKE TYPE ── */}
        <section style={{ marginBottom: '52px' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
            fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px',
          }}>
            Bikes by <span style={{ color: '#00D4FF' }}>Type</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#8E99A8', marginBottom: '20px' }}>
            Find the right bike style for your riding needs
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
                <span style={{ fontSize: '10px', color: '#8E99A8' }}>{bt.count} bikes</span>
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
            Bikes by <span style={{ color: '#00D4FF' }}>Budget</span>
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
            New Bikes in India — <span style={{ color: '#00D4FF' }}>Buyer&apos;s Guide 2026</span>
          </h2>
          <div style={{
            color: '#C0C0C0', fontSize: '14px',
            lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <p style={{ margin: 0 }}>
              India is the world&apos;s largest two-wheeler market, with over 20 million bikes sold annually.
              Hero MotoCorp dominates with a 35%+ market share, led by the Splendor+ and HF Deluxe — India&apos;s
              best-selling vehicles. Bajaj Auto rules the performance segment with the Pulsar series, while
              Honda maintains strong volumes through the CB Shine and Unicorn. Royal Enfield has carved out
              a premium 250cc+ niche with the Classic 350 and Meteor 350.
            </p>
            <p style={{ margin: 0 }}>
              The 100–125cc commuter segment accounts for nearly 60% of all bike sales, driven by fuel
              efficiency concerns and affordability. The 150–200cc performance segment is growing rapidly,
              led by Bajaj Pulsar, TVS Apache, and Yamaha FZ series. Adventure touring bikes (250cc+) from
              Royal Enfield, KTM, and Bajaj Dominar are seeing strong demand from highway touring enthusiasts.
            </p>
            <p style={{ margin: 0 }}>
              Electric bikes are emerging as a viable alternative, with Revolt, Tork, and Ultraviolette
              offering performance-oriented models. Government subsidies under FAME-II and state EV policies
              have brought electric bike prices closer to petrol equivalents. Battery-swapping models from
              Gogoro and Sun Mobility are also gaining traction in fleet segments.
            </p>
            <p style={{ margin: 0 }}>
              When buying a new bike in India, compare ex-showroom vs on-road prices — road tax varies
              significantly by state (2–12%). Since April 2019, ABS is mandatory on bikes above 125cc.
              Always check insurance costs separately — comprehensive cover typically adds ₹5,000–15,000
              to the on-road price. AutoPortal360 provides variant-wise specs, on-road price calculations
              for every city, and side-by-side comparisons for every bike on sale.
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
            Everything you need to know about buying a new bike in India
          </p>
          <FaqAccordion />
        </section>

      </div>

      {/* AD ZONE 4 — PRE-FOOTER */}
      <AdSlot zone="pre-footer" />

    </div>
  )
}
