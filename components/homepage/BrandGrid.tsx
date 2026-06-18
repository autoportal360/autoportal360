'use client'

import { useState } from 'react'
import Link from 'next/link'

type BrandItem = { initials: string; name: string; href: string }

const ALL_BRANDS: BrandItem[] = [
  { initials: 'MS', name: 'Maruti Suzuki', href: '/maruti-suzuki-cars/'  },
  { initials: 'HY', name: 'Hyundai',       href: '/hyundai-cars/'        },
  { initials: 'TA', name: 'Tata',          href: '/tata-cars/'           },
  { initials: 'MA', name: 'Mahindra',      href: '/mahindra-cars/'       },
  { initials: 'KI', name: 'Kia',           href: '/kia-cars/'            },
  { initials: 'TY', name: 'Toyota',        href: '/toyota-cars/'         },
  { initials: 'HO', name: 'Honda',         href: '/honda-cars/'          },
  { initials: 'MG', name: 'MG',            href: '/mg-cars/'             },
  { initials: 'SK', name: 'Skoda',         href: '/skoda-cars/'          },
  { initials: 'VW', name: 'Volkswagen',    href: '/volkswagen-cars/'     },
  { initials: 'RE', name: 'Renault',       href: '/renault-cars/'        },
  { initials: 'JP', name: 'Jeep',          href: '/jeep-cars/'           },
]

export default function BrandGrid() {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? ALL_BRANDS : ALL_BRANDS.slice(0, 6)

  return (
    <section style={{ padding: '2.5rem 1.5rem', background: '#0A1F44', borderBottom: '1px solid #1e3a6e' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="ap-section-header">
          <div className="ap-section-title">Popular car brands</div>
          <Link href="/new-cars/" className="ap-section-link">All brands →</Link>
        </div>

        <div className="ap-brand-grid">
          {visible.map(b => (
            <Link key={b.href} href={b.href} className="ap-brand-card">
              <div className="ap-brand-logo">{b.initials}</div>
              <div className="ap-brand-name">{b.name}</div>
            </Link>
          ))}
        </div>

        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            style={{
              display: 'block', width: '100%', marginTop: '.75rem',
              padding: '.625rem', background: 'transparent',
              border: '1px solid #1e3a6e', borderRadius: '.75rem',
              color: '#00D4FF', fontSize: '.875rem', cursor: 'pointer',
              transition: 'border-color .15s',
            }}
          >
            View all 60+ brands →
          </button>
        )}
      </div>
    </section>
  )
}
