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
    <nav className="ap-model-nav">
      <div className="ap-model-nav-inner">
        {TABS.map(tab => {
          const href = tab.type === 'scroll'
            ? `${base}${tab.path}`
            : `${base}${tab.path}/`

          const isActive = tab.type === 'scroll'
            ? false
            : tab.path === ''
              ? pathname === base || pathname === base + '/'
              : pathname.startsWith(`${base}${tab.path}`)

          return (
            <Link
              key={tab.key}
              href={href}
              className={`ap-model-nav-tab${isActive ? ' active' : ''}`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
