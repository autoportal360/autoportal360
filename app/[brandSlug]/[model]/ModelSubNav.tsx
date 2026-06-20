'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Overview', key: 'overview', path: ''         },
  { label: 'Price',    key: 'price',    path: '/price'   },
  { label: 'Specs',    key: 'specs',    path: '/specs'   },
  { label: 'Variants', key: 'variants', path: '/variants' },
  { label: 'Mileage',  key: 'mileage',  path: '/mileage' },
  { label: 'Images',   key: 'images',   path: '/images'  },
  { label: 'Colours',  key: 'colours',  path: '/colours' },
  { label: 'FAQs',     key: 'faqs',     path: '/faqs'    },
]

export default function ModelSubNav({
  brandSlug,
  modelSlug,
}: {
  brandSlug: string
  modelSlug: string
}) {
  const pathname = usePathname()
  const base = `/${brandSlug}/${modelSlug}`

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: '#06142D',
      borderBottom: '1px solid rgba(0,212,255,0.15)',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{ display: 'flex', minWidth: 'max-content' }}>
        {TABS.map(tab => {
          const href = `${base}${tab.path}/`
          const isActive = tab.path === ''
            ? pathname === base || pathname === base + '/'
            : pathname.startsWith(`${base}${tab.path}`)

          return (
            <Link
              key={tab.key}
              href={href}
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
