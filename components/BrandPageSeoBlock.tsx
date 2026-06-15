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

  const visibleModels = topModels.slice(0, 5)

  // First 3 sentences for the collapsed preview
  const sentences = seoText.split(/(?<=\.)\s+/).filter(s => s.trim())
  const previewText = sentences.slice(0, 3).join(' ')

  // Full paragraphs for expanded view
  const paragraphs = seoText.split('\n\n').filter(p => p.trim())

  const tableSchema = visibleModels.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'Table',
    about: `${brandName} Top Models with Ex-Showroom Prices in India 2026`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: visibleModels.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: m.name,
        description: `${brandName} ${m.name} ex-showroom price: ${m.price}`,
      })),
    },
  } : null

  return (
    <section style={{ marginBottom: '52px' }}>
      {tableSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(tableSchema) }}
        />
      )}

      <h2 style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: '22px',
        fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '20px',
      }}>
        {seoHeading || `About ${brandName} in India`}
      </h2>

      {!expanded ? (
        /* ── COLLAPSED STATE ── */
        <>
          <div style={{ position: 'relative' }}>
            <p className="ap-seo-para" style={{ margin: 0 }}>{previewText}</p>
            <div className="ap-seo-fade" />
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="ap-seo-toggle"
            aria-expanded={false}
          >
            Read More ↓
          </button>
        </>
      ) : (
        /* ── EXPANDED STATE ── */
        <>
          <div>
            {paragraphs.map((para, i) => (
              <p key={i} className="ap-seo-para">{para}</p>
            ))}
          </div>

          {/* Top Models Table — only visible when expanded */}
          {visibleModels.length > 0 && (
            <div style={{ marginTop: '28px', marginBottom: '8px', overflowX: 'auto' }}>
              <table className="ap-seo-table" aria-label={`${brandName} top models with ex-showroom prices`}>
                <thead className="ap-seo-table-header">
                  <tr>
                    <th scope="col" style={{
                      padding: '0.75rem 1rem', textAlign: 'left',
                      color: '#C0C0C0', fontSize: '0.75rem', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      Model
                    </th>
                    <th scope="col" style={{
                      padding: '0.75rem 1rem', textAlign: 'left',
                      color: '#C0C0C0', fontSize: '0.75rem', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
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

          <button
            onClick={() => setExpanded(false)}
            className="ap-seo-toggle"
            aria-expanded={true}
          >
            Show Less ↑
          </button>
        </>
      )}
    </section>
  )
}
