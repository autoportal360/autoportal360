'use client'

import { useState } from 'react'
import Link from 'next/link'

type CarItem = {
  brand: string
  model: string
  price: string
  fuel: string
  type: string
  slug: string
  tag: string
}

const POPULAR: CarItem[] = [
  { brand: 'Tata',          model: 'Nexon',      price: '₹8.10 – ₹14.75 Lakh', fuel: 'Petrol/Diesel', type: 'Compact SUV', slug: '/tata-cars/nexon/',        tag: 'Best Seller'    },
  { brand: 'Hyundai',       model: 'Creta',      price: '₹11.00 – ₹20.15 Lakh',fuel: 'Petrol/Diesel', type: 'SUV',         slug: '/hyundai-cars/creta/',     tag: 'Feature Rich'   },
  { brand: 'Maruti Suzuki', model: 'Swift',      price: '₹6.49 – ₹9.64 Lakh',  fuel: 'Petrol',        type: 'Hatchback',   slug: '/maruti-suzuki-cars/swift/',tag: ''              },
  { brand: 'Tata',          model: 'Punch',      price: '₹6.13 – ₹10.25 Lakh', fuel: 'Petrol',        type: 'Micro SUV',   slug: '/tata-cars/punch/',        tag: 'Value King'     },
  { brand: 'Kia',           model: 'Seltos',     price: '₹10.89 – ₹20.35 Lakh',fuel: 'Petrol/Diesel', type: 'SUV',         slug: '/kia-cars/seltos/',        tag: ''               },
  { brand: 'Mahindra',      model: 'Scorpio N',  price: '₹13.99 – ₹24.54 Lakh',fuel: 'Diesel',        type: 'SUV',         slug: '/mahindra-cars/scorpio-n/',tag: ''               },
]

const LATEST: CarItem[] = [
  { brand: 'Tata',          model: 'Curvv',        price: '₹10 – ₹18 Lakh',      fuel: 'Petrol/Diesel',   type: 'SUV Coupe',   slug: '/tata-cars/curvv/',             tag: 'All New'    },
  { brand: 'Maruti Suzuki', model: 'Swift 2024',   price: '₹6.49 – ₹9.64 Lakh',  fuel: 'Petrol/CNG',      type: 'Hatchback',   slug: '/maruti-suzuki-cars/swift/',    tag: 'New Gen'    },
  { brand: 'Hyundai',       model: 'Creta 2024',   price: '₹11 – ₹20.15 Lakh',   fuel: 'Petrol/Diesel/EV',type: 'SUV',         slug: '/hyundai-cars/creta/',          tag: 'Facelift'   },
  { brand: 'Kia',           model: 'Syros',        price: '₹9 – ₹15 Lakh',       fuel: 'Petrol/Diesel',   type: 'Compact SUV', slug: '/kia-cars/syros/',              tag: 'All New'    },
  { brand: 'Mahindra',      model: 'XUV 3XO',      price: '₹7.49 – ₹15.49 Lakh', fuel: 'Petrol/Diesel',   type: 'Compact SUV', slug: '/mahindra-cars/xuv-3xo/',       tag: 'Refreshed'  },
  { brand: 'Skoda',         model: 'Kylaq',        price: '₹7.89 – ₹14.49 Lakh', fuel: 'Petrol',          type: 'Compact SUV', slug: '/skoda-cars/kylaq/',            tag: 'New Entry'  },
]

const UPCOMING: CarItem[] = [
  { brand: 'Mahindra',      model: 'BE 6',         price: '₹18.90 – ₹26.90 Lakh',fuel: 'Electric',        type: 'Electric SUV',slug: '/mahindra-cars/be-6/',          tag: 'Q1 2026'    },
  { brand: 'Hyundai',       model: 'Creta EV',     price: '₹17 – ₹22 Lakh',      fuel: 'Electric',        type: 'Electric SUV',slug: '/hyundai-cars/creta-ev/',       tag: '2026'       },
  { brand: 'Maruti Suzuki', model: 'eVX',          price: '₹15 – ₹20 Lakh',      fuel: 'Electric',        type: 'Electric SUV',slug: '/maruti-suzuki-cars/evx/',      tag: 'Late 2026'  },
  { brand: 'Tata',          model: 'Sierra',       price: '₹12 – ₹18 Lakh',      fuel: 'Diesel',          type: 'SUV',         slug: '/tata-cars/sierra/',            tag: '2026'       },
  { brand: 'Kia',           model: 'EV6 Facelift', price: '₹60 – ₹66 Lakh',      fuel: 'Electric',        type: 'Electric SUV',slug: '/kia-cars/ev6/',                tag: '2026'       },
  { brand: 'Toyota',        model: 'Camry Hybrid', price: '₹48 – ₹52 Lakh',      fuel: 'Hybrid',          type: 'Sedan',       slug: '/toyota-cars/camry/',           tag: '2026'       },
]

const ELECTRIC: CarItem[] = [
  { brand: 'Tata',    model: 'Nexon EV',   price: '₹14.49 – ₹19.29 Lakh',fuel: 'Electric',type: 'Compact SUV',slug: '/tata-cars/nexon-ev/',   tag: 'Most Popular EV' },
  { brand: 'Tata',    model: 'Punch EV',   price: '₹10.99 – ₹14.29 Lakh',fuel: 'Electric',type: 'Micro SUV',  slug: '/tata-cars/punch-ev/',   tag: 'Affordable'      },
  { brand: 'Mahindra',model: 'XUV400',     price: '₹15.49 – ₹19.19 Lakh',fuel: 'Electric',type: 'SUV',        slug: '/mahindra-cars/xuv400/', tag: 'Long Range'      },
  { brand: 'MG',      model: 'ZS EV',      price: '₹18.98 – ₹25.20 Lakh',fuel: 'Electric',type: 'SUV',        slug: '/mg-cars/zs-ev/',        tag: ''                },
  { brand: 'Tata',    model: 'Tiago EV',   price: '₹8.49 – ₹11.79 Lakh', fuel: 'Electric',type: 'Hatchback',  slug: '/tata-cars/tiago-ev/',   tag: 'Budget EV'       },
  { brand: 'Kia',     model: 'EV6',        price: '₹60.99 – ₹65.99 Lakh',fuel: 'Electric',type: 'Electric SUV',slug: '/kia-cars/ev6/',         tag: 'Luxury EV'       },
]

type TabKey = 'popular' | 'latest' | 'upcoming' | 'electric'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'popular',  label: 'Popular'  },
  { key: 'latest',   label: 'Latest'   },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'electric', label: '⚡ Electric' },
]

const DATA: Record<TabKey, CarItem[]> = {
  popular: POPULAR,
  latest: LATEST,
  upcoming: UPCOMING,
  electric: ELECTRIC,
}

function CarCard({ item }: { item: CarItem }) {
  return (
    <Link href={item.slug} className="ap-car-card">
      {item.tag && <span className="ap-car-card-tag">{item.tag}</span>}
      <div className="ap-car-card-img">🚗</div>
      <div className="ap-car-card-brand">{item.brand}</div>
      <div className="ap-car-card-name">{item.model}</div>
      <div className="ap-car-card-price">{item.price}</div>
      <div className="ap-car-card-meta">
        <span className="ap-car-card-pill">{item.fuel}</span>
        <span className="ap-car-card-pill">{item.type}</span>
      </div>
      <span className="ap-car-card-link">View Details →</span>
    </Link>
  )
}

export default function PopularCars() {
  const [active, setActive] = useState<TabKey>('popular')

  return (
    <section className="ap-section" style={{ padding: '2.5rem 1.5rem', borderBottom: '1px solid #1e3a6e' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="ap-section-header">
          <div>
            <div className="ap-section-title">Most popular cars in India</div>
            <div className="ap-section-subtitle">Browse by category</div>
          </div>
          <Link href="/new-cars/" className="ap-section-link">View all →</Link>
        </div>

        <div className="ap-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`ap-tab-btn${active === t.key ? ' active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ap-car-grid-3">
          {DATA[active].map(item => <CarCard key={item.slug} item={item} />)}
        </div>
      </div>
    </section>
  )
}
