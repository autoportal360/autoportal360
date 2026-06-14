'use client'

import { useState, useRef } from 'react'

interface Props {
  seoText: string
  brandName: string
}

export default function BrandSeoText({ seoText, brandName }: Props) {
  const [expanded, setExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  if (!seoText) return null

  const paragraphs = seoText.split('\n\n').filter(p => p.trim())

  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
        fontSize: '1.0625rem', color: '#fff', marginBottom: '.875rem',
      }}>
        About {brandName} in India
      </h2>

      <div className="ap-panel" style={{ padding: '1.25rem' }}>
        {/* Text container with collapse/expand */}
        <div
          ref={contentRef}
          className="ap-seo-block"
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

          {/* Fade overlay when collapsed */}
          {!expanded && (
            <div className="ap-seo-fade" />
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="ap-seo-toggle"
          aria-expanded={expanded}
        >
          {expanded ? 'Show Less ↑' : 'Read More ↓'}
        </button>
      </div>
    </section>
  )
}
