'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type BrandOption = { id: string; name: string; slug: string }
type Tab = 'cars' | 'bikes' | 'scooters' | 'compare'

const BIKE_BRANDS = [
  { label: 'Royal Enfield', slug: 'royal-enfield' },
  { label: 'Bajaj',         slug: 'bajaj'         },
  { label: 'Hero',          slug: 'hero'           },
  { label: 'Honda',         slug: 'honda'          },
  { label: 'TVS',           slug: 'tvs'            },
  { label: 'KTM',           slug: 'ktm'            },
  { label: 'Yamaha',        slug: 'yamaha'         },
  { label: 'Suzuki',        slug: 'suzuki'         },
]

const SCOOTER_BRANDS = [
  { label: 'Honda',        slug: 'honda'        },
  { label: 'TVS',          slug: 'tvs'          },
  { label: 'Yamaha',       slug: 'yamaha'       },
  { label: 'Suzuki',       slug: 'suzuki'       },
  { label: 'Ather',        slug: 'ather'        },
  { label: 'Ola Electric', slug: 'ola-electric' },
  { label: 'Hero',         slug: 'hero'         },
  { label: 'Bajaj',        slug: 'bajaj'        },
]

const COMPARE_MODELS = [
  { label: 'Tata Nexon',         slug: 'tata-nexon'           },
  { label: 'Hyundai Creta',      slug: 'hyundai-creta'        },
  { label: 'Maruti Swift',       slug: 'maruti-suzuki-swift'  },
  { label: 'Tata Punch',         slug: 'tata-punch'           },
  { label: 'Kia Seltos',         slug: 'kia-seltos'           },
  { label: 'Mahindra Thar',      slug: 'mahindra-thar'        },
  { label: 'Maruti Brezza',      slug: 'maruti-suzuki-brezza' },
  { label: 'Hyundai Venue',      slug: 'hyundai-venue'        },
  { label: 'Hyundai i20',        slug: 'hyundai-i20'          },
  { label: 'Toyota Fortuner',    slug: 'toyota-fortuner'      },
  { label: 'Mahindra Scorpio N', slug: 'mahindra-scorpio-n'   },
  { label: 'Tata Harrier',       slug: 'tata-harrier'         },
]

const TABS: { key: Tab; label: string }[] = [
  { key: 'cars',     label: '🚗 Cars'     },
  { key: 'bikes',    label: '🏍️ Bikes'   },
  { key: 'scooters', label: '🛵 Scooters' },
  { key: 'compare',  label: '⚡ Compare'  },
]

const selectBase: React.CSSProperties = {
  flex: 1, minWidth: '140px',
  background: '#06142D', border: '1px solid rgba(0,212,255,0.15)',
  color: '#C0C0C0', fontSize: '13px', padding: '10px 14px',
  borderRadius: '8px', fontFamily: 'Inter, sans-serif', outline: 'none',
}

export default function HomeSearchBar({ brands }: { brands: BrandOption[] }) {
  const router = useRouter()
  const [tab,          setTab]          = useState<Tab>('cars')
  const [carBrand,     setCarBrand]     = useState('')
  const [bikeBrand,    setBikeBrand]    = useState('')
  const [scooterBrand, setScooterBrand] = useState('')
  const [model1,       setModel1]       = useState('')
  const [model2,       setModel2]       = useState('')

  function handleSearch() {
    if (tab === 'cars')     router.push(carBrand     ? `/${carBrand}-cars/`     : '/new-cars/')
    if (tab === 'bikes')    router.push(bikeBrand    ? `/${bikeBrand}-bikes/`   : '/new-bikes/')
    if (tab === 'scooters') router.push(scooterBrand ? `/${scooterBrand}-scooters/` : '/new-scooters/')
    if (tab === 'compare')  router.push(model1 && model2 ? `/compare/${model1}-vs-${model2}/` : '/compare/')
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? '#00D4FF' : 'transparent',
              color:      tab === t.key ? '#06142D' : '#8E99A8',
              fontSize: '12px', fontWeight: 700, padding: '6px 14px',
              borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              border: tab === t.key ? 'none' : '1px solid rgba(0,212,255,0.1)',
              outline: 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

        {tab === 'cars' && <>
          <select
            value={carBrand}
            onChange={e => setCarBrand(e.target.value)}
            style={{ ...selectBase, color: carBrand ? '#FFFFFF' : '#C0C0C0' }}
          >
            <option value="">Select Car Brand</option>
            {brands.map(b => {
              const clean = b.slug.replace(/-bike$/, '').replace(/-scooter$/, '')
              return <option key={b.id} value={clean}>{b.name}</option>
            })}
          </select>
          <select style={selectBase}>
            <option>Select City</option>
            <option>Chandigarh</option>
            <option>Delhi</option>
            <option>Mumbai</option>
            <option>Bengaluru</option>
            <option>Hyderabad</option>
          </select>
        </>}

        {tab === 'bikes' && (
          <select
            value={bikeBrand}
            onChange={e => setBikeBrand(e.target.value)}
            style={{ ...selectBase, flex: 2, color: bikeBrand ? '#FFFFFF' : '#C0C0C0' }}
          >
            <option value="">Select Bike Brand</option>
            {BIKE_BRANDS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
          </select>
        )}

        {tab === 'scooters' && (
          <select
            value={scooterBrand}
            onChange={e => setScooterBrand(e.target.value)}
            style={{ ...selectBase, flex: 2, color: scooterBrand ? '#FFFFFF' : '#C0C0C0' }}
          >
            <option value="">Select Scooter Brand</option>
            {SCOOTER_BRANDS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
          </select>
        )}

        {tab === 'compare' && <>
          <select
            value={model1}
            onChange={e => setModel1(e.target.value)}
            style={{ ...selectBase, color: model1 ? '#FFFFFF' : '#C0C0C0' }}
          >
            <option value="">Select first car</option>
            {COMPARE_MODELS.map(m => <option key={m.slug} value={m.slug}>{m.label}</option>)}
          </select>
          <select
            value={model2}
            onChange={e => setModel2(e.target.value)}
            style={{ ...selectBase, color: model2 ? '#FFFFFF' : '#C0C0C0' }}
          >
            <option value="">Select second car</option>
            {COMPARE_MODELS.map(m => <option key={m.slug} value={m.slug}>{m.label}</option>)}
          </select>
        </>}

        <button
          onClick={handleSearch}
          style={{
            background: '#00D4FF', color: '#06142D', fontWeight: 900,
            fontSize: '13px', padding: '10px 22px', borderRadius: '8px',
            border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {tab === 'compare' ? 'Compare Now →' : 'Search →'}
        </button>
      </div>
    </div>
  )
}
