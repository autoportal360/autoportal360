import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdSlot from '@/components/AdSlot'
import type { Brand } from '@/types'
import BrandGrid from './BrandGrid'
import FaqAccordion from './FaqAccordion'
import { getCanonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'New Scooters in India 2026 — All Brands, Prices & Specs',
  description:
    'Browse every new scooter brand and model in India including electric scooters. Compare ex-showroom prices, boot space, mileage and variant specs. Updated June 2026.',
  alternates: { canonical: getCanonicalUrl('/new-scooters/') },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: 'New Scooters in India 2026 — All Brands, Prices & Specs',
    description:
      'Compare every new scooter brand in India — prices, range, boot space and on-road cost in your city.',
    url: getCanonicalUrl('/new-scooters/'),
    type: 'website',
  },
}

async function getScooterBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('type', 'scooter')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) {
    console.error('Error fetching scooter brands:', error)
    return []
  }
  return data || []
}

const BODY_TYPES = [
  { icon: '🛵', name: 'Family',   count: 32, href: '/family-scooters/' },
  { icon: '⚡', name: 'Sport',    count: 12, href: '/sport-scooters/' },
  { icon: '🔋', name: 'Electric', count: 18, href: '/electric-scooters/' },
  { icon: '💎', name: 'Premium',  count: 8,  href: '/premium-scooters/' },
]

const BUDGETS = [
  { label: 'Under ₹60,000',      href: '/new-scooters/budget-under-60000/' },
  { label: '₹60K – ₹80K',        href: '/new-scooters/budget-60k-80k/' },
  { label: '₹80K – ₹1 Lakh',     href: '/new-scooters/budget-80k-1-lakh/' },
  { label: '₹1 – ₹1.5 Lakh',     href: '/new-scooters/budget-1-1-5-lakh/' },
  { label: '₹1.5 – ₹2 Lakh',     href: '/new-scooters/budget-1-5-2-lakh/' },
  { label: 'Above ₹2 Lakh',       href: '/new-scooters/budget-above-2-lakh/' },
]

export default async function NewScootersPage() {
  const brands = await getScooterBrands()

  return (
    <div>

      {/* AD ZONE 1 — HERO BILLBOARD */}
      <AdSlot zone="hero-billboard" />

      {/* BREADCRUMB */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8E99A8' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>New Scooters</span>
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
            🛵 {brands.length > 0 ? `${brands.length} Brands` : 'All Brands'} · 120+ Models
          </div>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '32px', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '10px', color: '#FFFFFF',
          }}>
            New Scooters in India <span style={{ color: '#00D4FF' }}>2026</span>
          </h1>
          <p style={{
            color: '#C0C0C0', fontSize: '15px',
            maxWidth: '640px', lineHeight: 1.7, margin: 0,
          }}>
            Browse every scooter brand and model on sale in India — from family gearless scooters
            to premium electric models. Compare prices, boot space, range and variant-wise specs.
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
                All Scooter <span style={{ color: '#00D4FF' }}>Brands</span>
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

        {/* ── SCOOTER TYPE ── */}
        <section style={{ marginBottom: '52px' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
            fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px',
          }}>
            Scooters by <span style={{ color: '#00D4FF' }}>Type</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#8E99A8', marginBottom: '20px' }}>
            Find the right scooter for your lifestyle
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
                <span style={{ fontSize: '10px', color: '#8E99A8' }}>{bt.count} scooters</span>
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
            Scooters by <span style={{ color: '#00D4FF' }}>Budget</span>
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
            New Scooters in India — <span style={{ color: '#00D4FF' }}>Buyer&apos;s Guide 2026</span>
          </h2>
          <div style={{
            color: '#C0C0C0', fontSize: '14px',
            lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <p style={{ margin: 0 }}>
              Scooters account for nearly 35% of India&apos;s two-wheeler market, with over 7 million units sold
              annually. Honda Activa has been India&apos;s best-selling scooter for 20+ consecutive years,
              consistently outselling even the best-selling bikes. TVS Jupiter, Suzuki Access 125, and
              Yamaha Fascino are the other top sellers. The 110–125cc gearless scooter segment is the
              sweet spot, offering a balance of fuel efficiency and practicality.
            </p>
            <p style={{ margin: 0 }}>
              Electric scooters have disrupted the market significantly since 2022. Ola Electric, Ather,
              TVS, Bajaj, and Hero MotoCorp all offer electric scooters now. The Ola S1 series has sold
              over 500,000 units and is the market leader. Ather 450X leads on technology and software.
              TVS iQube and Bajaj Chetak are backed by the strongest dealer networks. FAME-II and state
              subsidies bring electric scooter effective prices ₹15,000–30,000 lower than sticker price.
            </p>
            <p style={{ margin: 0 }}>
              Key buying factors for scooters: boot space (under-seat storage, 14–22L range),
              kerb weight (lighter is easier to manoeuvre), CBS/ABS (CBS mandatory since 2019),
              service centre proximity, and resale value. Honda and TVS have the strongest service
              networks nationally. Suzuki Access 125 delivers best-in-segment mileage (55+ km/l ARAI).
            </p>
            <p style={{ margin: 0 }}>
              When buying a scooter, compare on-road price — which includes road tax, registration,
              insurance, and accessories. On-road price can be ₹8,000–25,000 higher than ex-showroom.
              For electric scooters, also check the battery warranty (typically 3 years/50,000 km) and
              charging time. AutoPortal360 helps you compare scooter variants side by side, calculate
              on-road prices for any city, and check real-world ownership reviews.
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
            Everything you need to know about buying a new scooter in India
          </p>
          <FaqAccordion />
        </section>

      </div>

      {/* AD ZONE 4 — PRE-FOOTER */}
      <AdSlot zone="pre-footer" />

    </div>
  )
}
