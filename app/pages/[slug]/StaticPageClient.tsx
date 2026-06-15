'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Vehicle {
  brand: string
  model: string
  price: string
  fuel: string
  type: string
  slug: string
  tag: string
}

interface Faq {
  question: string
  answer: string
}

interface Props {
  heroHeading: string
  heroSubtext: string | null
  pageType: string
  vehicles: Vehicle[]
  seoHeading: string | null
  seoText: string
  faqs: Faq[]
}

export default function StaticPageClient({
  heroHeading, heroSubtext, pageType, vehicles, seoHeading, seoText, faqs,
}: Props) {
  const [seoExpanded, setSeoExpanded] = useState(false)
  const [openFaq, setOpenFaq]         = useState<number | null>(null)

  const seoParagraphs = seoText.split('\n\n').filter(Boolean)
  const visibleParas  = seoExpanded ? seoParagraphs : seoParagraphs.slice(0, 2)

  const typeLabel = pageType === 'bikes' ? 'Bikes' : pageType === 'scooters' ? 'Scooters' : pageType === 'mixed' ? 'Vehicles' : 'Cars'

  return (
    <div style={{ background: '#06142D', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <section style={{
        padding: '36px 24px 28px',
        background: 'linear-gradient(135deg,#0A1F44,#06142D)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: '12px', color: '#8E99A8', marginBottom: '18px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href={pageType === 'bikes' ? '/new-bikes/' : pageType === 'scooters' ? '/new-scooters/' : '/new-cars/'} style={{ color: '#8E99A8', textDecoration: 'none' }}>
              {typeLabel}
            </Link>
            <span>›</span>
            <span style={{ color: '#C0C0C0' }}>{heroHeading}</span>
          </div>

          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(22px,4vw,36px)',
            fontWeight: 900, color: '#FFFFFF', marginBottom: '10px', letterSpacing: '-0.5px', lineHeight: 1.2,
          }}>
            {heroHeading}
          </h1>
          {heroSubtext && (
            <p style={{ fontSize: '15px', color: '#8E99A8', marginBottom: '18px', maxWidth: '680px', lineHeight: 1.6 }}>
              {heroSubtext}
            </p>
          )}
          <div style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
            {vehicles.length} {typeLabel} Listed
          </div>
        </div>
      </section>

      {/* ── VEHICLE GRID ── */}
      <section style={{ padding: '32px 24px', borderBottom: '1px solid rgba(0,212,255,0.07)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="ap-vehicle-grid">
            {vehicles.map((v, i) => (
              <Link
                key={i}
                href={v.slug}
                className="ap-vehicle-card"
                style={{ textDecoration: 'none', display: 'block', position: 'relative' }}
              >
                {v.tag && (
                  <span className="ap-tag-badge">{v.tag}</span>
                )}
                <div style={{ fontSize: '10px', color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px', marginTop: v.tag ? '28px' : '0' }}>
                  {v.brand}
                </div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 900, color: '#FFFFFF', marginBottom: '4px', lineHeight: 1.25 }}>
                  {v.model}
                </div>
                <div style={{ fontSize: '14px', color: '#00D4FF', fontWeight: 700, marginBottom: '12px' }}>
                  {v.price}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {v.fuel && (
                    <span style={{
                      fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                      background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)', color: '#8E99A8',
                    }}>{v.fuel}</span>
                  )}
                  {v.type && (
                    <span style={{
                      fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                      background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)', color: '#8E99A8',
                    }}>{v.type}</span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#00D4FF', fontWeight: 700 }}>View Details →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO TEXT ── */}
      {seoText && (
        <section style={{ padding: '36px 24px', borderBottom: '1px solid rgba(0,212,255,0.07)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {seoHeading && (
              <h2 style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: '22px', fontWeight: 800,
                color: '#FFFFFF', marginBottom: '20px', letterSpacing: '-0.3px',
              }}>
                {seoHeading}
              </h2>
            )}
            <div style={{ position: 'relative' }}>
              {visibleParas.map((para, i) => (
                <p key={i} className="ap-seo-para">{para}</p>
              ))}
              {!seoExpanded && seoParagraphs.length > 2 && (
                <div className="ap-seo-fade" style={{ background: 'linear-gradient(transparent,#06142D)' }} />
              )}
            </div>
            {seoParagraphs.length > 2 && (
              <button className="ap-seo-toggle" onClick={() => setSeoExpanded(v => !v)}>
                {seoExpanded ? 'Show Less ↑' : 'Read More ↓'}
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {faqs.length > 0 && (
        <section style={{ padding: '36px 24px 48px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '22px', fontWeight: 800,
              color: '#FFFFFF', marginBottom: '20px', letterSpacing: '-0.3px',
            }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
                    borderRadius: '12px', overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '16px 20px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                    }}
                  >
                    <span style={{
                      fontFamily: 'Montserrat, sans-serif', fontSize: '14px',
                      fontWeight: 700, color: '#FFFFFF', lineHeight: 1.4,
                    }}>
                      {faq.question}
                    </span>
                    <span style={{ color: '#00D4FF', fontSize: '18px', fontWeight: 700, flexShrink: 0, lineHeight: 1 }}>
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 20px 18px' }}>
                      <p style={{ fontSize: '14px', color: '#8E99A8', lineHeight: 1.7, margin: 0 }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
