'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ModelItem = { label: string; brand: string; modelSlug: string }

const MODELS: ModelItem[] = [
  { label: 'Tata Nexon',        brand: 'tata',           modelSlug: 'nexon'    },
  { label: 'Maruti Swift',      brand: 'maruti-suzuki',  modelSlug: 'swift'    },
  { label: 'Hyundai Creta',     brand: 'hyundai',        modelSlug: 'creta'    },
  { label: 'Tata Punch',        brand: 'tata',           modelSlug: 'punch'    },
  { label: 'Kia Seltos',        brand: 'kia',            modelSlug: 'seltos'   },
  { label: 'Hyundai Venue',     brand: 'hyundai',        modelSlug: 'venue'    },
  { label: 'Maruti WagonR',     brand: 'maruti-suzuki',  modelSlug: 'wagonr'   },
  { label: 'Maruti Baleno',     brand: 'maruti-suzuki',  modelSlug: 'baleno'   },
  { label: 'Tata Tiago',        brand: 'tata',           modelSlug: 'tiago'    },
  { label: 'Tata Harrier',      brand: 'tata',           modelSlug: 'harrier'  },
]

const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Chandigarh']

export default function OnRoadCalc() {
  const router = useRouter()
  const [model, setModel] = useState('')
  const [city,  setCity]  = useState('')

  function handleCheck() {
    const selected = MODELS.find(m => m.modelSlug === model)
    if (!selected) return
    const cityParam = city ? `?city=${city.toLowerCase()}` : ''
    router.push(`/${selected.brand}-cars/${selected.modelSlug}/price/${cityParam}`)
  }

  return (
    <section style={{ padding: '2.5rem 1.5rem', background: '#0A1F44', borderBottom: '1px solid #1e3a6e' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div className="ap-onroad-calc">
          <div className="ap-section-title">Check on-road price</div>
          <div className="ap-section-subtitle" style={{ marginTop: '.25rem' }}>
            Get ex-showroom + RTO + insurance cost in your city
          </div>

          <div className="ap-onroad-fields">
            <select
              className="ap-search-field"
              value={model}
              onChange={e => setModel(e.target.value)}
            >
              <option value="">Select car model</option>
              {MODELS.map(m => (
                <option key={m.modelSlug} value={m.modelSlug}>{m.label}</option>
              ))}
            </select>

            <select
              className="ap-search-field"
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              <option value="">Select city</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <button
              className="ap-search-btn"
              onClick={handleCheck}
              disabled={!model}
            >
              Check Price →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
