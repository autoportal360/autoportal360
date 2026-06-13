'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import type { Spec } from '@/types'

// ─── types ────────────────────────────────────────────────────────────────────

type VehicleType = 'car' | 'bike' | 'scooter'

type BrandOption  = { id: string; name: string; slug: string }
type ModelOption  = { id: string; name: string; slug: string; price_min: number | null; price_max: number | null; thumbnail_url: string | null }

type LoadedVehicle = {
  modelId: string
  modelName: string
  modelSlug: string
  brandName: string
  brandPageSlug: string
  price_min: number | null
  price_max: number | null
  thumbnail_url: string | null
  popularVariant: { name: string; ex_showroom_price: number; fuel_type: string | null; transmission: string | null } | null
  topVariant:     { name: string; ex_showroom_price: number } | null
  specs: Spec | null
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function getBrandPageSlug(dbSlug: string, type: VehicleType): string {
  if (type === 'car')    return `${dbSlug}-cars`
  if (type === 'bike')   return `${dbSlug.replace(/-bike$/, '')}-bikes`
  return `${dbSlug.replace(/-scooter$/, '')}-scooters`
}

function parseVehicleParam(param: string): { brandPageSlug: string; modelSlug: string; type: VehicleType } | null {
  for (const [suffix, type] of [['-cars', 'car'], ['-bikes', 'bike'], ['-scooters', 'scooter']] as [string, VehicleType][]) {
    const idx = param.lastIndexOf(suffix)
    if (idx !== -1 && idx + suffix.length < param.length) {
      return { brandPageSlug: param.slice(0, idx + suffix.length), modelSlug: param.slice(idx + suffix.length + 1), type }
    }
  }
  return null
}

function buildParam(brandPageSlug: string, modelSlug: string): string {
  return `${brandPageSlug}-${modelSlug}`
}

// ─── spec row definitions ─────────────────────────────────────────────────────

type SpecRow = {
  section?: string
  label:    string
  value:    (v: LoadedVehicle) => number | string | null
  higher?:  boolean   // true = higher wins cyan, false = lower wins green, undefined = no comparison
  isPrice?: boolean
  unit?:    string
}

const SPEC_ROWS: SpecRow[] = [
  { section: 'Pricing',             label: 'Base Price (ex-showroom)',     isPrice: true,   higher: false, value: v => v.price_min },
  {                                  label: 'Top Price (ex-showroom)',      isPrice: true,   higher: false, value: v => v.price_max },
  {                                  label: 'Popular Variant Price',        isPrice: true,   higher: false, value: v => v.popularVariant?.ex_showroom_price ?? null },
  { section: 'Engine & Performance', label: 'Engine',                       unit: 'cc',                    value: v => v.specs?.engine_cc ?? null },
  {                                  label: 'Power',                         unit: 'bhp',    higher: true,  value: v => v.specs?.power_bhp ?? null },
  {                                  label: 'Torque',                        unit: 'Nm',     higher: true,  value: v => v.specs?.torque_nm ?? null },
  {                                  label: 'Mileage (ARAI)',                unit: 'km/l',   higher: true,  value: v => v.specs?.mileage_arai ?? null },
  {                                  label: 'Fuel Type',                                                    value: v => v.popularVariant?.fuel_type ?? null },
  {                                  label: 'Transmission',                                                 value: v => v.popularVariant?.transmission ?? null },
  { section: 'Dimensions',           label: 'Length',                        unit: 'mm',                   value: v => v.specs?.length_mm ?? null },
  {                                  label: 'Width',                          unit: 'mm',                   value: v => v.specs?.width_mm ?? null },
  {                                  label: 'Height',                         unit: 'mm',                   value: v => v.specs?.height_mm ?? null },
  {                                  label: 'Wheelbase',                      unit: 'mm',                   value: v => v.specs?.wheelbase_mm ?? null },
  {                                  label: 'Ground Clearance',               unit: 'mm',     higher: true, value: v => v.specs?.ground_clearance_mm ?? null },
  {                                  label: 'Kerb Weight',                    unit: 'kg',     higher: false, value: v => v.specs?.kerb_weight_kg ?? null },
  { section: 'Features',             label: 'Seating Capacity',               unit: ' seats',               value: v => v.specs?.seating ?? null },
  {                                  label: 'Boot Space',                     unit: 'L',      higher: true,  value: v => v.specs?.boot_space_l ?? null },
  {                                  label: 'Fuel Tank',                      unit: 'L',      higher: true,  value: v => v.specs?.fuel_tank_l ?? null },
  {                                  label: 'Tyre Size',                                                     value: v => v.specs?.tyre_size ?? null },
  {                                  label: 'NCAP Rating',                                                   value: v => v.specs?.ncap_rating ?? null },
]

// ─── style tokens ─────────────────────────────────────────────────────────────

const SELECT: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 32px 10px 14px',
  background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.18)',
  borderRadius: '10px', color: '#FFFFFF', fontSize: '14px', outline: 'none',
  appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238E99A8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
}

const LABEL_SM: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, color: '#8E99A8',
  textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '5px', display: 'block',
}

// ─── vehicle loader ──────────────────────────────────────────────────────────

async function loadVehicle(modelSlug: string, type: VehicleType): Promise<LoadedVehicle | null> {
  const { data: rows } = await supabase
    .from('models')
    .select('id, name, slug, price_min, price_max, thumbnail_url, brands!inner(id, name, slug, type)')
    .eq('slug', modelSlug)
    .neq('status', 'discontinued')

  if (!rows?.length) return null
  const row = rows.find(r => (r.brands as unknown as {type:string}).type === type) ?? rows[0]
  const brand = row.brands as unknown as { id: string; name: string; slug: string; type: VehicleType }

  const { data: variants } = await supabase
    .from('variants')
    .select('id, name, ex_showroom_price, fuel_type, transmission, is_popular, sort_order')
    .eq('model_id', row.id)
    .order('sort_order')

  const all = variants ?? []
  const popular = all.find(v => v.is_popular) ?? all[0] ?? null
  const top = all.length > 1 ? all[all.length - 1] : null

  let specs: Spec | null = null
  if (popular) {
    const { data } = await supabase.from('specs').select('*').eq('variant_id', popular.id).single()
    specs = data as Spec | null
  }

  return {
    modelId:       row.id,
    modelName:     row.name,
    modelSlug:     row.slug,
    brandName:     brand.name,
    brandPageSlug: getBrandPageSlug(brand.slug, brand.type),
    price_min:     row.price_min,
    price_max:     row.price_max,
    thumbnail_url: row.thumbnail_url,
    popularVariant: popular ? { name: popular.name, ex_showroom_price: popular.ex_showroom_price, fuel_type: popular.fuel_type, transmission: popular.transmission } : null,
    topVariant:     top     ? { name: top.name,     ex_showroom_price: top.ex_showroom_price } : null,
    specs,
  }
}

// ─── vehicle selector card ────────────────────────────────────────────────────

function VehicleSelector({
  slot, vehicle, onLoad, onClear,
}: {
  slot: 1 | 2
  vehicle: LoadedVehicle | null
  onLoad: (v: LoadedVehicle) => void
  onClear: () => void
}) {
  const [type,    setType]    = useState<VehicleType | ''>('')
  const [brands,  setBrands]  = useState<BrandOption[]>([])
  const [brandId, setBrandId] = useState('')
  const [models,  setModels]  = useState<ModelOption[]>([])
  const [modelId, setModelId] = useState('')
  const [loading, setLoading] = useState(false)

  async function onTypeChange(t: VehicleType | '') {
    setType(t); setBrandId(''); setModels([]); setModelId('')
    if (!t) { setBrands([]); return }
    const { data } = await supabase
      .from('brands').select('id, name, slug').eq('type', t).eq('is_active', true).order('name')
    setBrands((data ?? []) as BrandOption[])
  }

  async function onBrandChange(id: string) {
    setBrandId(id); setModelId('')
    if (!id) { setModels([]); return }
    const { data } = await supabase
      .from('models').select('id, name, slug, price_min, price_max, thumbnail_url')
      .eq('brand_id', id).neq('status', 'discontinued').order('name')
    setModels((data ?? []) as ModelOption[])
  }

  async function onModelChange(id: string) {
    setModelId(id)
    if (!id || !type) return
    const m = models.find(x => x.id === id)
    if (!m) return
    setLoading(true)
    const loaded = await loadVehicle(m.slug, type)
    setLoading(false)
    if (loaded) onLoad(loaded)
  }

  if (vehicle) {
    const emoji = vehicle.brandPageSlug.endsWith('-cars') ? '🚗' : vehicle.brandPageSlug.endsWith('-bikes') ? '🏍️' : '🛵'
    return (
      <div style={{
        background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: '14px', padding: '16px', position: 'relative',
      }}>
        <button onClick={onClear} style={{
          position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)', color: '#8E99A8', width: 28, height: 28,
          borderRadius: '50%', cursor: 'pointer', fontSize: 14, lineHeight: '28px',
        }}>×</button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 72, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {vehicle.thumbnail_url
              ? <Image src={vehicle.thumbnail_url} alt={vehicle.modelName} fill style={{ objectFit: 'contain', padding: 4 }} sizes="72px" />
              : <span style={{ fontSize: 28 }}>{emoji}</span>
            }
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#8E99A8', marginBottom: 2 }}>{vehicle.brandName}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}>
              {vehicle.modelName}
            </div>
            {vehicle.price_min && (
              <div style={{ fontSize: 13, color: '#00D4FF', fontWeight: 700 }}>
                {formatPrice(vehicle.price_min)}
                {vehicle.price_max && vehicle.price_max !== vehicle.price_min && ` – ${formatPrice(vehicle.price_max)}`}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(0,212,255,0.02)', border: '1px dashed rgba(0,212,255,0.18)',
      borderRadius: '14px', padding: '20px',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#00D4FF', fontFamily: 'Montserrat,sans-serif', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Vehicle {slot}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={LABEL_SM}>Type</label>
        <select value={type} onChange={e => onTypeChange(e.target.value as VehicleType | '')} style={SELECT}>
          <option value="">Select type…</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="scooter">Scooter</option>
        </select>
      </div>

      {type && (
        <div style={{ marginBottom: 12 }}>
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
          <select value={modelId} onChange={e => onModelChange(e.target.value)} style={SELECT} disabled={loading}>
            <option value="">{loading ? 'Loading…' : 'Select model…'}</option>
            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

// ─── comparison table ─────────────────────────────────────────────────────────

function ComparisonTable({ v1, v2 }: { v1: LoadedVehicle; v2: LoadedVehicle }) {
  let wins1 = 0, wins2 = 0

  // Pre-compute wins
  for (const row of SPEC_ROWS) {
    if (row.higher === undefined) continue
    const a = row.value(v1), b = row.value(v2)
    if (typeof a !== 'number' || typeof b !== 'number' || a === b) continue
    if (row.higher) { if (a > b) wins1++; else wins2++ }
    else            { if (a < b) wins1++; else wins2++ }
  }

  const TH: React.CSSProperties = { padding: '12px 16px', fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: 13, color: '#FFFFFF', background: 'rgba(0,212,255,0.06)', textAlign: 'center' }
  const TD: React.CSSProperties = { padding: '11px 16px', fontSize: 13, color: '#C0C0C0', textAlign: 'center', verticalAlign: 'middle' }
  const SECTION: React.CSSProperties = { padding: '8px 16px', fontSize: 10, fontWeight: 800, color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(0,212,255,0.03)', textAlign: 'left', borderBottom: '1px solid rgba(0,212,255,0.08)' }

  function renderValue(raw: number | string | null, row: SpecRow, isBetter: boolean): React.ReactNode {
    if (raw === null || raw === undefined || raw === '') return <span style={{ color: '#555' }}>—</span>
    const formatted = typeof raw === 'number'
      ? row.isPrice
        ? formatPrice(raw)
        : `${raw}${row.unit ?? ''}`
      : raw
    if (!isBetter) return <span style={{ color: '#C0C0C0' }}>{formatted}</span>
    const col = row.isPrice || row.higher === false ? '#00CC66' : '#00D4FF'
    return (
      <span style={{ color: col, fontWeight: 800 }}>
        {formatted} <span style={{ fontSize: 10 }}>✓</span>
      </span>
    )
  }

  return (
    <div style={{ marginTop: 24 }}>

      {/* Summary bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: '12px', padding: '12px 20px', marginBottom: 20, flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: wins1 > wins2 ? '#00D4FF' : '#8E99A8' }}>
          {v1.brandName} {v1.modelName}
          <span style={{ marginLeft: 8, fontSize: 11, background: wins1 > wins2 ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)', color: wins1 > wins2 ? '#00D4FF' : '#8E99A8', padding: '2px 8px', borderRadius: 12 }}>
            wins {wins1} categories
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#8E99A8' }}>vs</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: wins2 > wins1 ? '#00D4FF' : '#8E99A8' }}>
          {v2.brandName} {v2.modelName}
          <span style={{ marginLeft: 8, fontSize: 11, background: wins2 > wins1 ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)', color: wins2 > wins1 ? '#00D4FF' : '#8E99A8', padding: '2px 8px', borderRadius: 12 }}>
            wins {wins2} categories
          </span>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 16, overflow: 'hidden', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.12)' }}>
              <th style={{ ...TH, textAlign: 'left', width: '35%', background: 'transparent' }}></th>
              <th style={TH}>
                <div style={{ fontSize: 11, color: '#8E99A8', fontWeight: 600, marginBottom: 2 }}>{v1.brandName}</div>
                <div>{v1.modelName}</div>
              </th>
              <th style={TH}>
                <div style={{ fontSize: 11, color: '#8E99A8', fontWeight: 600, marginBottom: 2 }}>{v2.brandName}</div>
                <div>{v2.modelName}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {SPEC_ROWS.map((row, i) => {
              const val1 = row.value(v1)
              const val2 = row.value(v2)

              let better1 = false, better2 = false
              if (row.higher !== undefined && typeof val1 === 'number' && typeof val2 === 'number' && val1 !== val2) {
                if (row.higher) { better1 = val1 > val2; better2 = val2 > val1 }
                else            { better1 = val1 < val2; better2 = val2 < val1 }
              }

              return (
                <>
                  {row.section && (
                    <tr key={`section-${i}`}>
                      <td colSpan={3} style={SECTION}>{row.section}</td>
                    </tr>
                  )}
                  <tr key={row.label} style={{ borderBottom: '1px solid rgba(0,212,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ ...TD, textAlign: 'left', color: '#8E99A8', fontWeight: 600, fontSize: 12, paddingLeft: 20 }}>
                      {row.label}
                    </td>
                    <td style={TD}>{renderValue(val1, row, better1)}</td>
                    <td style={TD}>{renderValue(val2, row, better2)}</td>
                  </tr>
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[v1, v2].map(v => (
          <Link key={v.modelId} href={`/${v.brandPageSlug}/${v.modelSlug}/`} style={{
            background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
            border: '1px solid rgba(0,212,255,0.25)', borderRadius: 10,
            padding: '11px 24px', textDecoration: 'none',
            fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 13,
          }}>
            View {v.brandName} {v.modelName} →
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function CompareClient({
  initialV1,
  initialV2,
}: {
  initialV1?: string
  initialV2?: string
}) {
  const router = useRouter()
  const [v1,       setV1]       = useState<LoadedVehicle | null>(null)
  const [v2,       setV2]       = useState<LoadedVehicle | null>(null)
  const [initDone, setInitDone] = useState(false)

  // Load vehicles from URL params on mount
  useEffect(() => {
    async function init() {
      const load = async (param: string) => {
        const parsed = parseVehicleParam(param)
        if (!parsed) return null
        return loadVehicle(parsed.modelSlug, parsed.type)
      }
      const [loaded1, loaded2] = await Promise.all([
        initialV1 ? load(initialV1) : Promise.resolve(null),
        initialV2 ? load(initialV2) : Promise.resolve(null),
      ])
      if (loaded1) setV1(loaded1)
      if (loaded2) setV2(loaded2)
      setInitDone(true)
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateUrl = useCallback((next1: LoadedVehicle | null, next2: LoadedVehicle | null) => {
    const params = new URLSearchParams()
    if (next1) params.set('v1', buildParam(next1.brandPageSlug, next1.modelSlug))
    if (next2) params.set('v2', buildParam(next2.brandPageSlug, next2.modelSlug))
    const qs = params.toString()
    router.replace(`/compare${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router])

  function handleLoad1(v: LoadedVehicle) { setV1(v); updateUrl(v, v2) }
  function handleLoad2(v: LoadedVehicle) { setV2(v); updateUrl(v1, v) }
  function handleClear1() { setV1(null); updateUrl(null, v2) }
  function handleClear2() { setV2(null); updateUrl(v1, null) }

  const bothSelected = v1 !== null && v2 !== null

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', padding: '32px 20px 72px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#8E99A8', marginBottom: 28, alignItems: 'center' }}>
          <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#00D4FF' }}>Compare Vehicles</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 30, fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px' }}>
            Compare <span style={{ color: '#00D4FF' }}>Cars, Bikes & Scooters</span>
          </h1>
          <p style={{ fontSize: 14, color: '#8E99A8', margin: 0 }}>
            Compare specs, prices and features side by side
          </p>
        </div>

        {/* Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <VehicleSelector slot={1} vehicle={v1} onLoad={handleLoad1} onClear={handleClear1} />
          <VehicleSelector slot={2} vehicle={v2} onLoad={handleLoad2} onClear={handleClear2} />
        </div>

        {/* VS divider / Compare CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          {(!v1 || !v2) ? (
            <div style={{ fontSize: 13, color: '#8E99A8', padding: '10px 0' }}>
              Select both vehicles above to compare
            </div>
          ) : !bothSelected ? null : (
            <div style={{
              background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: '50%', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#00D4FF', flexShrink: 0,
            }}>vs</div>
          )}
        </div>

        {/* Comparison table */}
        {bothSelected && (
          <ComparisonTable v1={v1!} v2={v2!} />
        )}

        {/* Loading hint */}
        {(initialV1 || initialV2) && !initDone && (
          <div style={{ textAlign: 'center', padding: 48, color: '#8E99A8', fontSize: 13 }}>
            Loading vehicles…
          </div>
        )}

      </div>
    </div>
  )
}
