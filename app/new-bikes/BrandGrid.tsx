'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Brand } from '@/types'
import { formatPriceRange } from '@/lib/utils'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function BrandGrid({ brands }: { brands: Brand[] }) {
  const [active, setActive] = useState('ALL')

  const available = new Set(brands.map(b => b.name[0].toUpperCase()))
  const filtered = active === 'ALL'
    ? brands
    : brands.filter(b => b.name.toUpperCase().startsWith(active))

  return (
    <div>
      {/* Alpha filter row */}
      <div style={{
        display: 'flex', gap: '4px', flexWrap: 'wrap',
        padding: '14px 0 18px', borderBottom: '1px solid rgba(0,212,255,0.1)',
        marginBottom: '24px',
      }}>
        <button
          onClick={() => setActive('ALL')}
          style={{
            background: active === 'ALL' ? '#00D4FF' : 'transparent',
            color: active === 'ALL' ? '#06142D' : '#8E99A8',
            border: active === 'ALL' ? 'none' : '1px solid rgba(0,212,255,0.12)',
            borderRadius: '6px', padding: '5px 12px',
            fontSize: '11px', fontWeight: 800, cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >All</button>
        {ALPHABET.map(letter => {
          const has = available.has(letter)
          const isActive = active === letter
          return (
            <button
              key={letter}
              onClick={() => has && setActive(letter)}
              style={{
                background: isActive ? '#00D4FF' : 'transparent',
                color: isActive ? '#06142D' : has ? '#C0C0C0' : '#2a3a4a',
                border: isActive ? 'none' : `1px solid ${has ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.04)'}`,
                borderRadius: '6px', padding: '5px 9px',
                fontSize: '11px', fontWeight: 700,
                cursor: has ? 'pointer' : 'default',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >{letter}</button>
          )
        })}
      </div>

      {/* Brand count */}
      <div style={{ fontSize: '12px', color: '#8E99A8', marginBottom: '16px' }}>
        Showing <span style={{ color: '#00D4FF', fontWeight: 700 }}>{filtered.length}</span> of {brands.length} brands
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          color: '#8E99A8', fontSize: '14px',
          background: '#111111', borderRadius: '14px',
          border: '1px solid rgba(0,212,255,0.08)',
        }}>
          No bike brands starting with &ldquo;{active}&rdquo;
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
        }}>
          {filtered.map(brand => <BrandCard key={brand.id} brand={brand} />)}
        </div>
      )}
    </div>
  )
}

function BrandCard({ brand }: { brand: Brand }) {
  const cleanSlug = brand.slug.replace(/-bike$/, '')
  return (
    <Link
      href={`/${cleanSlug}-bikes/`}
      style={{
        background: '#111111',
        border: '1px solid rgba(0,212,255,0.12)',
        borderRadius: '14px',
        padding: '20px 10px 14px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '8px',
        textDecoration: 'none',
      }}
    >
      <div style={{
        width: '52px', height: '52px', borderRadius: '12px',
        background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Montserrat, sans-serif', fontSize: '16px',
        fontWeight: 900, color: '#00D4FF',
      }}>
        {brand.name.slice(0, 2).toUpperCase()}
      </div>
      <div style={{
        fontSize: '13px', fontWeight: 700, color: '#C0C0C0',
        textAlign: 'center', lineHeight: 1.3,
        fontFamily: 'Montserrat, sans-serif',
      }}>
        {brand.name}
      </div>
      {brand.price_min && brand.price_max && (
        <div style={{
          fontSize: '11px', color: '#00D4FF', fontWeight: 600,
          fontFamily: 'Montserrat, sans-serif', textAlign: 'center',
        }}>
          {formatPriceRange(brand.price_min, brand.price_max)}
        </div>
      )}
      {brand.country && (
        <div style={{ fontSize: '10px', color: '#8E99A8' }}>{brand.country}</div>
      )}
    </Link>
  )
}
