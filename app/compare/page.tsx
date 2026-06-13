import type { Metadata } from 'next'
import Link from 'next/link'
import { getCanonicalUrl } from '@/lib/seo'
import { POPULAR_COMPARISONS_BY_TYPE } from './compareUtils'

export const metadata: Metadata = {
  title: 'Compare Cars, Bikes & Scooters | AutoPortal360',
  description: 'Compare any two vehicles side by side — prices, specs, mileage, safety and features. Cars, bikes and scooters.',
  alternates: { canonical: getCanonicalUrl('/compare/') },
  robots: 'index, follow',
}

const TYPE_CARDS = [
  {
    type: 'car' as const,
    emoji: '🚗',
    label: 'Compare Cars',
    desc: 'Hatchbacks, SUVs, sedans & EVs',
    href: '/compare/cars/',
    color: '#00D4FF',
  },
  {
    type: 'bike' as const,
    emoji: '🏍️',
    label: 'Compare Bikes',
    desc: 'Commuters, cruisers & sports bikes',
    href: '/compare/bikes/',
    color: '#FFB400',
  },
  {
    type: 'scooter' as const,
    emoji: '🛵',
    label: 'Compare Scooters',
    desc: 'Regular, maxi & electric scooters',
    href: '/compare/scooters/',
    color: '#00CC66',
  },
]

export default function CompareLandingPage() {
  return (
    <div style={{ background: '#06142D', minHeight: '100vh', padding: '36px 20px 72px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#8E99A8', marginBottom: 28, alignItems: 'center' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>Compare Vehicles</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(24px, 5vw, 34px)',
            fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px',
          }}>
            Compare <span style={{ color: '#00D4FF' }}>Vehicles</span>
          </h1>
          <p style={{ fontSize: 14, color: '#8E99A8', margin: 0 }}>
            Select a category to compare prices, specs and features side by side
          </p>
        </div>

        {/* Category cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 16, marginBottom: 48,
        }}>
          {TYPE_CARDS.map(card => (
            <Link key={card.type} href={card.href} style={{
              background: 'rgba(0,212,255,0.03)',
              border: `1px solid ${card.color}33`,
              borderRadius: 16, padding: '24px 20px',
              textDecoration: 'none',
              display: 'flex', flexDirection: 'column', gap: 8,
              transition: 'border-color 0.15s',
            }}>
              <div style={{ fontSize: 36 }}>{card.emoji}</div>
              <div style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 17,
                fontWeight: 900, color: '#FFFFFF',
              }}>
                {card.label}
              </div>
              <div style={{ fontSize: 13, color: '#8E99A8' }}>{card.desc}</div>
              <div style={{
                marginTop: 8, fontSize: 12, fontWeight: 700,
                color: card.color,
              }}>
                Start comparing →
              </div>
            </Link>
          ))}
        </div>

        {/* Popular comparisons — 3 sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {TYPE_CARDS.map(card => (
            <div key={card.type} style={{
              background: 'rgba(0,212,255,0.02)',
              border: '1px solid rgba(0,212,255,0.08)',
              borderRadius: 14, padding: '20px 24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>{card.emoji}</span>
                <h2 style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 800,
                  color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0,
                }}>
                  Popular {card.label.replace('Compare ', '')} Comparisons
                </h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {POPULAR_COMPARISONS_BY_TYPE[card.type].map(c => (
                  <Link key={c.slug} href={`${card.href.slice(0, -1)}/${c.slug}/`} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '8px 14px',
                    textDecoration: 'none', fontSize: 13, color: '#C0C0C0',
                  }}>
                    {c.label}
                  </Link>
                ))}
                <Link href={card.href} style={{
                  background: `${card.color}14`,
                  border: `1px solid ${card.color}40`,
                  borderRadius: 8, padding: '8px 14px',
                  textDecoration: 'none', fontSize: 13,
                  color: card.color, fontWeight: 700,
                }}>
                  Compare any {card.label.replace('Compare ', '').slice(0, -1).toLowerCase()} →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
