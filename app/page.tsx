import AdSlot from '@/components/AdSlot'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatPriceRange } from '@/lib/utils'
import type { Brand } from '@/types'

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
      <div style={{
        height: '110px', position: 'relative',
        background: 'linear-gradient(135deg,#0d1f3c,#0a0a0a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.thumbnail_url ? (
          <Image
            src={item.thumbnail_url}
            alt={`${item.brand} ${item.name}`}
            fill
            sizes="(max-width: 600px) 50vw, 200px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: '44px' }}>{item.icon}</span>
        )}
        {item.badge && (
          <span style={{
            position: 'absolute', top: '8px', left: '8px', zIndex: 1,
            background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)',
            color: '#00D4FF', fontSize: '9px', fontWeight: 700,
            padding: '2px 8px', borderRadius: '20px', fontFamily: 'Montserrat, sans-serif',
          }}>{item.badge}</span>
        )}
      </div>
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

export default async function HomePage() {
  const [carBrands, bikeBrands, scooterBrands] = await Promise.all([
    getBrands('car'),
    getBrands('bike'),
    getBrands('scooter'),
  ])

  const popularCars = [
    { brand: 'Maruti Suzuki', name: 'Swift',      price: '₹6.49 – 9.64L',  tags: ['Petrol','CNG'],     href: '/maruti-suzuki-cars/swift/',   icon: '🚗', badge: 'TRENDING' },
    { brand: 'Tata',          name: 'Nexon',      price: '₹8.10 – 15.50L', tags: ['Petrol','EV'],      href: '/tata-cars/nexon/',            icon: '🚙', badge: 'TOP PICK' },
    { brand: 'Hyundai',       name: 'Creta',      price: '₹11.11 – 20.45L',tags: ['Petrol','Diesel'],  href: '/hyundai-cars/creta/',         icon: '🛻', badge: '' },
    { brand: 'Mahindra',      name: 'Scorpio-N',  price: '₹13.86 – 24.54L',tags: ['Diesel','4WD'],     href: '/mahindra-cars/scorpio-n/',    icon: '🚘', badge: '' },
    { brand: 'Kia',           name: 'Seltos',     price: '₹10.89 – 20.35L',tags: ['Petrol','DCT'],     href: '/kia-cars/seltos/',            icon: '🚘', badge: '' },
    { brand: 'Tata',          name: 'Tiago EV',   price: '₹8.69 – 12.49L', tags: ['Electric','315km'], href: '/tata-cars/tiago-ev/',         icon: '⚡', badge: 'EV' },
  ]

  const popularBikes = [
    { brand: 'Royal Enfield', name: 'Classic 350',   price: '₹1.93 – 2.26L', tags: ['349cc','20.2 bhp'], href: '/royal-enfield-bikes/classic-350/', icon: '🏍️', badge: 'BESTSELLER' },
    { brand: 'Bajaj',         name: 'Pulsar NS200',  price: '₹1.50 – 1.55L', tags: ['199cc','24.5 bhp'], href: '/bajaj-bikes/pulsar-ns200/',        icon: '🏍️', badge: '' },
    { brand: 'KTM',           name: 'Duke 390',      price: '₹3.11 – 3.20L', tags: ['373cc','46 bhp'],   href: '/ktm-bikes/duke-390/',              icon: '🏍️', badge: 'SPORTY' },
    { brand: 'Hero',          name: 'Splendor Plus', price: '₹77K – 83K',    tags: ['97cc','Commuter'],  href: '/hero-bikes/splendor-plus/',        icon: '🏍️', badge: '' },
  ]

  const popularScooters = [
    { brand: 'Honda',        name: 'Activa 6G', price: '₹75K – 79K',    tags: ['110cc','OBD2'],     href: '/honda-scooters/activa-6g/',      icon: '🛵', badge: 'BESTSELLER' },
    { brand: 'TVS',          name: 'NTorq 125', price: '₹88K – 1.01L',  tags: ['125cc','Smart'],    href: '/tvs-scooters/ntorq-125/',        icon: '🛵', badge: '' },
    { brand: 'Ather',        name: '450X',      price: '₹1.30 – 1.46L', tags: ['Electric','146km'], href: '/ather-scooters/450x/',           icon: '⚡', badge: 'EV' },
    { brand: 'Ola Electric', name: 'S1 Pro',    price: '₹1.24 – 1.47L', tags: ['Electric','195km'], href: '/ola-electric-scooters/s1-pro/',  icon: '⚡', badge: 'EV' },
  ]

  return (
    <div>

      {/* ZONE 1 — HERO BILLBOARD */}
      <AdSlot zone="hero-billboard" />

      {/* ── HERO ── */}
      <section style={{
        padding: '52px 24px 44px', textAlign: 'center',
        background: 'linear-gradient(180deg,rgba(0,212,255,0.05) 0%,transparent 60%)',
        borderBottom: '1px solid rgba(0,212,255,0.08)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
          color: '#00D4FF', fontSize: '10px', fontWeight: 700,
          padding: '4px 14px', borderRadius: '20px', marginBottom: '18px',
          letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif',
        }}>
          🇮🇳 Cars · Bikes · Scooters — All in One Place
        </div>

        <h1 style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '44px', fontWeight: 900,
          lineHeight: 1.05, letterSpacing: '-1.5px', marginBottom: '12px', color: '#FFFFFF',
        }}>
          Research Smarter.<br />
          <span style={{ color: '#00D4FF' }}>Drive Better.</span>
        </h1>

        <p style={{
          color: '#C0C0C0', fontSize: '16px', maxWidth: '460px',
          margin: '0 auto 28px', lineHeight: 1.7,
        }}>
          Specs, prices, reviews and comparisons for every car, bike and scooter
          in India — unbiased, always updated.
        </p>

        {/* SEARCH BOX */}
        <div style={{
          maxWidth: '660px', margin: '0 auto',
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '16px', padding: '16px',
        }}>
          {/* TABS — visual only, interactive version built later as client component */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', flexWrap: 'wrap' }}>
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

          {/* SEARCH ROW */}
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