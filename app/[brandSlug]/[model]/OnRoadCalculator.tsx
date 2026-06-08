'use client'

import { useMemo, useState } from 'react'
import { calculateOnRoad, formatPrice } from '@/lib/utils'

export type CalcVariant = { id: string; name: string; ex_showroom_price: number }
export type CalcCity    = { id: string; name: string; states: { rto_percentage: number; handling_charge: number } | null }

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,212,255,0.06)',
  border: '1px solid rgba(0,212,255,0.2)',
  borderRadius: '8px',
  color: '#FFFFFF',
  padding: '9px 12px',
  fontSize: '13px',
  fontFamily: 'Montserrat, sans-serif',
  outline: 'none',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#8E99A8',
  fontWeight: 600,
  marginBottom: '6px',
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0',
      borderBottom: highlight ? 'none' : '1px solid rgba(0,212,255,0.06)',
    }}>
      <span style={{ fontSize: highlight ? '14px' : '13px', color: '#8E99A8', fontWeight: highlight ? 800 : 400, fontFamily: highlight ? 'Montserrat, sans-serif' : 'inherit' }}>
        {label}
      </span>
      <span style={{ fontSize: highlight ? '18px' : '13px', color: highlight ? '#00D4FF' : '#FFFFFF', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
        {value}
      </span>
    </div>
  )
}

export default function OnRoadCalculator({
  variants,
  cities,
}: {
  variants: CalcVariant[]
  cities: CalcCity[]
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? '')
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
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
    }}>
      <h3 style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '14px', fontWeight: 800,
        color: '#FFFFFF', margin: '0 0 16px',
      }}>
        On-Road <span style={{ color: '#00D4FF' }}>Price Calculator</span>
      </h3>

      <div style={{ marginBottom: '10px' }}>
        <label style={labelStyle}>Variant</label>
        <select value={variantId} onChange={e => setVariantId(e.target.value)} style={selectStyle}>
          {variants.map(v => (
            <option key={v.id} value={v.id} style={{ background: '#06142D' }}>{v.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>City</label>
        <select value={cityId} onChange={e => setCityId(e.target.value)} style={selectStyle}>
          {cities.map(c => (
            <option key={c.id} value={c.id} style={{ background: '#06142D' }}>{c.name}</option>
          ))}
        </select>
      </div>

      {onRoad ? (
        <div style={{ borderTop: '1px solid rgba(0,212,255,0.1)', paddingTop: '12px' }}>
          <Row label="Ex-showroom" value={formatPrice(onRoad.ex_showroom)} />
          <Row label="RTO"         value={formatPrice(onRoad.rto)} />
          <Row label="Insurance"   value={formatPrice(onRoad.insurance)} />
          {onRoad.tcs > 0 && <Row label="TCS (1%)" value={formatPrice(onRoad.tcs)} />}
          <Row label="Handling"    value={formatPrice(onRoad.handling)} />
          <Row label="FastTag"     value={formatPrice(onRoad.fastag)} />
          <div style={{ marginTop: '8px' }}>
            <Row label="On-Road Total" value={formatPrice(onRoad.total)} highlight />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#8E99A8', fontSize: '13px', padding: '8px 0' }}>
          Select a variant and city above
        </div>
      )}
    </div>
  )
}
