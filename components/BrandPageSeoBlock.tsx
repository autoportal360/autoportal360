'use client'

import { useState } from 'react'

interface TopModel {
  name: string
  price: string
}

interface Props {
  seoHeading: string
  seoText: string
  topModels: TopModel[]
  brandName: string
}

export default function BrandPageSeoBlock({ seoHeading, seoText, topModels, brandName }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (!seoText) return null

  const paragraphs = seoText.split('\n\n').filter(p => p.trim())
  const visibleModels = topModels.slice(0, 5)

  return (
    <section style={{ marginBottom: '52px' }}>
      <h2 style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
        fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '24px',
      }}>
        {seoHeading || `About ${brandName} in India`}
      </h2>

      {/* Top Models Table */}
      {visibleModels.length > 0 && (
        <div style={{ marginBottom: '24px', overflowX: 'auto' }}>
          <table className="ap-seo-table">
            <thead className="ap-seo-table-header">
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#C0C0C0', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Model
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#C0C0C0', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ex-Showroom Price
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleModels.map((m, i) => (
                <tr key={i} className="ap-seo-table-row">
                  <td className="ap-seo-table-model">{m.name}</td>
                  <td className="ap-seo-table-price">{m.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SEO Text with expand/collapse */}
      <div
        style={{
          maxHeight: expanded ? '3000px' : '80px',
          overflow: 'hidden',
          transition: expanded ? 'max-height 0.5s ease' : 'max-height 0.25s ease',
          position: 'relative',
        }}
      >
        {paragraphs.map((para, i) => (
          <p key={i} className="ap-seo-para">{para}</p>
        ))}

        {!expanded && <div className="ap-seo-fade" style={{ background: 'linear-gradient(transparent,#06142D)' }} />}
      </div>

      <button
        onClick={() => setExpanded(v => !v)}
        className="ap-seo-toggle"
        aria-expanded={expanded}
      >
        {expanded ? 'Show Less ↑' : 'Read More ↓'}
      </button>
    </section>
  )
}
