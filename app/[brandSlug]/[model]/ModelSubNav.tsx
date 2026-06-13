'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const ANCHOR_IDS = ['overview', 'variants', 'mileage', 'faqs'] as const

export default function ModelSubNav({
  brandSlug,
  modelSlug,
}: {
  brandSlug: string
  modelSlug: string
}) {
  const [active, setActive] = useState('overview')
  const pathname = usePathname()
  const base = `/${brandSlug}/${modelSlug}`

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    ANCHOR_IDS.forEach(id => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const tabs = [
    { label: 'Overview', key: 'overview', href: '#overview',         external: false },
    { label: 'Price',    key: 'price',    href: `${base}/price/`,    external: true  },
    { label: 'Specs',   key: 'specs',    href: `${base}/specs/`,    external: true  },
    { label: 'Variants', key: 'variants', href: '#variants',         external: false },
    { label: 'Mileage',  key: 'mileage',  href: '#mileage',          external: false },
    { label: 'Images',   key: 'images',   href: `${base}/images/`,   external: true  },
    { label: 'Colours',  key: 'colours',  href: `${base}/colours/`,  external: true  },
    { label: 'FAQs',     key: 'faqs',     href: '#faqs',             external: false },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: '#06142D',
      borderBottom: '1px solid rgba(0,212,255,0.15)',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{ display: 'flex', minWidth: 'max-content' }}>
        {tabs.map(tab => {
          // External sub-pages use pathname; anchors use IntersectionObserver state
          const isActive = tab.external
            ? pathname.startsWith(`${base}/${tab.key}`)
            : active === tab.key
          return (
            <Link
              key={tab.key}
              href={tab.href}
              onClick={!tab.external ? () => setActive(tab.key) : undefined}
              style={{
                display: 'block',
                padding: '14px 18px',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
                color: isActive ? '#00D4FF' : '#8E99A8',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderBottom: isActive ? '2px solid #00D4FF' : '2px solid transparent',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
