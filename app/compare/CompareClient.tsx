'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import {
  type VehicleType,
  type LoadedVehicle,
  buildComparisonPath,
  loadVehicleByBrandModel,
  loadVehiclesFromSlugs,
  POPULAR_COMPARISONS,
} from './compareUtils'

// ─── types ────────────────────────────────────────────────────────────────────

type BrandOption = { id: string; name: string; slug: string }
type ModelOption = { id: string; name: string; slug: string; price_min: number | null }

// ─── style tokens ─────────────────────────────────────────────────────────────

const SELECT: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 32px 10px 14px',
  background: 'rgba(0,212,255,0.04)',
  border: '1px solid rgba(0,212,255,0.18)',
  borderRadius: '10px', color: '#FFFFFF',
  fontSize: '14px', outline: 'none',
  appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238E99A8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
}

const LABEL_SM: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, color: '#8E99A8',
  textTransform: 'uppercase', letterSpacing: '0.8px',
  marginBottom: '5px', display: 'block',
}

// ─── vehicle selector card ────────────────────────────────────────────────────

function VehicleSelector({
  slot,
  vehicle,
  onLoad,
  onClear,
}: {
  slot: number
  vehicle: LoadedVehicle | null
  onLoad: (v: LoadedVehicle) => void
  onClear: () => void
}) {
  const [type,      setType]      = useState<VehicleType | ''>('')
  const [brands,    setBrands]    = useState<BrandOption[]>([])
  const [brandId,   setBrandId]   = useState('')
  const [brandSlug, setBrandSlug] = useState('')
  const [models,    setModels]    = useState<ModelOption[]>([])
  const [modelId,   setModelId]   = useState('')
  const [loading,   setLoading]   = useState(false)

  async function onTypeChange(t: VehicleType | '') {
    setType(t); setBrandId(''); setBrandSlug(''); setModels([]); setModelId('')
    if (!t) { setBrands([]); return }
    const { data } = await supabase
      .from('brands').select('id, name, slug')
      .eq('type', t).eq('is_active', true).order('name')
    setBrands((data ?? []) as BrandOption[])
  }

  async function onBrandChange(id: string) {
    setBrandId(id); setModelId('')
    const brand = brands.find(b => b.id === id)
    setBrandSlug(brand?.slug ?? '')
    if (!id) { setModels([]); return }
    const { data } = await supabase
      .from('models').select('id, name, slug, price_min')
      .eq('brand_id', id).neq('status', 'discontinued').order('name')
    setModels((data ?? []) as ModelOption[])
  }

  async function onModelChange(id: string) {
    setModelId(id)
    if (!id || !type || !brandSlug) return
    const m = models.find(x => x.id === id)
    if (!m) return
    setLoading(true)
    const loaded = await loadVehicleByBrandModel(brandSlug, m.slug)
    setLoading(false)
    if (loaded) onLoad(loaded)
  }

  if (vehicle) {
    const emoji = vehicle.vehicleType === 'car' ? '🚗' : vehicle.vehicleType === 'bike' ? '🏍️' : '🛵'
    return (
      <div style={{
        background: 'rgba(0,212,255,0.04)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: '14px', padding: '14px',
        position: 'relative',
      }}>
        <button onClick={onClear} style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#8E99A8', width: 26, height: 26,
          borderRadius: '50%', cursor: 'pointer',
          fontSize: 14, lineHeight: '26px', padding: 0,
        }}>×</button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingRight: 28 }}>
          <div style={{
            width: 64, height: 46, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
            background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            {vehicle.thumbnail_url
              ? <Image src={vehicle.thumbnail_url} alt={vehicle.modelName} fill style={{ objectFit: 'contain', padding: 4 }} sizes="64px" />
              : <span style={{ fontSize: 24 }}>{emoji}</span>
            }
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#8E99A8', marginBottom: 1 }}>{vehicle.brandName}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}>
              {vehicle.modelName}
            </div>
            {vehicle.price_min && (
              <div style={{ fontSize: 12, color: '#00D4FF', fontWeight: 700 }}>
                {formatPrice(vehicle.price_min)}
                {vehicle.price_max && vehicle.price_max !== vehicle.price_min
                  ? ` – ${formatPrice(vehicle.price_max)}`
                  : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(0,212,255,0.02)',
      border: '1px dashed rgba(0,212,255,0.18)',
      borderRadius: '14px', padding: '16px',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#00D4FF',
        fontFamily: 'Montserrat, sans-serif',
        marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        Vehicle {slot}
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={LABEL_SM}>Type</label>
        <select value={type} onChange={e => onTypeChange(e.target.value as VehicleType | '')} style={SELECT}>
          <option value="">Select type…</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="scooter">Scooter</option>
        </select>
      </div>

      {type && (
        <div style={{ marginBottom: 10 }}>
          <label style={LABEL_SM}>Brand</label>
          <select value={brandId} onChange={e => onBrandChange(e.target.value)} style={SELECT}>
            <option value="">Select brand…</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}

      {brandId && (
        <div>
          <label style={LABEL_SM}>Model</label>
          <select
            value={modelId}
            onChange={e => onModelChange(e.target.value)}
            style={SELECT}
            disabled={loading}
          >
            <option value="">{loading ? 'Loading…' : 'Select model…'}</option>
            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function CompareClient({
  initialCombinedSlug,
}: {
  initialCombinedSlug?: string
}) {
  const router = useRouter()
  const [v1,        setV1]        = useState<LoadedVehicle | null>(null)
  const [v2,        setV2]        = useState<LoadedVehicle | null>(null)
  const [v3,        setV3]        = useState<LoadedVehicle | null>(null)
  const [showThird, setShowThird] = useState(false)

  // Pre-load vehicle from model page Compare link (?v1=brand-model)
  useEffect(() => {
    if (!initialCombinedSlug) return
    loadVehiclesFromSlugs([initialCombinedSlug]).then(([loaded]) => {
      if (loaded) setV1(loaded)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate to SEO URL as soon as 2+ slots are filled
  useEffect(() => {
    const filled = [v1, v2, showThird ? v3 : null].filter(Boolean) as LoadedVehicle[]
    if (filled.length >= 2) {
      router.push(buildComparisonPath(filled))
    }
  }, [v1, v2, v3, showThird, router])

  const filledCount = [v1, v2, showThird ? v3 : null].filter(Boolean).length

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', padding: '32px 20px 72px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#8E99A8', marginBottom: 28, alignItems: 'center' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>Compare Vehicles</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 30, fontWeight: 900,
            color: '#FFFFFF', margin: '0 0 6px',
          }}>
            Compare <span style={{ color: '#00D4FF' }}>Cars, Bikes &amp; Scooters</span>
          </h1>
          <p style={{ fontSize: 14, color: '#8E99A8', margin: 0 }}>
            Select 2 or 3 vehicles to compare specs, prices and features side by side
          </p>
        </div>

        {/* Selectors grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: showThird ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: 12, marginBottom: 12,
        }}>
          <VehicleSelector slot={1} vehicle={v1} onLoad={setV1} onClear={() => setV1(null)} />
          <VehicleSelector slot={2} vehicle={v2} onLoad={setV2} onClear={() => setV2(null)} />
          {showThird && (
            <VehicleSelector slot={3} vehicle={v3} onLoad={setV3} onClear={() => setV3(null)} />
          )}
        </div>

        {/* 3rd vehicle toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          {!showThird ? (
            <button onClick={() => setShowThird(true)} style={{
              background: 'rgba(0,212,255,0.06)',
              border: '1px dashed rgba(0,212,255,0.25)',
              color: '#8E99A8', borderRadius: 10,
              padding: '8px 18px', cursor: 'pointer',
              fontSize: 13, fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
            }}>
              + Add 3rd vehicle
            </button>
          ) : (
            <button onClick={() => { setShowThird(false); setV3(null) }} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#8E99A8', borderRadius: 10,
              padding: '8px 18px', cursor: 'pointer', fontSize: 13,
            }}>
              Remove 3rd vehicle
            </button>
          )}
        </div>

        {/* Status hint */}
        <div style={{ textAlign: 'center', color: '#8E99A8', fontSize: 13, marginBottom: 36 }}>
          {filledCount === 0 && 'Select vehicles above to start comparing'}
          {filledCount === 1 && 'Select one more vehicle to compare'}
          {filledCount >= 2 && <span style={{ color: '#00D4FF' }}>Loading comparison…</span>}
        </div>

        {/* Popular comparisons */}
        <div style={{
          background: 'rgba(0,212,255,0.03)',
          border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: 14, padding: '20px 24px',
        }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 800,
            color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.6px',
            margin: '0 0 14px',
          }}>
            Popular Comparisons
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {POPULAR_COMPARISONS.map(c => (
              <Link key={c.slug} href={`/compare/${c.slug}/`} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '8px 14px',
                textDecoration: 'none', fontSize: 13, color: '#C0C0C0',
              }}>
                {c.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
