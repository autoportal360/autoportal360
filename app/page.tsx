import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatPriceRange } from '@/lib/utils'
import { getCanonicalUrl } from '@/lib/seo'
import HeroSlider, { type HeroSlide } from '@/components/HeroSlider'
import type { Brand } from '@/types'
import SchemaMarkup from '@/components/SchemaMarkup'
import { websiteSchema, organizationSchema } from '@/lib/schema'

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

// Fetch brands by type
async function getBrands(type: 'car' | 'bike' | 'scooter'): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('type', type)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) { console.error(`Error fetching ${type} brands:`, error); return [] }
  return data || []
}

// Brand card component
function BrandCard({ brand, type }: { brand: Brand; type: 'car' | 'bike' | 'scooter' }) {
  const suffix = type === 'car' ? 'cars' : type === 'bike' ? 'bikes' : 'scooters'
  const cleanSlug = brand.slug.replace(/-bike$/, '').replace(/-scooter$/, '')
  return (
    <Link href={`/${cleanSlug}-${suffix}/`} style={{
      background: '#111111',
      border: '1px solid rgba(0,212,255,0.12)',
      borderRadius: '14px',
      padding: '16px 8px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '7px',
      textDecoration: 'none',
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '10px',
        background: brand.logo_url ? '#FFFFFF' : 'rgba(0,212,255,0.08)',
        border: '1px solid rgba(0,212,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0, position: 'relative',
        padding: brand.logo_url ? '6px' : '0',
        boxSizing: 'border-box',
      }}>
        {brand.logo_url ? (
          <Image
            src={brand.logo_url}
            alt={brand.name}
            fill
            sizes="44px"
            style={{ objectFit: 'contain', padding: '6px' }}
          />
        ) : (
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 900, color: '#00D4FF' }}>
            {brand.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div style={{
        fontSize: '12px', fontWeight: 700, color: '#C0C0C0',
        textAlign: 'center', lineHeight: 1.3, fontFamily: 'Montserrat, sans-serif',
      }}>
        {brand.name}
      </div>
      {brand.price_min && brand.price_max && (
        <div style={{
          fontSize: '10px', color: '#00D4FF', fontWeight: 600,
          fontFamily: 'Montserrat, sans-serif', textAlign: 'center',
        }}>
          {formatPriceRange(brand.price_min, brand.price_max)}
        </div>
      )}
    </Link>
  )
}

// Hub divider
function HubDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
      <div style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: 800,
        color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '2px', whiteSpace: 'nowrap',
      }}>{label}</div>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(0,212,255,0.3),transparent)' }} />
    </div>
  )
}

// Section wrapper
function Section({ children, alt }: { children: React.ReactNode; alt?: boolean }) {
  return (
    <section style={{
      padding: '36px 24px',
      borderBottom: '1px solid rgba(0,212,255,0.07)',
      background: alt ? '#0A1F44' : 'transparent',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {children}
      </div>
    </section>
  )
}

type PopularModelRow = {
  id: string
  slug: string
  name: string
  price_min: number | null
  price_max: number | null
  thumbnail_url: string | null
  brands: { name: string; slug: string } | null
}

function modelToCard(
  m: PopularModelRow,
  suffix: 'cars' | 'bikes' | 'scooters',
  icon: string,
) {
  const brand = m.brands
  const brandSlug = (brand?.slug ?? '').replace(/-bike$/, '').replace(/-scooter$/, '')
  return {
    brand: brand?.name ?? '',
    name: m.name,
    price: m.price_min && m.price_max ? formatPriceRange(m.price_min, m.price_max) : '—',
    tags: [] as string[],
    href: `/${brandSlug}-${suffix}/${m.slug}/`,
    icon,
    badge: '',
    thumbnail_url: m.thumbnail_url,
  }
}

// Vehicle card (used for popular cars/bikes/scooters)
function VehicleCard({ item }: {
  item: {
    brand: string; name: string; price: string;
    tags: string[]; href: string; icon: string; badge: string;
    thumbnail_url?: string | null
  }
}) {
  return (
    <Link href={item.href} style={{
      background: '#111111', border: '1px solid rgba(0,212,255,0.12)',
      borderRadius: '14px', overflow: 'hidden', textDecoration: 'none', display: 'block',
    }}>
      {item.thumbnail_url ? (
        <div style={{
          height: '110px', position: 'relative',
          overflow: 'hidden', borderRadius: '14px 14px 0 0',
        }}>
          <Image
            src={item.thumbnail_url}
            alt={`${item.brand} ${item.name}`}
            fill
            sizes="200px"
            style={{ objectFit: 'cover' }}
          />
          {item.badge && (
            <span style={{
              position: 'absolute', top: '8px', left: '8px', zIndex: 1,
              background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)',
              color: '#00D4FF', fontSize: '9px', fontWeight: 700,
              padding: '2px 8px', borderRadius: '20px', fontFamily: 'Montserrat, sans-serif',
            }}>{item.badge}</span>
          )}
        </div>
      ) : (
        <div style={{
          height: '110px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '44px',
          background: 'linear-gradient(135deg,#0d1f3c,#0a0a0a)',
        }}>
          {item.icon}
        </div>
      )}
      <div style={{ padding: '11px 13px 13px' }}>
        <div style={{ fontSize: '10px', color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{item.brand}</div>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '3px' }}>{item.name}</div>
        <div style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', marginBottom: '7px' }}>{item.price}</div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {item.tags.map(tag => (
            <span key={tag} style={{
              fontSize: '10px', background: 'rgba(0,212,255,0.06)',
              border: '1px solid rgba(0,212,255,0.12)', color: '#8E99A8',
              padding: '2px 7px', borderRadius: '20px',
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}

// ─── Slider data fetch ─────────────────────────────────────────────────────────

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
    if (s.end_date && s.end_date < today) return false
    return true
  })

  if (active.length > 0) {
    return active.map((s): HeroSlide => {
      if (s.type === 'oem') {
        return {
          type: 'oem',
          advertiser: s.oem_advertiser,
          bannerUrl: s.oem_banner_url ?? '',
          destinationUrl: s.oem_destination_url,
          impressionPixel: s.oem_impression_pixel,
          clickTrackingUrl: s.oem_click_tracking_url,
          headline: s.oem_headline,
          subline: s.oem_subline,
          ctaText: s.oem_cta_text,
        }
      }
      const m = s.models
      if (!m) return { type: 'oem', advertiser: null, bannerUrl: '', destinationUrl: null, impressionPixel: null, clickTrackingUrl: null, headline: null, subline: null, ctaText: null }
      const brand = m.brands as { name: string; slug: string; type: string } | null
      const suffix = m.type === 'car' ? 'cars' : m.type === 'bike' ? 'bikes' : 'scooters'
      const cleanBrandSlug = (brand?.slug ?? '').replace(/-bike$/, '').replace(/-scooter$/, '')
      return {
        type: 'auto',
        brandName: brand?.name ?? '',
        brandSlug: cleanBrandSlug,
        brandType: m.type,
        modelName: m.name,
        modelSlug: m.slug,
        priceMin: m.price_min,
        priceMax: m.price_max,
        fuelTypes: [...new Set((m.variants ?? []).map(v => v.fuel_type).filter((f): f is string => !!f))],
        thumbnail: m.thumbnail_url,
      } as HeroSlide
    })
  }

  // Fallback: top 5 premium active models
  const { data: topModels } = await supabase
    .from('models')
    .select('name, slug, type, thumbnail_url, price_min, price_max, brands(name, slug, type), variants(fuel_type)')
    .eq('status', 'active')
    .not('price_min', 'is', null)
    .order('price_min', { ascending: false })
    .limit(5)

  return ((topModels ?? []) as unknown as SliderModelRow[]).map((m): HeroSlide => {
    const brand = m.brands as { name: string; slug: string; type: string } | null
    const cleanBrandSlug = (brand?.slug ?? '').replace(/-bike$/, '').replace(/-scooter$/, '')
    return {
      type: 'auto',
      brandName: brand?.name ?? '',
      brandSlug: cleanBrandSlug,
      brandType: m.type,
      modelName: m.name,
      modelSlug: m.slug,
      priceMin: m.price_min,
      priceMax: m.price_max,
      fuelTypes: [...new Set((m.variants ?? []).map(v => v.fuel_type).filter((f): f is string => !!f))],
      thumbnail: m.thumbnail_url,
    }
  })
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const modelSelect = 'id,slug,name,price_min,price_max,thumbnail_url,brands(name,slug)'
  const [slides, carBrands, bikeBrands, scooterBrands, carsRaw, bikesRaw, scootersRaw] = await Promise.all([
    getSlides(),
    getBrands('car'),
    getBrands('bike'),
    getBrands('scooter'),
    supabase.from('models').select(modelSelect).eq('type', 'car').eq('status', 'active').order('price_min', { ascending: true }).limit(6),
    supabase.from('models').select(modelSelect).eq('type', 'bike').eq('status', 'active').order('price_min', { ascending: true }).limit(4),
    supabase.from('models').select(modelSelect).eq('type', 'scooter').eq('status', 'active').order('price_min', { ascending: true }).limit(4),
  ])

  const popularCars     = ((carsRaw.data     ?? []) as unknown as PopularModelRow[]).map(m => modelToCard(m, 'cars',     '🚗'))
  const popularBikes    = ((bikesRaw.data    ?? []) as unknown as PopularModelRow[]).map(m => modelToCard(m, 'bikes',    '🏍️'))
  const popularScooters = ((scootersRaw.data ?? []) as unknown as PopularModelRow[]).map(m => modelToCard(m, 'scooters', '🛵'))

  return (
    <div>
      <SchemaMarkup schemas={[websiteSchema(), organizationSchema()]} />

      {/* ZONE 1 — HERO BILLBOARD */}
      <AdSlot zone="hero-billboard" />

      {/* ── HERO SLIDER ── */}
      <HeroSlider slides={slides} />

      {/* ── SEARCH BAR ── */}
      <section style={{
        padding: '16px 24px',
        background: '#0A1F44',
        borderBottom: '1px solid rgba(0,212,255,0.08)',
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {[
              { label: '🚗 Cars',      active: true },
              { label: '🏍️ Bikes',    active: false },
              { label: '🛵 Scooters', active: false },
              { label: '⚡ Compare',  active: false },
            ].map(tab => (
              <div key={tab.label} style={{
                background: tab.active ? '#00D4FF' : 'transparent',
                color: tab.active ? '#06142D' : '#8E99A8',
                fontSize: '12px', fontWeight: 700, padding: '6px 14px',
                borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                border: tab.active ? 'none' : '1px solid rgba(0,212,255,0.1)',
              }}>{tab.label}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select style={{
              flex: 1, minWidth: '140px',
              background: '#06142D', border: '1px solid rgba(0,212,255,0.15)',
              color: '#C0C0C0', fontSize: '13px', padding: '10px 14px',
              borderRadius: '8px', fontFamily: 'Inter, sans-serif', outline: 'none',
            }}>
              <option>Select Car Brand</option>
              {carBrands.map(b => <option key={b.id} value={b.slug}>{b.name}</option>)}
            </select>
            <select style={{
              flex: 1, minWidth: '140px',
              background: '#06142D', border: '1px solid rgba(0,212,255,0.15)',
              color: '#C0C0C0', fontSize: '13px', padding: '10px 14px',
              borderRadius: '8px', fontFamily: 'Inter, sans-serif', outline: 'none',
            }}>
              <option>Select City</option>
              <option>Chandigarh</option>
              <option>Delhi</option>
              <option>Mumbai</option>
              <option>Bengaluru</option>
              <option>Hyderabad</option>
            </select>
            <button style={{
              background: '#00D4FF', color: '#06142D', fontWeight: 900,
              fontSize: '13px', padding: '10px 22px', borderRadius: '8px',
              border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
              whiteSpace: 'nowrap',
            }}>Search →</button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(0,212,255,0.08)',
        overflow: 'hidden',
      }}>
        {[
          { num: '320+', lbl: 'Car Models' },
          { num: '280+', lbl: 'Bike Models' },
          { num: '120+', lbl: 'Scooters' },
          { num: '60+',  lbl: 'Brands' },
          { num: '48',   lbl: 'Cities' },
        ].map((s, i, arr) => (
          <div key={s.lbl} style={{
            textAlign: 'center', padding: '16px 8px',
            borderRight: i < arr.length - 1 ? '1px solid rgba(0,212,255,0.08)' : 'none',
            flex: 1, minWidth: 0,
          }}>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 900, color: '#00D4FF', whiteSpace: 'nowrap' }}>{s.num}</div>
            <div style={{ fontSize: '10px', color: '#8E99A8', marginTop: '2px', whiteSpace: 'nowrap' }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── CARS HUB ── */}
      <Section>
        <HubDivider label="🚗 Cars" />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.4px' }}>
              Browse by <span style={{ color: '#00D4FF' }}>Car Brand</span>
            </h2>
            <div style={{ fontSize: '11px', color: '#8E99A8', marginTop: '3px', fontFamily: 'monospace' }}>
              /new-cars/ → /<span style={{ color: '#00D4FF' }}>[brand]</span>-cars/
            </div>
          </div>
          <Link href="/new-cars/" style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
            All Brands →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '10px', marginBottom: '28px' }}>
          {carBrands.map(b => <BrandCard key={b.id} brand={b} type="car" />)}
        </div>
        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>
          Popular <span style={{ color: '#00D4FF' }}>Cars</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
          {popularCars.map(item => <VehicleCard key={item.name} item={item} />)}
        </div>
      </Section>

      {/* ── BIKES HUB ── */}
      <Section alt>
        <HubDivider label="🏍️ Bikes" />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.4px' }}>
              Browse by <span style={{ color: '#00D4FF' }}>Bike Brand</span>
            </h2>
            <div style={{ fontSize: '11px', color: '#8E99A8', marginTop: '3px', fontFamily: 'monospace' }}>
              /new-bikes/ → /<span style={{ color: '#00D4FF' }}>[brand]</span>-bikes/
            </div>
          </div>
          <Link href="/new-bikes/" style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
            All Brands →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '10px', marginBottom: '28px' }}>
          {bikeBrands.map(b => <BrandCard key={b.id} brand={b} type="bike" />)}
        </div>
        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>
          Popular <span style={{ color: '#00D4FF' }}>Bikes</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
          {popularBikes.map(item => <VehicleCard key={item.name} item={item} />)}
        </div>
      </Section>

      {/* ── SCOOTERS HUB ── */}
      <Section>
        <HubDivider label="🛵 Scooters" />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.4px' }}>
              Browse by <span style={{ color: '#00D4FF' }}>Scooter Brand</span>
            </h2>
            <div style={{ fontSize: '11px', color: '#8E99A8', marginTop: '3px', fontFamily: 'monospace' }}>
              /new-scooters/ → /<span style={{ color: '#00D4FF' }}>[brand]</span>-scooters/
            </div>
          </div>
          <Link href="/new-scooters/" style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
            All Brands →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '10px', marginBottom: '28px' }}>
          {scooterBrands.map(b => <BrandCard key={b.id} brand={b} type="scooter" />)}
        </div>
        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>
          Popular <span style={{ color: '#00D4FF' }}>Scooters</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
          {popularScooters.map(item => <VehicleCard key={item.name} item={item} />)}
        </div>
      </Section>

      {/* ── BODY TYPE ── */}
      <Section alt>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>
          Cars by <span style={{ color: '#00D4FF' }}>Body Type</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(115px,1fr))', gap: '10px' }}>
          {[
            { icon: '🚙', name: 'SUV',       count: '82', href: '/suv-cars/' },
            { icon: '🚗', name: 'Hatchback', count: '44', href: '/hatchback-cars/' },
            { icon: '🚘', name: 'Sedan',     count: '28', href: '/sedan-cars/' },
            { icon: '🚐', name: 'MPV',       count: '16', href: '/mpv-cars/' },
            { icon: '⚡', name: 'Electric',  count: '24', href: '/electric-cars/' },
            { icon: '🏎️', name: 'Luxury',   count: '38', href: '/luxury-cars/' },
          ].map(bt => (
            <Link key={bt.href} href={bt.href} style={{
              background: '#111111', border: '1px solid rgba(0,212,255,0.12)',
              borderRadius: '12px', padding: '18px 8px 13px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '6px', textDecoration: 'none',
            }}>
              <span style={{ fontSize: '26px' }}>{bt.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#C0C0C0', fontFamily: 'Montserrat, sans-serif' }}>{bt.name}</span>
              <span style={{ fontSize: '10px', color: '#8E99A8' }}>{bt.count} cars</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── COMPARE BANNER ── */}
      <Section>
        <div style={{
          background: 'linear-gradient(135deg,#0A1F44,#0d2550)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '16px', padding: '22px 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>
              Compare Any Two Vehicles
            </h3>
            <p style={{ color: '#8E99A8', fontSize: '13px' }}>
              Cars, bikes & scooters — 300+ spec points, zero sponsored rankings.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(0,212,255,0.05)', border: '1px dashed rgba(0,212,255,0.2)',
              borderRadius: '8px', padding: '9px 16px', fontSize: '12px', color: '#8E99A8', cursor: 'pointer',
            }}>+ Vehicle 1</div>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: 900, color: '#8E99A8' }}>VS</span>
            <div style={{
              background: 'rgba(0,212,255,0.05)', border: '1px dashed rgba(0,212,255,0.2)',
              borderRadius: '8px', padding: '9px 16px', fontSize: '12px', color: '#8E99A8', cursor: 'pointer',
            }}>+ Vehicle 2</div>
            <Link href="/compare/" style={{
              background: '#00D4FF', color: '#06142D', fontWeight: 800,
              padding: '10px 20px', borderRadius: '8px',
              fontFamily: 'Montserrat, sans-serif', fontSize: '13px', textDecoration: 'none',
            }}>Compare Now →</Link>
          </div>
        </div>
      </Section>

    </div>
  )
}