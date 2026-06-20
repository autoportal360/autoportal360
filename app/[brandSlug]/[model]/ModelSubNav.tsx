'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Overview', key: 'overview', path: '',           type: 'page'   },
  { label: 'Price',    key: 'price',    path: '/price',     type: 'page'   },
  { label: 'Specs',    key: 'specs',    path: '/specs',     type: 'page'   },
  { label: 'Variants', key: 'variants', path: '/#variants', type: 'scroll' },
  { label: 'Mileage',  key: 'mileage',  path: '/#mileage',  type: 'scroll' },
  { label: 'Images',   key: 'images',   path: '/images',    type: 'page'   },
  { label: 'Colours',  key: 'colours',  path: '/colours',   type: 'page'   },
  { label: 'FAQs',     key: 'faqs',     path: '/#faqs',     type: 'scroll' },
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
          const href = tab.type === 'scroll'
            ? `${base}${tab.path}`   // /tata-cars/tiago/#variants — no trailing slash
            : `${base}${tab.path}/`  // /tata-cars/tiago/price/

          const isActive = tab.type === 'scroll'
            ? false
            : tab.path === ''
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
