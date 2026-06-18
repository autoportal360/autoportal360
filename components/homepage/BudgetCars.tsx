'use client'

import { useState } from 'react'
import Link from 'next/link'

type BudgetCar = { brand: string; model: string; price: string; type: string; slug: string }
type BudgetTab = 'under5' | '5to10' | '10to15' | '15to20' | 'above20'

const DATA: Record<BudgetTab, BudgetCar[]> = {
  under5: [
    { brand: 'Maruti Suzuki', model: 'Alto K10',   price: '₹3.99 – ₹5.96 Lakh',  type: 'Hatchback',  slug: '/maruti-suzuki-cars/alto-k10/'    },
    { brand: 'Maruti Suzuki', model: 'S-Presso',   price: '₹4.26 – ₹6.11 Lakh',  type: 'Micro SUV',  slug: '/maruti-suzuki-cars/s-presso/'    },
    { brand: 'Renault',       model: 'Kwid',       price: '₹4.70 – ₹6.45 Lakh',  type: 'Hatchback',  slug: '/renault-cars/kwid/'              },
    { brand: 'Tata',          model: 'Tiago (Base)',price: '₹5.60 – ₹8.49 Lakh', type: 'Hatchback',  slug: '/tata-cars/tiago/'                },
  ],
  '5to10': [
    { brand: 'Maruti Suzuki', model: 'Swift',      price: '₹6.49 – ₹9.64 Lakh',  type: 'Hatchback',  slug: '/maruti-suzuki-cars/swift/'       },
    { brand: 'Tata',          model: 'Punch',      price: '₹6.13 – ₹10.25 Lakh', type: 'Micro SUV',  slug: '/tata-cars/punch/'                },
    { brand: 'Maruti Suzuki', model: 'Baleno',     price: '₹6.64 – ₹9.88 Lakh',  type: 'Hatchback',  slug: '/maruti-suzuki-cars/baleno/'      },
    { brand: 'Maruti Suzuki', model: 'WagonR',     price: '₹5.54 – ₹7.44 Lakh',  type: 'Hatchback',  slug: '/maruti-suzuki-cars/wagonr/'      },
  ],
  '10to15': [
    { brand: 'Tata',          model: 'Nexon',      price: '₹8.10 – ₹14.75 Lakh', type: 'Compact SUV',slug: '/tata-cars/nexon/'                },
    { brand: 'Hyundai',       model: 'Venue',      price: '₹7.94 – ₹13.63 Lakh', type: 'Compact SUV',slug: '/hyundai-cars/venue/'             },
    { brand: 'Kia',           model: 'Sonet',      price: '₹7.99 – ₹15.69 Lakh', type: 'Compact SUV',slug: '/kia-cars/sonet/'                 },
    { brand: 'Maruti Suzuki', model: 'Brezza',     price: '₹8.34 – ₹14.14 Lakh', type: 'Compact SUV',slug: '/maruti-suzuki-cars/brezza/'      },
  ],
  '15to20': [
    { brand: 'Hyundai',       model: 'Creta',      price: '₹11.00 – ₹20.15 Lakh',type: 'SUV',        slug: '/hyundai-cars/creta/'             },
    { brand: 'Kia',           model: 'Seltos',     price: '₹10.89 – ₹20.35 Lakh',type: 'SUV',        slug: '/kia-cars/seltos/'                },
    { brand: 'Tata',          model: 'Harrier',    price: '₹15.49 – ₹26.44 Lakh',type: 'SUV',        slug: '/tata-cars/harrier/'              },
    { brand: 'MG',            model: 'Hector',     price: '₹14.73 – ₹22.40 Lakh',type: 'SUV',        slug: '/mg-cars/hector/'                 },
  ],
  above20: [
    { brand: 'Mahindra',      model: 'Scorpio N',  price: '₹13.99 – ₹24.54 Lakh',type: 'SUV',        slug: '/mahindra-cars/scorpio-n/'        },
    { brand: 'Toyota',        model: 'Fortuner',   price: '₹33.43 – ₹51.44 Lakh',type: 'SUV',        slug: '/toyota-cars/fortuner/'           },
    { brand: 'Mahindra',      model: 'XUV700',     price: '₹13.99 – ₹26.99 Lakh',type: 'SUV',        slug: '/mahindra-cars/xuv700/'           },
    { brand: 'Tata',          model: 'Safari',     price: '₹16.19 – ₹27.34 Lakh',type: 'SUV',        slug: '/tata-cars/safari/'               },
  ],
}

const TABS: { key: BudgetTab; label: string }[] = [
  { key: 'under5',  label: 'Under ₹5L'   },
  { key: '5to10',   label: '₹5 – 10L'    },
  { key: '10to15',  label: '₹10 – 15L'   },
  { key: '15to20',  label: '₹15 – 20L'   },
  { key: 'above20', label: '₹20L+'        },
]

export default function BudgetCars() {
  const [active, setActive] = useState<BudgetTab>('5to10')

  return (
    <section style={{ padding: '2.5rem 1.5rem', background: '#0A1F44', borderBottom: '1px solid #1e3a6e' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="ap-section-header">
          <div>
            <div className="ap-section-title">Cars by budget</div>
            <div className="ap-section-subtitle">Find your price range</div>
          </div>
          <Link href="/pages/popular-cars-in-india/" className="ap-section-link">View all →</Link>
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

        <div className="ap-car-grid-4">
          {DATA[active].map(car => (
            <Link key={car.slug} href={car.slug} className="ap-car-card">
              <div className="ap-car-card-img">🚗</div>
              <div className="ap-car-card-brand">{car.brand}</div>
              <div className="ap-car-card-name">{car.model}</div>
              <div className="ap-car-card-price">{car.price}</div>
              <div className="ap-car-card-meta">
                <span className="ap-car-card-pill">{car.type}</span>
              </div>
              <span className="ap-car-card-link">View Details →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
