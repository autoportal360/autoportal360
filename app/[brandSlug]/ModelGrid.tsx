'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Model } from '@/types'
import { formatPriceRange, formatPrice } from '@/lib/utils'

export type ModelRow = Model & {
  variants: { fuel_type: string | null }[]
}

function modelFuelTypes(model: ModelRow): string[] {
  return [...new Set(
    model.variants.map(v => v.fuel_type).filter((t): t is string => t !== null)
  )]
}

const VEHICLE_EMOJI: Record<string, string> = {
  car: '🚗',
  bike: '🏍️',
  scooter: '🛵',
}

const PILL_BASE: React.CSSProperties = {
  borderRadius: '20px', padding: '5px 13px',
  fontSize: '12px', fontWeight: 700, cursor: 'pointer',
  fontFamily: 'Montserrat, sans-serif', border: 'none',
}

export default function ModelGrid({
  models,
  brandSlug,
  vehicleType,
}: {
  models: ModelRow[]
  brandSlug: string
  vehicleType: string
}) {
  const [bodyFilter, setBodyFilter] = useState('All')
  const [fuelFilter, setFuelFilter] = useState('All')

  const bodyTypes = ['All', ...new Set(
    models.map(m => m.body_type).filter((t): t is string => t !== null)
  )]
  const fuelTypes = ['All', ...new Set(models.flatMap(modelFuelTypes))]
  const showFuelFilter = fuelTypes.length > 2

  const filtered = models.filter(m => {
    const bodyOk = bodyFilter === 'All' || m.body_type === bodyFilter
    const fuelOk = fuelFilter === 'All' || modelFuelTypes(m).includes(fuelFilter)
    return bodyOk && fuelOk
  })

  return (
    <div>
      {/* Sticky filter bar */}
      <div style={{
        position: 'sticky', top: '62px', zIndex: 10,
        background: '#06142D',
        borderBottom: '1px solid rgba(0,212,255,0.12)',
        padding: '12px 0 10px',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#8E99A8', fontWeight: 600, whiteSpace: 'nowrap' }}>Body:</span>
          {bodyTypes.map(bt => (
            <button
              key={bt}
              onClick={() => setBodyFilter(bt)}
              style={{
                ...PILL_BASE,
                background: bodyFilter === bt ? '#00D4FF' : 'rgba(0,212,255,0.06)',
                color: bodyFilter === bt ? '#06142D' : '#C0C0C0',
                border: bodyFilter === bt ? 'none' : '1px solid rgba(0,212,255,0.12)',
              }}
            >{bt}</button>
          ))}

          {showFuelFilter && (
            <>
              <div style={{ width: '1px', height: '18px', background: 'rgba(0,212,255,0.15)', margin: '0 2px' }} />
              <span style={{ fontSize: '11px', color: '#8E99A8', fontWeight: 600, whiteSpace: 'nowrap' }}>Fuel:</span>
              {fuelTypes.map(ft => (
                <button
                  key={ft}
                  onClick={() => setFuelFilter(ft)}
                  style={{
                    ...PILL_BASE,
                    background: fuelFilter === ft ? '#00D4FF' : 'rgba(0,212,255,0.06)',
                    color: fuelFilter === ft ? '#06142D' : '#C0C0C0',
                    border: fuelFilter === ft ? 'none' : '1px solid rgba(0,212,255,0.12)',
                  }}
                >{ft}</button>
              ))}
            </>
          )}
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#8E99A8' }}>
          <span style={{ color: '#00D4FF', fontWeight: 700 }}>{filtered.length}</span> of {models.length} models
        </div>
      </div>

      {/* Model grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: '#111111', borderRadius: '14px',
          border: '1px solid rgba(0,212,255,0.08)',
          color: '#8E99A8', fontSize: '14px',
        }}>
          No models match the selected filters
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {filtered.map(model => (
            <ModelCard key={model.id} model={model} brandSlug={brandSlug} vehicleType={vehicleType} />
          ))}
        </div>
      )}
    </div>
  )
}

function ModelCard({
  model,
  brandSlug,
  vehicleType,
}: {
  model: ModelRow
  brandSlug: string
  vehicleType: string
}) {
  const base = `/${brandSlug}/${model.slug}`
  const fuels = modelFuelTypes(model)
  const emoji = VEHICLE_EMOJI[vehicleType] ?? '🚗'

  return (
    <div style={{
      background: '#111111',
      border: '1px solid rgba(0,212,255,0.12)',
      borderRadius: '16px', overflow: 'hidden',
    }}>
      {/* Image placeholder */}
      <Link href={`${base}/`} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{
          height: '140px',
          background: 'linear-gradient(135deg,#0d1f3c,#0a0a0a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '48px', position: 'relative',
        }}>
          {emoji}
          {model.status === 'upcoming' && (
            <span style={{
              position: 'absolute', top: '10px', left: '10px',
              background: 'rgba(255,180,0,0.12)', border: '1px solid rgba(255,180,0,0.35)',
              color: '#FFB400', fontSize: '9px', fontWeight: 800,
              padding: '3px 9px', borderRadius: '20px',
              fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px',
            }}>UPCOMING</span>
          )}
          {model.body_type && (
            <span style={{
              position: 'absolute', top: '10px', right: '10px',
              background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)',
              color: '#00D4FF', fontSize: '9px', fontWeight: 700,
              padding: '3px 9px', borderRadius: '20px',
              fontFamily: 'Montserrat, sans-serif',
            }}>{model.body_type}</span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '14px 16px 12px' }}>
        <Link href={`${base}/`} style={{ textDecoration: 'none' }}>
          <div style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '16px',
            fontWeight: 800, color: '#FFFFFF', marginBottom: '4px',
            lineHeight: 1.2,
          }}>{model.name}</div>
        </Link>

        <div style={{ fontSize: '13px', color: '#00D4FF', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', marginBottom: '8px' }}>
          {model.price_min && model.price_max
            ? formatPriceRange(model.price_min, model.price_max)
            : model.price_min
            ? `Starts ${formatPrice(model.price_min)}`
            : 'Price on request'}
        </div>

        {fuels.length > 0 && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {fuels.map(ft => (
              <span key={ft} style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                background: ft === 'Electric' ? 'rgba(0,255,128,0.06)' : 'rgba(0,212,255,0.06)',
                border: `1px solid ${ft === 'Electric' ? 'rgba(0,255,128,0.15)' : 'rgba(0,212,255,0.12)'}`,
                color: ft === 'Electric' ? '#00FF80' : '#8E99A8',
              }}>{ft}</span>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px', borderTop: '1px solid rgba(0,212,255,0.07)',
          paddingTop: '10px',
        }}>
          {[
            { label: 'Price',   href: `${base}/price/` },
            { label: 'Specs',   href: `${base}/specs/` },
            { label: 'Images',  href: `${base}/images/` },
            { label: 'Colours', href: `${base}/colours/` },
          ].map(lnk => (
            <Link key={lnk.label} href={lnk.href} style={{
              textAlign: 'center', padding: '6px 0',
              fontSize: '10px', fontWeight: 700, color: '#8E99A8',
              textDecoration: 'none',
              background: 'rgba(0,212,255,0.04)',
              borderRadius: '6px',
              fontFamily: 'Montserrat, sans-serif',
              border: '1px solid rgba(0,212,255,0.07)',
            }}>{lnk.label}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
