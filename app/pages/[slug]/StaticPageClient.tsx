'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Vehicle {
  brand: string; model: string; price: string
  fuel: string; type: string; slug: string; tag: string
  image_url?: string
}
interface Faq { question: string; answer: string }
interface RelatedPage { title: string; slug: string; hero_subtext: string | null; page_type: string }

interface Props {
  title: string
  heroHeading: string
  heroSubtext: string | null
  pageType: string
  vehicles: Vehicle[]
  seoHeading: string | null
  seoText: string
  faqs: Faq[]
  relatedPages: RelatedPage[]
  currentSlug: string
}

const MAX_CONTENT = '1024px'

const BUDGET_PILLS: Record<string, string[]> = {
  cars:     ['Under ₹10L', '₹10-15L', '₹15-20L', '₹20-30L', 'Above ₹30L'],
  bikes:    ['Under ₹1L', '₹1-2L', '₹2-3L', 'Above ₹3L'],
  scooters: ['Under ₹80K', '₹80K-1L', '₹1-1.5L', 'Above ₹1.5L'],
  mixed:    ['Under ₹5L', '₹5-10L', '₹10-20L', 'Above ₹20L'],
}

function typeLabel(pt: string) {
  return pt === 'bikes' ? 'Bikes' : pt === 'scooters' ? 'Scooters' : pt === 'mixed' ? 'Vehicles' : 'Cars'
}
function typeEmoji(pt: string) {
  return pt === 'bikes' ? '🏍️' : pt === 'scooters' ? '🛵' : '🚗'
}
function typeHref(pt: string) {
  return pt === 'bikes' ? '/new-bikes/' : pt === 'scooters' ? '/new-scooters/' : '/new-cars/'
}
function typePageEmoji(pt: string) {
  return pt === 'bikes' ? '🏍️' : pt === 'scooters' ? '🛵' : pt === 'mixed' ? '🚘' : '🚗'
}
function pageTypeBadge(pt: string) {
  return pt === 'bikes' ? 'Bikes' : pt === 'scooters' ? 'Scooters' : pt === 'mixed' ? 'Mixed' : 'Cars'
}

function computeHighlights(vehicles: Vehicle[], pageType: string) {
  const count = vehicles.length
  const label = typeLabel(pageType)

  const popular = vehicles.find(v =>
    /best seller|most popular|most sold|india.*#1|iconic/i.test(v.tag ?? ''),
  ) ?? vehicles[0]

  const affordable = vehicles.find(v =>
    /budget|affordable|cheapest|most affordable/i.test(v.tag ?? ''),
  ) ?? vehicles[count - 1]

  // Segment counts by type field
  const segments: Record<string, number> = {}
  vehicles.forEach(v => {
    const t = v.type?.trim()
    if (t) segments[t] = (segments[t] ?? 0) + 1
  })
  const segmentStr = Object.entries(segments)
    .map(([k, v]) => `${k} (${v})`)
    .join(', ')

  // Price range: last vehicle as cheapest indicator, first as top-end
  const priceRange = count > 1
    ? `${vehicles[count - 1]?.price ?? '—'} – ${vehicles[0]?.price ?? '—'}`
    : vehicles[0]?.price ?? '—'

  return { count, popular, affordable, label, priceRange, segmentStr }
}

export default function StaticPageClient({
  title, heroHeading, heroSubtext, pageType, vehicles, seoHeading, seoText, faqs, relatedPages, currentSlug,
}: Props) {
  const [seoExpanded, setSeoExpanded] = useState(false)
  const [openFaq, setOpenFaq]         = useState<number | null>(null)

  const seoParagraphs    = seoText.split('\n\n').filter(Boolean)
  const visibleParas     = seoExpanded ? seoParagraphs : seoParagraphs.slice(0, 2)
  const tLabel           = typeLabel(pageType)
  const tEmoji           = typeEmoji(pageType)
  const budgetPills      = BUDGET_PILLS[pageType] ?? BUDGET_PILLS.cars
  const featuredVehicles = vehicles.slice(0, 3)
  const highlights       = computeHighlights(vehicles, pageType)

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', color: '#FFFFFF' }}>

      {/* ── S1: BREADCRUMB ── */}
      <div style={{
        padding: '10px 24px',
        background: '#060F22',
        borderBottom: '1px solid rgba(30,58,110,0.6)',
      }}>
        <div style={{ maxWidth: MAX_CONTENT, margin: '0 auto', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: '#8E99A8' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span style={{ opacity: 0.5 }}>›</span>
          <Link href={typeHref(pageType)} style={{ color: '#8E99A8', textDecoration: 'none' }}>{tLabel}</Link>
          <span style={{ opacity: 0.5 }}>›</span>
          <span style={{ color: '#C0C0C0' }}>{title}</span>
        </div>
      </div>

      {/* ── S2: HERO ── */}
      <section style={{
        padding: '40px 24px 32px',
        background: 'linear-gradient(160deg,#0d2550 0%,#06142D 60%)',
        borderBottom: '1px solid rgba(30,58,110,0.4)',
      }}>
        <div style={{ maxWidth: MAX_CONTENT, margin: '0 auto' }}>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(22px, 3.5vw, 34px)',
            fontWeight: 900, color: '#FFFFFF',
            marginBottom: '12px', letterSpacing: '-0.5px', lineHeight: 1.2,
          }}>
            {heroHeading}
          </h1>
          {heroSubtext && (
            <p style={{ fontSize: '15px', color: '#8E99A8', marginBottom: '22px', maxWidth: '640px', lineHeight: 1.65 }}>
              {heroSubtext}
            </p>
          )}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: '9999px', padding: '5px 14px',
              fontSize: '12px', fontWeight: 700, color: '#00D4FF', fontFamily: 'Montserrat, sans-serif',
            }}>
              {tEmoji} {vehicles.length} Models Listed
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '9999px', padding: '5px 14px',
              fontSize: '12px', color: '#8E99A8',
            }}>
              Updated June 2026
            </span>
          </div>
        </div>
      </section>

      {/* ── S3: BUDGET FILTER PILLS ── */}
      <section style={{ padding: '14px 24px', background: '#060F22', borderBottom: '1px solid rgba(30,58,110,0.4)' }}>
        <div style={{ maxWidth: MAX_CONTENT, margin: '0 auto' }}>
          <div className="ap-trending-row">
            {budgetPills.map(label => (
              <a key={label} href="#vehicles" className="ap-trending-pill" style={{ fontSize: '12px', padding: '5px 14px' }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── S4: FEATURED VEHICLES (TOP 3) ── */}
      {featuredVehicles.length > 0 && (
        <section style={{ padding: '36px 24px', borderBottom: '1px solid rgba(30,58,110,0.4)' }}>
          <div style={{ maxWidth: MAX_CONTENT, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 800,
              color: '#FFFFFF', marginBottom: '16px', letterSpacing: '-0.3px',
            }}>
              Top Picks
            </h2>
            <div className="ap-vehicle-grid">
              {featuredVehicles.map((v, i) => (
                <Link
                  key={i}
                  href={v.slug}
                  className="ap-card"
                  style={{ textDecoration: 'none', padding: '24px', position: 'relative', display: 'block' }}
                >
                  {v.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.image_url} alt={`${v.brand} ${v.model}`} className="ap-vehicle-img" />
                  ) : (
                    <div className="ap-vehicle-img-placeholder">{tEmoji}</div>
                  )}
                  {v.tag && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{
                        display: 'inline-block', background: '#00D4FF', color: '#06142D',
                        fontSize: '10px', fontWeight: 800, padding: '3px 10px',
                        borderRadius: '9999px', fontFamily: 'Montserrat, sans-serif',
                      }}>
                        {v.tag}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>
                    {v.brand}
                  </div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 900, color: '#FFFFFF', marginBottom: '6px', lineHeight: 1.2 }}>
                    {v.model}
                  </div>
                  <div style={{ fontSize: '16px', color: '#00D4FF', fontWeight: 700, marginBottom: '12px' }}>
                    {v.price}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                    {v.fuel && <span className="ap-vehicle-type-pill">{v.fuel}</span>}
                    {v.type && <span className="ap-vehicle-type-pill">{v.type}</span>}
                  </div>
                  <div style={{ fontSize: '13px', color: '#00D4FF', fontWeight: 700 }}>View Details →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── S5: ALL VEHICLES LIST ── */}
      {vehicles.length > 0 && (
        <section id="vehicles" style={{ padding: '36px 24px', background: '#060F22', borderBottom: '1px solid rgba(30,58,110,0.4)' }}>
          <div style={{ maxWidth: MAX_CONTENT, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
              <h2 style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 800,
                color: '#FFFFFF', letterSpacing: '-0.3px',
              }}>
                All {tLabel} in This List
              </h2>
              <span style={{ fontSize: '12px', color: '#8E99A8', flexShrink: 0 }}>({vehicles.length} total)</span>
            </div>
            <div className="ap-vehicle-list">
              {vehicles.map((v, i) => (
                <div key={i} className="ap-vehicle-row">
                  {v.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.image_url} alt={`${v.brand} ${v.model}`} className="ap-vehicle-thumb" />
                  ) : (
                    <div className="ap-vehicle-rank">{i + 1}</div>
                  )}
                  <div className="ap-vehicle-info">
                    <div className="ap-vehicle-brand">{v.brand}</div>
                    <div className="ap-vehicle-name">{v.model}</div>
                    <div className="ap-vehicle-meta">
                      {v.type && <span className="ap-vehicle-type-pill">{v.type}</span>}
                      {v.fuel && <span className="ap-vehicle-type-pill">{v.fuel}</span>}
                    </div>
                  </div>
                  <div className="ap-vehicle-price">{v.price}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                    {v.tag && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                        borderRadius: '9999px', background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF',
                        fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap',
                      }}>
                        {v.tag}
                      </span>
                    )}
                    <Link href={v.slug} className="ap-vehicle-link">View →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── S6: KEY HIGHLIGHTS TABLE ── */}
      {vehicles.length > 0 && (
        <section style={{ padding: '36px 24px', borderBottom: '1px solid rgba(30,58,110,0.4)' }}>
          <div style={{ maxWidth: MAX_CONTENT, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 800,
              color: '#FFFFFF', marginBottom: '16px', letterSpacing: '-0.3px',
            }}>
              Key Highlights
            </h2>
            <table className="ap-seo-table">
              <thead>
                <tr className="ap-seo-table-header">
                  <th style={{ padding: '.75rem 1rem', textAlign: 'left', color: '#8E99A8', fontSize: '.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', width: '40%' }}>
                    Highlight
                  </th>
                  <th style={{ padding: '.75rem 1rem', textAlign: 'left', color: '#8E99A8', fontSize: '.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {([
                  ['Price Range',      highlights.priceRange],
                  ['Number of Models', `${highlights.count} ${highlights.label}`],
                  ['Most Affordable',  highlights.affordable ? `${highlights.affordable.brand} ${highlights.affordable.model} — ${highlights.affordable.price}` : '—'],
                  ['Most Popular',     highlights.popular ? `${highlights.popular.brand} ${highlights.popular.model} — ${highlights.popular.price}` : '—'],
                  ...(highlights.segmentStr ? [['Segments', highlights.segmentStr]] : []),
                ] as [string, string][]).map(([lbl, val], i) => (
                  <tr key={i} className="ap-seo-table-row">
                    <td className="ap-seo-table-model" style={{ fontWeight: 600, color: '#C0C0C0' }}>{lbl}</td>
                    <td className="ap-seo-table-model" style={{ color: '#FFFFFF' }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── S7: SEO CONTENT (COLLAPSIBLE) ── */}
      {seoText && (
        <section style={{ padding: '36px 24px', background: '#060F22', borderBottom: '1px solid rgba(30,58,110,0.4)' }}>
          <div style={{ maxWidth: MAX_CONTENT, margin: '0 auto' }}>
            {seoHeading && (
              <h2 style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800,
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
                <div className="ap-seo-fade" style={{ background: 'linear-gradient(transparent,#060F22)' }} />
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

      {/* ── S8: FAQ ACCORDION ── */}
      {faqs.length > 0 && (
        <section style={{ padding: '36px 24px', borderBottom: '1px solid rgba(30,58,110,0.4)' }}>
          <div style={{ maxWidth: MAX_CONTENT, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800,
              color: '#FFFFFF', marginBottom: '20px', letterSpacing: '-0.3px',
            }}>
              Frequently Asked Questions
            </h2>
            <div className="ap-faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className="ap-faq-item">
                  <button
                    className="ap-faq-question"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.question}
                    <span className="ap-faq-icon">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="ap-faq-answer">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── S9: RELATED PAGES ── */}
      {relatedPages.filter(p => p.slug !== currentSlug).length > 0 && (
        <section style={{ padding: '36px 24px 52px', background: '#060F22' }}>
          <div style={{ maxWidth: MAX_CONTENT, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 800,
              color: '#FFFFFF', marginBottom: '16px', letterSpacing: '-0.3px',
            }}>
              Explore More
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '12px' }}>
              {relatedPages.filter(p => p.slug !== currentSlug).map(p => (
                <Link
                  key={p.slug}
                  href={`/pages/${p.slug}/`}
                  className="ap-card"
                  style={{ textDecoration: 'none', padding: '18px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{typePageEmoji(p.page_type)}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                      borderRadius: '9999px', background: 'rgba(0,212,255,0.1)',
                      border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF',
                      fontFamily: 'Montserrat, sans-serif',
                    }}>
                      {pageTypeBadge(p.page_type)}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px', lineHeight: 1.3 }}>
                    {p.title}
                  </div>
                  {p.hero_subtext && (
                    <div style={{
                      fontSize: '12px', color: '#8E99A8', lineHeight: 1.5, marginBottom: '12px',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {p.hero_subtext}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 700 }}>Read More →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
