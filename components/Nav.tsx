'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const LINKS = [
  { label: 'Cars',     href: '/new-cars/' },
  { label: 'Bikes',    href: '/new-bikes/' },
  { label: 'Scooters', href: '/new-scooters/' },
  { label: 'Compare',  href: '/compare/' },
  { label: 'News',     href: '/news/' },
  { label: 'Dealers',  href: '/dealers/' },
]

const LINK_STYLE: React.CSSProperties = {
  color: '#8E99A8', fontSize: '13px', fontWeight: 500,
  textDecoration: 'none', padding: '6px 11px',
  borderRadius: '6px', whiteSpace: 'nowrap',
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setMenuOpen(false)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <>
      <nav style={{
        background: 'rgba(6,20,45,0.97)',
        borderBottom: '1px solid rgba(0,212,255,0.15)',
        padding: '0 16px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: '62px', position: 'sticky', top: 0, zIndex: 100,
        gap: '8px', boxSizing: 'border-box', width: '100%', maxWidth: '100vw',
      }}>

        {/* LOGO */}
        <Link href="/" style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '19px',
          fontWeight: 900, letterSpacing: '-0.5px', color: '#FFFFFF',
          textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          Auto<span style={{ color: '#00D4FF' }}>Portal</span>360
        </Link>

        {/* DESKTOP: nav links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            {LINKS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                style={LINK_STYLE}
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
        )}

        {/* RIGHT: city pill + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button style={{
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
            color: '#00D4FF', fontSize: '12px', fontWeight: 500,
            padding: isMobile ? '5px 10px' : '5px 12px',
            borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
          }}>
            {isMobile ? '📍 City ▾' : '📍 Chandigarh ▾'}
          </button>

          {/* HAMBURGER — mobile only */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              style={{
                background: menuOpen ? 'rgba(0,212,255,0.12)' : 'transparent',
                border: '1px solid rgba(0,212,255,0.2)',
                color: '#FFFFFF', width: '38px', height: '38px',
                borderRadius: '8px', cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', lineHeight: 1,
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: '62px', left: 0, right: 0,
          background: 'rgba(6,20,45,0.98)',
          borderBottom: '1px solid rgba(0,212,255,0.15)',
          zIndex: 99, paddingBottom: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {LINKS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '14px 20px', color: '#C0C0C0',
                textDecoration: 'none', fontSize: '15px', fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif',
                borderBottom: i < LINKS.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#00D4FF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#C0C0C0')}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
