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
  const [items, setItems]   = useState<RecentItem[]>([])
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
      padding: '36px 24px',
      borderBottom: '1px solid rgba(0,212,255,0.07)',
      background: '#0A1F44',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
              Recently <span style={{ color: '#00D4FF' }}>Viewed</span>
            </h2>
            <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>Pick up where you left off</p>
          </div>
          <button
            onClick={clear}
            style={{
              fontSize: '12px', color: '#8E99A8', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0', flexShrink: 0,
            }}
          >
            Clear History ✕
          </button>
        </div>

        <div className="ap-scroll-row">
          {items.map(item => (
            <Link
              key={item.slug}
              href={item.slug}
              className="ap-card ap-scroll-card"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{ fontSize: '10px', color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
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
        </div>

      </div>
    </section>
  )
}
