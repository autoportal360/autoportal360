'use client'

import { useState } from 'react'
import Link from 'next/link'

type VehicleCard = { name: string; price: string; brand: string; slug: string }
type BrandItem   = { label: string; slug: string }

const BIKE_BRANDS: BrandItem[] = [
  { label: 'Royal Enfield', slug: 'royal-enfield' },
  { label: 'Bajaj',         slug: 'bajaj'         },
  { label: 'Hero',          slug: 'hero'           },
  { label: 'Honda',         slug: 'honda'          },
  { label: 'TVS',           slug: 'tvs'            },
  { label: 'KTM',           slug: 'ktm'            },
  { label: 'Yamaha',        slug: 'yamaha'         },
  { label: 'Suzuki',        slug: 'suzuki'         },
]

const SCOOTER_BRANDS: BrandItem[] = [
  { label: 'Honda',        slug: 'honda'        },
  { label: 'TVS',          slug: 'tvs'          },
  { label: 'Yamaha',       slug: 'yamaha'       },
  { label: 'Suzuki',       slug: 'suzuki'       },
  { label: 'Ather',        slug: 'ather'        },
  { label: 'Ola Electric', slug: 'ola-electric' },
  { label: 'Hero',         slug: 'hero'         },
  { label: 'Bajaj',        slug: 'bajaj'        },
]

const POPULAR_BIKES: VehicleCard[] = [
  { name: 'Splendor Plus', brand: 'Hero',         price: '₹75,929 – ₹79,529', slug: '/hero-bikes/splendor-plus/'          },
  { name: 'Classic 350',   brand: 'Royal Enfield',price: '₹1.93 – ₹2.27 Lakh',slug: '/royal-enfield-bikes/classic-350/'   },
  { name: 'Pulsar NS200',  brand: 'Bajaj',        price: '₹1.52 – ₹1.62 Lakh',slug: '/bajaj-bikes/pulsar-ns200/'          },
  { name: 'Apache RTR 160',brand: 'TVS',          price: '₹1.19 – ₹1.27 Lakh',slug: '/tvs-bikes/apache-rtr-160/'          },
]

const POPULAR_SCOOTERS: VehicleCard[] = [
  { name: 'Activa 6G',  brand: 'Honda',       price: '₹74,536 – ₹80,282', slug: '/honda-scooters/activa-6g/'        },
  { name: 'Jupiter',    brand: 'TVS',         price: '₹78,009 – ₹95,022', slug: '/tvs-scooters/jupiter/'            },
  { name: 'Ola S1 Pro', brand: 'Ola Electric',price: '₹1.30 – ₹1.52 Lakh',slug: '/ola-electric-scooters/s1-pro/'   },
  { name: 'Ather 450X', brand: 'Ather',       price: '₹1.43 – ₹1.53 Lakh',slug: '/ather-scooters/450x/'            },
]

type Tab = 'bikes' | 'scooters'

export default function TwoWheelerHub() {
  const [tab, setTab] = useState<Tab>('bikes')

  const brands  = tab === 'bikes' ? BIKE_BRANDS    : SCOOTER_BRANDS
  const models  = tab === 'bikes' ? POPULAR_BIKES  : POPULAR_SCOOTERS
  const viewAll = tab === 'bikes' ? '/new-bikes/'  : '/new-scooters/'
  const icon    = tab === 'bikes' ? '🏍️'          : '🛵'

  return (
    <section style={{ padding: '2.5rem 1.5rem', background: '#0A1F44', borderBottom: '1px solid #1e3a6e' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="ap-section-header">
          <div className="ap-section-title">Two-wheelers</div>
          <Link href={viewAll} className="ap-section-link">View all {icon} →</Link>
        </div>

        <div className="ap-tabs">
          <button onClick={() => setTab('bikes')}    className={`ap-tab-btn${tab === 'bikes'    ? ' active' : ''}`}>🏍️ Bikes</button>
          <button onClick={() => setTab('scooters')} className={`ap-tab-btn${tab === 'scooters' ? ' active' : ''}`}>🛵 Scooters</button>
        </div>

        {/* Brand scroll row */}
        <div className="ap-twowheeler-brands">
          {brands.map(b => (
            <Link
              key={b.slug}
              href={`/${b.slug}-${tab}/`}
              className="ap-tab-btn"
              style={{ flexShrink: 0 }}
            >
              {b.label}
            </Link>
          ))}
        </div>

        {/* Popular models */}
        <div className="ap-car-grid-4">
          {models.map(m => (
            <Link key={m.slug} href={m.slug} className="ap-car-card">
              <div className="ap-car-card-img">{icon}</div>
              <div className="ap-car-card-brand">{m.brand}</div>
              <div className="ap-car-card-name">{m.name}</div>
              <div className="ap-car-card-price">{m.price}</div>
              <span className="ap-car-card-link">View Details →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
