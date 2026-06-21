'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import type { Spec } from '@/types'

type VariantItem = {
  id: string
  name: string
  fuel_type: string | null
  transmission: string | null
  ex_showroom_price: number
  is_popular: boolean
}

export default function VariantAccordion({
  variants,
  specs,
  modelName,
}: {
  variants: VariantItem[]
  specs: Record<string, Spec>
  modelName: string
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [fuelFilter, setFuelFilter] = useState('All')
  const [transFilter, setTransFilter] = useState('All')

  const fuelTypes = ['All', ...Array.from(new Set(
    variants.map(v => v.fuel_type).filter((f): f is string => f !== null)
  ))]
  const transTypes = Array.from(new Set(
    variants.map(v => v.transmission).filter((t): t is string => t !== null)
  ))
  const showTransFilter = transTypes.length > 1

  const filtered = variants.filter(v => {
    if (fuelFilter !== 'All' && v.fuel_type !== fuelFilter) return false
    if (transFilter !== 'All' && v.transmission !== transFilter) return false
    return true
  })

  if (variants.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: '#8E99A8', fontSize: '14px', background: '#0A1F44', borderRadius: '16px', border: '1px solid rgba(0,212,255,0.08)' }}>
        Variant details coming soon
      </div>
    )
  }

  return (
    <div>
      {/* Fuel filter pills */}
      <div className="ap-variant-filters">
        {fuelTypes.map(ft => (
          <button
            key={ft}
            className={`ap-variant-filter${fuelFilter === ft ? ' active' : ''}`}
            onClick={() => { setFuelFilter(ft); setExpanded(null) }}
          >
            {ft}
          </button>
        ))}
        {showTransFilter && (
          <>
            <span style={{ width: '1px', background: '#1e3a6e', margin: '0 0.125rem', alignSelf: 'stretch', flexShrink: 0 }} />
            {(['All', ...transTypes] as string[]).map(tt => (
              <button
                key={`t-${tt}`}
                className={`ap-variant-filter${transFilter === tt ? ' active' : ''}`}
                onClick={() => { setTransFilter(tt); setExpanded(null) }}
              >
                {tt === 'All' ? 'All Trans.' : tt}
              </button>
            ))}
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: '#8E99A8', fontSize: '13px', textAlign: 'center', padding: '24px', background: '#0A1F44', borderRadius: '12px' }}>
          No variants match the selected filters.
        </p>
      ) : (
        <div className="ap-variant-list">
          {filtered.map(v => {
            const isOpen = expanded === v.id
            const spec = specs[v.id] ?? null
            return (
              <div key={v.id} className="ap-variant-item">
                <button
                  className="ap-variant-header"
                  onClick={() => setExpanded(prev => prev === v.id ? null : v.id)}
                  aria-expanded={isOpen}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ap-variant-name">
                      {v.name}
                      {v.is_popular && (
                        <span style={{ marginLeft: '8px', fontSize: '9px', fontWeight: 800, color: '#FFB400', background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.2)', padding: '1px 7px', borderRadius: '20px', verticalAlign: 'middle' }}>
                          POPULAR
                        </span>
                      )}
                    </div>
                    {(v.fuel_type || v.transmission) && (
                      <div style={{ fontSize: '11px', color: '#8E99A8', marginTop: '2px' }}>
                        {[v.fuel_type, v.transmission].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <div className="ap-variant-price">{formatPrice(v.ex_showroom_price)}</div>
                    <div className="ap-variant-toggle">{isOpen ? '▲' : '▼'}</div>
                  </div>
                </button>

                {isOpen && (
                  <div className="ap-variant-details">
                    <div className="ap-variant-sub">
                      <div className="ap-variant-sub-header">
                        <span className="ap-variant-sub-name">{modelName} {v.name}</span>
                        <span className="ap-variant-sub-price">{formatPrice(v.ex_showroom_price)}</span>
                      </div>
                      {spec && (
                        <div className="ap-variant-sub-specs">
                          {spec.engine_cc   && <span className="ap-variant-sub-spec">{spec.engine_cc} cc</span>}
                          {spec.power_bhp   && <span className="ap-variant-sub-spec">{spec.power_bhp} bhp</span>}
                          {spec.torque_nm   && <span className="ap-variant-sub-spec">{spec.torque_nm} Nm</span>}
                          {spec.mileage_arai && <span className="ap-variant-sub-spec">{spec.mileage_arai} km/l</span>}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.625rem' }}>
                        <a href="#on-road" className="ap-variant-get-offers">Get Best Offers →</a>
                        <div className="ap-variant-compare">
                          <input type="checkbox" id={`cmp-${v.id}`} readOnly />
                          <label htmlFor={`cmp-${v.id}`}>Compare</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      <div className="ap-variant-city">Ex-showroom price, India — tap variant to expand details</div>
    </div>
  )
}
