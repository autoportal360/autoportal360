'use client'

import { useState } from 'react'
import Link from 'next/link'

type FuelCar = { brand: string; model: string; price: string; slug: string; tag: string }

const DATA: Record<string, FuelCar[]> = {
  electric: [
    { brand: 'Tata',     model: 'Nexon EV',            price: '₹14.49 – ₹19.29 Lakh', slug: '/tata-cars/nexon-ev/',              tag: 'Most Popular EV' },
    { brand: 'Tata',     model: 'Punch EV',             price: '₹10.99 – ₹14.29 Lakh', slug: '/tata-cars/punch-ev/',              tag: 'Affordable EV'   },
    { brand: 'Mahindra', model: 'XUV400',               price: '₹15.49 – ₹19.19 Lakh', slug: '/mahindra-cars/xuv400/',            tag: 'Long Range'      },
    { brand: 'MG',       model: 'ZS EV',                price: '₹18.98 – ₹25.20 Lakh', slug: '/mg-cars/zs-ev/',                  tag: ''                },
  ],
  hybrid: [
    { brand: 'Toyota',        model: 'Urban Cruiser Hyryder', price: '₹11.14 – ₹19.99 Lakh', slug: '/toyota-cars/urban-cruiser-hyryder/', tag: 'Best Mileage'   },
    { brand: 'Maruti Suzuki', model: 'Grand Vitara',          price: '₹10.67 – ₹20.03 Lakh', slug: '/maruti-suzuki-cars/grand-vitara/',   tag: 'Popular Hybrid' },
    { brand: 'Honda',         model: 'City Hybrid',           price: '₹19.20 – ₹20.55 Lakh', slug: '/honda-cars/city/',                  tag: ''               },
    { brand: 'Toyota',        model: 'Innova Hycross',        price: '₹19.77 – ₹30.98 Lakh', slug: '/toyota-cars/innova-hycross/',       tag: ''               },
  ],
  cng: [
    { brand: 'Maruti Suzuki', model: 'WagonR CNG',        price: '₹5.95 – ₹7.62 Lakh', slug: '/maruti-suzuki-cars/wagonr/',       tag: 'Best Seller CNG' },
    { brand: 'Tata',          model: 'Tiago CNG',          price: '₹6.55 – ₹8.45 Lakh', slug: '/tata-cars/tiago/',                tag: ''                },
    { brand: 'Hyundai',       model: 'Grand i10 Nios CNG', price: '₹7.30 – ₹8.45 Lakh', slug: '/hyundai-cars/grand-i10-nios/',    tag: ''                },
    { brand: 'Maruti Suzuki', model: 'Swift CNG',          price: '₹8.20 – ₹9.64 Lakh', slug: '/maruti-suzuki-cars/swift/',       tag: 'New Launch'      },
  ],
  diesel: [
    { brand: 'Toyota',   model: 'Fortuner',  price: '₹32.99 – ₹50.99 Lakh', slug: '/toyota-cars/fortuner/',    tag: 'Best Diesel SUV' },
    { brand: 'Hyundai',  model: 'Creta',     price: '₹11.00 – ₹20.15 Lakh', slug: '/hyundai-cars/creta/',      tag: 'Most Popular'    },
    { brand: 'Mahindra', model: 'Scorpio N', price: '₹13.99 – ₹24.54 Lakh', slug: '/mahindra-cars/scorpio-n/', tag: ''                },
    { brand: 'Tata',     model: 'Harrier',   price: '₹15.49 – ₹26.44 Lakh', slug: '/tata-cars/harrier/',       tag: ''                },
  ],
}

const TABS = [
  { key: 'electric', label: '⚡ Electric' },
  { key: 'hybrid',   label: '🔋 Hybrid'  },
  { key: 'cng',      label: '🟢 CNG'     },
  { key: 'diesel',   label: '⛽ Diesel'  },
] as const

export default function FuelTypeCars() {
  const [active, setActive] = useState<keyof typeof DATA>('electric')
  const cars = DATA[active]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
            Cars by <span style={{ color: '#00D4FF' }}>Fuel Type</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#8E99A8', marginTop: '3px' }}>Find the right powertrain for your needs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="ap-tab-group" style={{ marginBottom: '20px' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`ap-tab${active === tab.key ? ' ap-tab-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '12px' }}>
        {cars.map(car => (
          <Link
            key={car.slug}
            href={car.slug}
            style={{
              background: '#111111', border: '1px solid rgba(0,212,255,0.12)',
              borderRadius: '14px', padding: '16px', display: 'block', textDecoration: 'none',
            }}
          >
            {car.tag && (
              <span style={{
                display: 'inline-block', fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                borderRadius: '20px', marginBottom: '10px', fontFamily: 'Montserrat, sans-serif',
                background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)',
              }}>
                {car.tag}
              </span>
            )}
            {!car.tag && <div style={{ height: '26px', marginBottom: '10px' }} />}
            <div style={{ fontSize: '10px', color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>
              {car.brand}
            </div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              {car.model}
            </div>
            <div style={{ fontSize: '13px', color: '#00D4FF', fontWeight: 700, marginBottom: '12px' }}>
              {car.price}
            </div>
            <div style={{ fontSize: '12px', color: '#00D4FF', fontWeight: 600 }}>View →</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
