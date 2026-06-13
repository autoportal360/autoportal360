import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getCanonicalUrl } from '@/lib/seo'
import { formatPrice } from '@/lib/utils'
import AdSlot from '@/components/AdSlot'
import {
  POPULAR_COMPARISONS_BY_TYPE,
  loadPopularPreviews,
  getVehicleTypeCounts,
  type PopularComparisonData,
  type ComparisonPreview,
} from './compareUtils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Compare Cars, Bikes & Scooters | AutoPortal360',
  description: 'Compare any two vehicles side by side — prices, specs, mileage, safety and features. Cars, bikes and scooters. Unbiased, zero sponsored results.',
  alternates: { canonical: getCanonicalUrl('/compare/') },
  robots: 'index, follow',
}

// ─── comparison card ──────────────────────────────────────────────────────────

function VehicleHalf({ v, side }: { v: ComparisonPreview | null; side: 'left' | 'right' }) {
  if (!v) return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: side === 'left' ? 'flex-start' : 'flex-end',
      gap: 4, minWidth: 0,
    }}>
      <div style={{ width: 72, height: 52, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
      <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>No data</div>
    </div>
  )
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: side === 'left' ? 'flex-start' : 'flex-end',
      gap: 4, minWidth: 0,
    }}>
      <div style={{
        width: 72, height: 52, borderRadius: 8, overflow: 'hidden',
        background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.08)',
        position: 'relative', flexShrink: 0,
      }}>
        {v.thumbnail_url
          ? <Image src={v.thumbnail_url} alt={v.modelName} fill style={{ objectFit: 'contain', padding: 3 }} sizes="72px" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🚗</div>
        }
      </div>
      <div style={{
        fontSize: 11, color: '#8E99A8',
        textAlign: side === 'right' ? 'right' : 'left',
      }}>{v.brandName}</div>
      <div style={{
        fontSize: 13, fontWeight: 800, color: '#FFFFFF',
        fontFamily: 'Montserrat, sans-serif', lineHeight: 1.2,
        textAlign: side === 'right' ? 'right' : 'left',
      }}>{v.modelName}</div>
      {v.price_min && (
        <div style={{ fontSize: 12, color: '#00D4FF', fontWeight: 700 }}>
          {formatPrice(v.price_min)}
        </div>
      )}
    </div>
  )
}

function ComparisonCard({ data, basePath }: { data: PopularComparisonData; basePath: string }) {
  const { v1, v2, slug, label } = data

  // Price difference
  let priceDiffLabel = ''
  if (v1?.price_min && v2?.price_min) {
    const diff = Math.abs(v1.price_min - v2.price_min)
    const lakh = (diff / 100000).toFixed(2).replace(/\.?0+$/, '')
    priceDiffLabel = `₹${lakh}L difference`
  }

  // Mileage comparison
  let mileageLabel = ''
  if (v1?.mileage_arai && v2?.mileage_arai) {
    mileageLabel = `${v1.mileage_arai} vs ${v2.mileage_arai} km/l`
  }

  return (
    <Link href={`${basePath}/${slug}/`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: '#0D1E3A',
        border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: 14,
        padding: '16px',
        transition: 'border-color 0.15s',
        height: '100%', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.1)')}
      >
        {/* Thumbnails row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <VehicleHalf v={v1} side="left" />
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#00D4FF',
          }}>VS</div>
          <VehicleHalf v={v2} side="right" />
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap',
          borderTop: '1px solid rgba(0,212,255,0.07)',
          paddingTop: 10,
        }}>
          {priceDiffLabel && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: 'rgba(0,204,102,0.12)', color: '#00CC66',
              border: '1px solid rgba(0,204,102,0.2)',
              padding: '3px 8px', borderRadius: 6,
            }}>
              {priceDiffLabel}
            </span>
          )}
          {mileageLabel && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
              border: '1px solid rgba(0,212,255,0.15)',
              padding: '3px 8px', borderRadius: 6,
            }}>
              {mileageLabel} mileage
            </span>
          )}
          {!priceDiffLabel && !mileageLabel && (
            <span style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>View comparison</span>
          )}
        </div>

        {/* CTA */}
        <div style={{
          fontSize: 12, fontWeight: 700, color: '#00D4FF',
          display: 'flex', alignItems: 'center', gap: 4,
          marginTop: 'auto',
        }}>
          Compare Now →
        </div>
      </div>
    </Link>
  )
}

// ─── section header ───────────────────────────────────────────────────────────

function SectionHeader({
  emoji, title, href, viewAllLabel,
}: {
  emoji: string; title: string; href: string; viewAllLabel: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
      <h2 style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: 20,
        fontWeight: 900, color: '#FFFFFF', margin: 0,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 22 }}>{emoji}</span> {title}
      </h2>
      <Link href={href} style={{
        fontSize: 12, fontWeight: 700, color: '#00D4FF',
        border: '1px solid rgba(0,212,255,0.25)', borderRadius: 8,
        padding: '6px 14px', textDecoration: 'none',
      }}>
        {viewAllLabel} →
      </Link>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function CompareLandingPage() {
  // Fetch counts + all popular previews in parallel
  const allComparisons = [
    ...POPULAR_COMPARISONS_BY_TYPE.car,
    ...POPULAR_COMPARISONS_BY_TYPE.bike,
    ...POPULAR_COMPARISONS_BY_TYPE.scooter,
  ]

  const [counts, allPreviews] = await Promise.all([
    getVehicleTypeCounts(),
    loadPopularPreviews(allComparisons),
  ])

  const carCount      = allComparisons.findIndex(c => c.slug === POPULAR_COMPARISONS_BY_TYPE.bike[0].slug)
  const bikeCount     = allComparisons.findIndex(c => c.slug === POPULAR_COMPARISONS_BY_TYPE.scooter[0].slug)
  const carPreviews   = allPreviews.slice(0, POPULAR_COMPARISONS_BY_TYPE.car.length)
  const bikePreviews  = allPreviews.slice(POPULAR_COMPARISONS_BY_TYPE.car.length, POPULAR_COMPARISONS_BY_TYPE.car.length + POPULAR_COMPARISONS_BY_TYPE.bike.length)
  const scootPreviews = allPreviews.slice(POPULAR_COMPARISONS_BY_TYPE.car.length + POPULAR_COMPARISONS_BY_TYPE.bike.length)

  // Silence unused vars warning
  void carCount; void bikeCount

  const TYPE_CARDS = [
    { type: 'car' as const,     emoji: '🚗', label: 'Compare Cars',     href: '/compare/cars/',     count: counts.car,     color: '#00D4FF', desc: 'Hatchbacks, SUVs, sedans & EVs' },
    { type: 'bike' as const,    emoji: '🏍️', label: 'Compare Bikes',    href: '/compare/bikes/',    count: counts.bike,    color: '#FFB400', desc: 'Cruisers, commuters & sports bikes' },
    { type: 'scooter' as const, emoji: '🛵', label: 'Compare Scooters', href: '/compare/scooters/', count: counts.scooter, color: '#00CC66', desc: 'Regular, maxi & electric scooters' },
  ]

  const GRID: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 14,
    marginBottom: 48,
  }

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, #0A1F44 0%, #06142D 100%)',
        borderBottom: '1px solid rgba(0,212,255,0.12)',
        padding: '52px 20px 48px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>

          <div style={{
            display: 'inline-block',
            fontSize: 11, fontWeight: 700, color: '#00D4FF',
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 20, padding: '4px 14px',
            letterSpacing: '1px', textTransform: 'uppercase',
            marginBottom: 18,
          }}>
            Unbiased · Zero Sponsored Results
          </div>

          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(28px, 6vw, 46px)',
            fontWeight: 900, color: '#FFFFFF',
            margin: '0 0 14px', lineHeight: 1.15,
          }}>
            Compare Cars, Bikes<br />&amp; <span style={{ color: '#00D4FF' }}>Scooters</span>
          </h1>
          <p style={{
            fontSize: 16, color: '#8E99A8', margin: '0 auto 40px',
            maxWidth: 520, lineHeight: 1.65,
          }}>
            Compare specs, prices and features side by side.<br />
            Make the best buying decision with real data.
          </p>

          {/* Type cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 14, maxWidth: 780, margin: '0 auto',
          }}>
            {TYPE_CARDS.map(card => (
              <Link key={card.type} href={card.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#0A1F44',
                  border: `1px solid ${card.color}30`,
                  borderRadius: 16, padding: '24px 20px 20px',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.borderColor = `${card.color}80`
                  el.style.background = '#0C2454'
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = `0 8px 24px ${card.color}18`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.borderColor = `${card.color}30`
                  el.style.background = '#0A1F44'
                  el.style.transform = 'none'
                  el.style.boxShadow = 'none'
                }}
                >
                  <div style={{ fontSize: 40, marginBottom: 4 }}>{card.emoji}</div>
                  <div style={{
                    fontFamily: 'Montserrat, sans-serif', fontSize: 16,
                    fontWeight: 900, color: '#FFFFFF',
                  }}>{card.label}</div>
                  {card.count > 0 && (
                    <div style={{
                      fontSize: 11, fontWeight: 700,
                      color: card.color, marginBottom: 2,
                    }}>
                      {card.count} {card.label.replace('Compare ', '')} available
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#8E99A8', marginBottom: 8 }}>{card.desc}</div>
                  <div style={{
                    marginTop: 'auto',
                    background: `${card.color}18`,
                    border: `1px solid ${card.color}35`,
                    borderRadius: 8, padding: '8px 0',
                    fontSize: 12, fontWeight: 800, color: card.color,
                    textAlign: 'center',
                  }}>
                    Start Comparing →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── COMPARISON SECTIONS ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '52px 20px 0' }}>

        {/* Popular Car Comparisons */}
        <div style={{ marginBottom: 52 }}>
          <SectionHeader emoji="🚗" title="Popular Car Comparisons" href="/compare/cars/" viewAllLabel="Compare Cars" />
          <div style={GRID}>
            {carPreviews.map(d => (
              <ComparisonCard key={d.slug} data={d} basePath="/compare/cars" />
            ))}
          </div>
        </div>

        {/* Popular Bike Comparisons */}
        <div style={{ marginBottom: 52 }}>
          <SectionHeader emoji="🏍️" title="Popular Bike Comparisons" href="/compare/bikes/" viewAllLabel="Compare Bikes" />
          <div style={GRID}>
            {bikePreviews.map(d => (
              <ComparisonCard key={d.slug} data={d} basePath="/compare/bikes" />
            ))}
          </div>
        </div>

        {/* Popular Scooter Comparisons */}
        <div style={{ marginBottom: 52 }}>
          <SectionHeader emoji="🛵" title="Popular Scooter Comparisons" href="/compare/scooters/" viewAllLabel="Compare Scooters" />
          <div style={GRID}>
            {scootPreviews.map(d => (
              <ComparisonCard key={d.slug} data={d} basePath="/compare/scooters" />
            ))}
          </div>
        </div>

        {/* How to compare */}
        <div style={{ marginBottom: 52 }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: 20, fontWeight: 900,
            color: '#FFFFFF', margin: '0 0 20px',
          }}>
            How to Compare Vehicles
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 14,
          }}>
            {[
              { step: '01', icon: '🔍', title: 'Select Vehicles', desc: 'Choose up to 3 cars, bikes or scooters using our brand and model picker.' },
              { step: '02', icon: '📊', title: 'Compare Specs',   desc: 'Get a detailed side-by-side table — price, engine, mileage, safety and more.' },
              { step: '03', icon: '✅', title: 'Make Decision',   desc: 'See which vehicle wins each category and get the best price offer near you.' },
            ].map(s => (
              <div key={s.step} style={{
                background: 'rgba(0,212,255,0.03)',
                border: '1px solid rgba(0,212,255,0.1)',
                borderRadius: 14, padding: '22px 20px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 11, fontWeight: 900, color: '#00D4FF',
                    background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)',
                    padding: '3px 9px', borderRadius: 20,
                  }}>
                    {s.step}
                  </span>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                </div>
                <div style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: 15,
                  fontWeight: 800, color: '#FFFFFF',
                }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#8E99A8', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AdSlot pre-footer */}
        <div style={{ marginBottom: 52 }}>
          <AdSlot zone="pre-footer" />
        </div>

      </div>
    </div>
  )
}
