'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      background: 'rgba(6,20,45,0.97)',
      borderBottom: '1px solid rgba(0,212,255,0.15)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '62px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      gap: '12px',
    }}>

      {/* LOGO */}
      <Link href="/" style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '19px',
        fontWeight: 900,
        letterSpacing: '-0.5px',
        color: '#FFFFFF',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}>
        Auto<span style={{ color: '#00D4FF' }}>Portal</span>360
      </Link>

      {/* DESKTOP LINKS */}
      <div style={{
        display: 'flex',
        gap: '2px',
        alignItems: 'center',
      }}>
        {[
          { label: 'Cars',      href: '/new-cars/' },
          { label: 'Bikes',     href: '/new-bikes/' },
          { label: 'Scooters',  href: '/new-scooters/' },
          { label: 'Compare',   href: '/compare/' },
          { label: 'News',      href: '/news/' },
          { label: 'Dealers',   href: '/dealers/' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              color: '#8E99A8',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              padding: '6px 11px',
              borderRadius: '6px',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.color = '#00D4FF'
              ;(e.target as HTMLElement).style.background = 'rgba(0,212,255,0.07)'
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.color = '#8E99A8'
              ;(e.target as HTMLElement).style.background = 'transparent'
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* CITY PILL */}
      <button style={{
        background: 'rgba(0,212,255,0.08)',
        border: '1px solid rgba(0,212,255,0.2)',
        color: '#00D4FF',
        fontSize: '12px',
        fontWeight: 500,
        padding: '5px 12px',
        borderRadius: '20px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, sans-serif',
      }}>
        📍 Chandigarh ▾
      </button>

    </nav>
  )
}