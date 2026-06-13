'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type BrandOption = { id: string; name: string; slug: string }

export default function HomeSearchBar({ brands }: { brands: BrandOption[] }) {
  const router   = useRouter()
  const [brand, setBrand] = useState('')

  function handleSearch() {
    if (brand) router.push(`/${brand}-cars/`)
    else       router.push('/new-cars/')
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <select
        value={brand}
        onChange={e => setBrand(e.target.value)}
        style={{
          flex: 1, minWidth: '140px',
          background: '#06142D', border: '1px solid rgba(0,212,255,0.15)',
          color: brand ? '#FFFFFF' : '#C0C0C0',
          fontSize: '13px', padding: '10px 14px',
          borderRadius: '8px', fontFamily: 'Inter, sans-serif', outline: 'none',
        }}
      >
        <option value="">Select Car Brand</option>
        {brands.map(b => {
          const clean = b.slug.replace(/-bike$/, '').replace(/-scooter$/, '')
          return <option key={b.id} value={clean}>{b.name}</option>
        })}
      </select>

      <select style={{
        flex: 1, minWidth: '140px',
        background: '#06142D', border: '1px solid rgba(0,212,255,0.15)',
        color: '#C0C0C0', fontSize: '13px', padding: '10px 14px',
        borderRadius: '8px', fontFamily: 'Inter, sans-serif', outline: 'none',
      }}>
        <option>Select City</option>
        <option>Chandigarh</option>
        <option>Delhi</option>
        <option>Mumbai</option>
        <option>Bengaluru</option>
        <option>Hyderabad</option>
      </select>

      <button
        onClick={handleSearch}
        style={{
          background: '#00D4FF', color: '#06142D', fontWeight: 900,
          fontSize: '13px', padding: '10px 22px', borderRadius: '8px',
          border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        Search →
      </button>
    </div>
  )
}
