'use client'

import { useMemo, useState } from 'react'
import { calculateOnRoad, formatPrice } from '@/lib/utils'

export type PriceVariant = {
  id: string
  name: string
  ex_showroom_price: number
  fuel_type: string | null
  is_popular: boolean
}

export type PriceCity = {
  id: string
  name: string
  slug: string
  states: { name: string; rto_percentage: number; handling_charge: number } | null
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,212,255,0.06)',
  border: '1px solid rgba(0,212,255,0.2)',
  borderRadius: '10px',
  color: '#FFFFFF',
  padding: '11px 14px',
  fontSize: '14px',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 600,
  outline: 'none',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#8E99A8',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  marginBottom: '7px',
}

function BreakdownRow({
  label, sublabel, value, highlight,
}: {
  label: string
  sublabel?: string
  value: string
  highlight?: boolean
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: highlight ? '14px 20px' : '11px 20px',
      background: highlight ? 'rgba(0,212,255,0.06)' : 'transparent',
      borderTop: '1px solid rgba(0,212,255,0.07)',
    }}>
      <div>
        <span style={{ fontSize: highlight ? '14px' : '13px', color: highlight ? '#FFFFFF' : '#8E99A8', fontWeight: highlight ? 800 : 400, fontFamily: highlight ? 'Montserrat, sans-serif' : 'inherit' }}>
          {label}
        </span>
        {sublabel && (
          <span style={{ fontSize: '11px', color: '#8E99A8', marginLeft: '6px' }}>
            {sublabel}
          </span>
        )}
      </div>
      <span style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: highlight ? '20px' : '13px',
        fontWeight: 800,
        color: highlight ? '#00D4FF' : '#FFFFFF',
      }}>
        {value}
      </span>
    </div>
  )
}

export default function PriceCalculator({
  variants,
  cities,
}: {
  variants: PriceVariant[]
  cities: PriceCity[]
}) {
  const defaultVariant = variants.find(v => v.is_popular) ?? variants[0]
  const [variantId, setVariantId] = useState(defaultVariant?.id ?? '')
  const [cityId, setCityId]       = useState(cities[0]?.id ?? '')

  const variant = variants.find(v => v.id === variantId) ?? null
  const city    = cities.find(c => c.id === cityId) ?? null

  const onRoad = useMemo(() => {
    if (!variant || !city?.states) return null
    return calculateOnRoad(
      variant.ex_showroom_price,
      city.states.rto_percentage,
      city.states.handling_charge,
    )
  }, [variant, city])

  return (
    <div style={{
      background: '#0A1F44',
      border: '1px solid rgba(0,212,255,0.15)',
      borderRadius: '20px',
      overflow: 'hidden',
      marginBottom: '40px',
    }}>
      {/* Selectors */}
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,212,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Variant</label>
          <select value={variantId} onChange={e => setVariantId(e.target.value)} style={selectStyle}>
            {variants.map(v => (
              <option key={v.id} value={v.id} style={{ background: '#06142D' }}>
                {v.name}{v.is_popular ? ' ★' : ''}
              </option>
            ))}
          </select>
          {variant && (
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#00D4FF', fontWeight: 700 }}>
              Ex-showroom: {formatPrice(variant.ex_showroom_price)}
            </div>
          )}
        </div>
        <div>
          <label style={labelStyle}>City</label>
          <select value={cityId} onChange={e => setCityId(e.target.value)} style={selectStyle}>
            {cities.map(c => (
              <option key={c.id} value={c.id} style={{ background: '#06142D' }}>{c.name}</option>
            ))}
          </select>
          {city?.states && (
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#8E99A8' }}>
              {city.states.name} · RTO: {city.states.rto_percentage}%
            </div>
          )}
        </div>
      </div>

      {/* Breakdown */}
      {onRoad ? (
        <div>
          <BreakdownRow label="Ex-showroom Price"    value={formatPrice(onRoad.ex_showroom)} />
          <BreakdownRow
            label="RTO Registration"
            sublabel={city?.states ? `(${city.states.rto_percentage}%)` : undefined}
            value={formatPrice(onRoad.rto)}
          />
          <BreakdownRow label="Insurance"            sublabel="(~3.5%)" value={formatPrice(onRoad.insurance)} />
          {onRoad.tcs > 0 && (
            <BreakdownRow label="TCS"                sublabel="(1% above ₹10L)" value={formatPrice(onRoad.tcs)} />
          )}
          <BreakdownRow label="Handling Charges"     value={formatPrice(onRoad.handling)} />
          <BreakdownRow label="FastTag"              value={formatPrice(onRoad.fastag)} />
          <BreakdownRow label="Total On-Road Price"  value={formatPrice(onRoad.total)} highlight />
        </div>
      ) : (
        <div style={{ padding: '32px', textAlign: 'center', color: '#8E99A8', fontSize: '14px' }}>
          Select a variant and city to see the on-road price
        </div>
      )}
    </div>
  )
}
