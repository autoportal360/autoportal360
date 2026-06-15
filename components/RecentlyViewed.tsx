'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RecentItem {
  slug: string
  brand: string
  model: string
  price: string
  timestamp: number
}

const KEY = 'ap_recently_viewed'

export default function RecentlyViewed() {
  const [items, setItems]     = useState<RecentItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  if (!mounted || items.length === 0) return null

  const clear = () => {
    try { localStorage.removeItem(KEY) } catch { /* ignore */ }
    setItems([])
  }

  return (
    <section style={{
      padding: '28px 24px',
      borderBottom: '1px solid rgba(0,212,255,0.07)',
      background: '#0A1F44',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
              Continue Your <span style={{ color: '#00D4FF' }}>Research</span>
            </h2>
            <p style={{ fontSize: '12px', color: '#8E99A8', margin: 0 }}>Pick up where you left off</p>
          </div>
          <button
            onClick={clear}
            style={{
              fontSize: '11px', color: '#8E99A8', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0', flexShrink: 0,
            }}
          >
            Clear ✕
          </button>
        </div>

        <div className="ap-scroll-row">
          {items.map(item => (
            <Link
              key={item.slug}
              href={item.slug}
              className="ap-card ap-scroll-card"
              style={{ textDecoration: 'none', display: 'block', flexBasis: '220px' }}
            >
              <div style={{ fontSize: '10px', color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>
                {item.brand}
              </div>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '5px', lineHeight: 1.3 }}>
                {item.model}
              </div>
              <div style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 700, marginBottom: '12px' }}>
                {item.price || '—'}
              </div>
              <div style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 600 }}>
                View →
              </div>
            </Link>
          ))}
          {/* View all visual end-cap */}
          <div className="ap-scroll-card" style={{
            flexBasis: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,212,255,0.04)', border: '1px dashed rgba(0,212,255,0.2)',
            borderRadius: '.75rem', flexShrink: 0,
          }}>
            <span style={{ fontSize: '13px', color: '#00D4FF', fontWeight: 600 }}>View all →</span>
          </div>
        </div>

      </div>
    </section>
  )
}
