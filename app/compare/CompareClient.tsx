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
  buildTypedComparisonPath,
  loadVehicleByBrandModel,
  loadVehiclesFromSlugs,
  variantToSlug,
  POPULAR_COMPARISONS_BY_TYPE,
} from './compareUtils'

// ─── types ────────────────────────────────────────────────────────────────────

type BrandOption   = { id: string; name: string; slug: string; logo_url: string | null }
type ModelOption   = { id: string; name: string; slug: string; price_min: number | null; thumbnail_url: string | null }
type VariantOption = { id: string; name: string; ex_showroom_price: number; fuel_type: string | null; transmission: string | null }

// ─── sticky comparison bar ────────────────────────────────────────────────────

function StickyBar({ vehicles, onNavigate }: { vehicles: (LoadedVehicle | null)[]; onNavigate: () => void }) {
  const filled = vehicles.filter(Boolean) as LoadedVehicle[]
  if (filled.length === 0) return null

  return (
    <div style={{
      position: 'sticky', top: 62, zIndex: 50,
      background: 'rgba(10,31,68,0.97)',
      borderBottom: '1px solid rgba(0,212,255,0.2)',
      backdropFilter: 'blur(12px)', padding: '10px 20px',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {vehicles.map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span style={{ fontSize: 10, color: '#8E99A8', fontWeight: 700 }}>VS</span>}
              {v ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, padding: '4px 10px' }}>
                  {v.thumbnail_url && (
                    <div style={{ width: 28, height: 20, position: 'relative', flexShrink: 0 }}>
                      <Image src={v.thumbnail_url} alt={v.modelName} fill style={{ objectFit: 'contain' }} sizes="28px" />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>{v.brandName} {v.modelName}</div>
                    {v.popularVariant?.name && <div style={{ fontSize: 9, color: '#8E99A8' }}>{v.popularVariant.name}</div>}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: '#555', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 8, padding: '4px 12px' }}>+ Vehicle {i + 1}</div>
              )}
            </div>
          ))}
        </div>
        {filled.length >= 2 && (
          <button onClick={onNavigate} style={{
            background: '#00D4FF', color: '#06142D', border: 'none', borderRadius: 10,
            padding: '9px 22px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900, fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0,
          }}>Compare Now →</button>
        )}
      </div>
    </div>
  )
}

// ─── brand card grid ──────────────────────────────────────────────────────────

function BrandGrid({ brands, selectedId, onSelect }: { brands: BrandOption[]; selectedId: string; onSelect: (b: BrandOption) => void }) {
  if (!brands.length) return <div style={{ fontSize: 12, color: '#8E99A8', padding: '16px 0', textAlign: 'center' }}>Loading brands…</div>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 6, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
      {brands.map(b => {
        const isSel = b.id === selectedId
        return (
          <button key={b.id} onClick={() => onSelect(b)} style={{
            background: isSel ? 'rgba(0,212,255,0.12)' : '#0A1F44',
            border: isSel ? '2px solid #00D4FF' : '1px solid rgba(0,212,255,0.15)',
            borderRadius: 10, padding: '8px 4px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          }}>
            <div style={{ width: 32, height: 24, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {b.logo_url ? <Image src={b.logo_url} alt={b.name} fill style={{ objectFit: 'contain' }} sizes="32px" /> : <span style={{ fontSize: 16 }}>🏭</span>}
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: isSel ? '#00D4FF' : '#C0C0C0', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word', maxWidth: 64 }}>{b.name}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── model card grid ──────────────────────────────────────────────────────────

function ModelGrid({ models, loading, onSelect }: { models: ModelOption[]; loading: boolean; onSelect: (m: ModelOption) => void }) {
  if (loading) return <div style={{ fontSize: 12, color: '#8E99A8', padding: '16px 0', textAlign: 'center' }}>Loading models…</div>
  if (!models.length) return <div style={{ fontSize: 12, color: '#8E99A8', padding: '16px 0', textAlign: 'center' }}>No models found</div>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
      {models.map(m => (
        <button key={m.id} onClick={() => onSelect(m)} style={{
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 10, padding: '8px',
          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#00D4FF')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)')}
        >
          <div style={{ width: 72, height: 48, position: 'relative', background: 'rgba(0,212,255,0.03)', borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {m.thumbnail_url ? <Image src={m.thumbnail_url} alt={m.name} fill style={{ objectFit: 'contain', padding: 3 }} sizes="72px" /> : <span style={{ fontSize: 22 }}>🚗</span>}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#FFFFFF', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word' }}>{m.name}</span>
          {m.price_min && <span style={{ fontSize: 9, color: '#00D4FF', fontWeight: 700 }}>{formatPrice(m.price_min)}</span>}
        </button>
      ))}
    </div>
  )
}

// ─── variant list ─────────────────────────────────────────────────────────────

function VariantList({ variants, loading, onSelect, onSkip }: {
  variants: VariantOption[]; loading: boolean; onSelect: (v: VariantOption) => void; onSkip: () => void
}) {
  if (loading) return <div style={{ fontSize: 12, color: '#8E99A8', padding: '12px 0', textAlign: 'center' }}>Loading variants…</div>
  if (!variants.length) { onSkip(); return null }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
        {variants.map(v => (
          <button key={v.id} onClick={() => onSelect(v)} style={{
            background: '#06142D', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 8,
            padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', textAlign: 'left', gap: 8,
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#00D4FF')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.12)')}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>{v.name}</div>
              {(v.fuel_type || v.transmission) && (
                <div style={{ fontSize: 10, color: '#8E99A8', marginTop: 2 }}>{[v.fuel_type, v.transmission].filter(Boolean).join(' · ')}</div>
              )}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#00D4FF', whiteSpace: 'nowrap', flexShrink: 0 }}>{formatPrice(v.ex_showroom_price)}</div>
          </button>
        ))}
      </div>
      <button onClick={onSkip} style={{
        marginTop: 10, width: '100%', background: 'transparent',
        border: '1px dashed rgba(0,212,255,0.2)', borderRadius: 8, padding: '7px 0',
        color: '#8E99A8', fontSize: 11, cursor: 'pointer',
      }}>
        Compare with popular variant →
      </button>
    </div>
  )
}

// ─── vehicle selector ─────────────────────────────────────────────────────────

type SelectorStep = 'brand' | 'model' | 'variant'

function VehicleSelector({ slot, vehicle, vehicleType, onLoad, onClear }: {
  slot: number; vehicle: LoadedVehicle | null; vehicleType: VehicleType
  onLoad: (v: LoadedVehicle) => void; onClear: () => void
}) {
  const [brands,          setBrands]          = useState<BrandOption[]>([])
  const [brand,           setBrand]           = useState<BrandOption | null>(null)
  const [models,          setModels]          = useState<ModelOption[]>([])
  const [modelsLoading,   setModelsLoading]   = useState(false)
  const [variants,        setVariants]        = useState<VariantOption[]>([])
  const [variantsLoading, setVariantsLoading] = useState(false)
  const [pendingVehicle,  setPendingVehicle]  = useState<LoadedVehicle | null>(null)
  const [step,            setStep]            = useState<SelectorStep>('brand')

  useEffect(() => {
    supabase.from('brands').select('id, name, slug, logo_url')
      .eq('type', vehicleType).eq('is_active', true).order('name')
      .then(({ data }) => setBrands((data ?? []) as BrandOption[]))
  }, [vehicleType])

  async function onBrandSelect(b: BrandOption) {
    setBrand(b); setModels([]); setStep('model'); setModelsLoading(true)
    const { data } = await supabase
      .from('models').select('id, name, slug, price_min, thumbnail_url')
      .eq('brand_id', b.id).neq('status', 'discontinued').order('name')
    setModels((data ?? []) as ModelOption[])
    setModelsLoading(false)
  }

  async function onModelSelect(m: ModelOption) {
    if (!brand) return
    setStep('variant'); setVariantsLoading(true); setPendingVehicle(null)
    const [loaded, { data: vdata }] = await Promise.all([
      loadVehicleByBrandModel(brand.slug, m.slug),
      supabase.from('variants')
        .select('id, name, ex_showroom_price, fuel_type, transmission, is_popular, sort_order')
        .eq('model_id', m.id).order('sort_order'),
    ])
    setPendingVehicle(loaded)
    setVariants((vdata ?? []) as VariantOption[])
    setVariantsLoading(false)
  }

  function onVariantSelect(v: VariantOption) {
    if (!pendingVehicle) return
    onLoad({
      ...pendingVehicle,
      selectedVariantSlug: variantToSlug(v.name),
      popularVariant: { name: v.name, ex_showroom_price: v.ex_showroom_price, fuel_type: v.fuel_type, transmission: v.transmission },
    })
  }

  function onVariantSkip() { if (pendingVehicle) onLoad(pendingVehicle) }

  function handleClear() {
    setBrand(null); setModels([]); setVariants([]); setPendingVehicle(null); setStep('brand')
    onClear()
  }

  const emoji = vehicleType === 'car' ? '🚗' : vehicleType === 'bike' ? '🏍️' : '🛵'

  if (vehicle) {
    return (
      <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 14, padding: 14, position: 'relative' }}>
        <button onClick={handleClear} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#8E99A8', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 14, lineHeight: '26px', padding: 0 }}>×</button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingRight: 28 }}>
          <div style={{ width: 72, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {vehicle.thumbnail_url ? <Image src={vehicle.thumbnail_url} alt={vehicle.modelName} fill style={{ objectFit: 'contain', padding: 4 }} sizes="72px" /> : <span style={{ fontSize: 24 }}>{emoji}</span>}
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#8E99A8', marginBottom: 2 }}>{vehicle.brandName}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}>{vehicle.modelName}</div>
            {vehicle.popularVariant?.name && <div style={{ fontSize: 11, color: '#8E99A8' }}>{vehicle.popularVariant.name}</div>}
            {vehicle.price_min && (
              <div style={{ fontSize: 12, color: '#00D4FF', fontWeight: 700 }}>
                {formatPrice(vehicle.price_min)}{vehicle.price_max && vehicle.price_max !== vehicle.price_min ? ` – ${formatPrice(vehicle.price_max)}` : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const stepLabel: Record<SelectorStep, string> = { brand: 'Brand', model: 'Model', variant: 'Variant' }
  const stepNum:   Record<SelectorStep, number> = { brand: 1, model: 2, variant: 3 }

  return (
    <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 14, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{emoji} Vehicle {slot}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {step !== 'brand' && (
            <button onClick={() => { setStep(step === 'variant' ? 'model' : 'brand'); if (step === 'variant') setPendingVehicle(null) }} style={{ background: 'transparent', border: 'none', color: '#8E99A8', cursor: 'pointer', fontSize: 11, padding: 0 }}>← Back</button>
          )}
          <span style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Step {stepNum[step]}/3 · {stepLabel[step]}</span>
        </div>
      </div>

      {step !== 'brand' && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {brand && <span style={{ fontSize: 10, color: '#00D4FF', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '2px 10px' }}>{brand.name}</span>}
          {step === 'variant' && pendingVehicle && <span style={{ fontSize: 10, color: '#8E99A8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2px 10px' }}>{pendingVehicle.modelName}</span>}
        </div>
      )}

      {step === 'brand'   && <BrandGrid brands={brands} selectedId={brand?.id ?? ''} onSelect={onBrandSelect} />}
      {step === 'model'   && <ModelGrid models={models} loading={modelsLoading} onSelect={onModelSelect} />}
      {step === 'variant' && <VariantList variants={variants} loading={variantsLoading} onSelect={onVariantSelect} onSkip={onVariantSkip} />}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

const TYPE_LABEL: Record<VehicleType, string> = { car: 'Cars', bike: 'Bikes', scooter: 'Scooters' }

export default function CompareClient({ vehicleType, basePath, initialCombinedSlug }: {
  vehicleType: VehicleType; basePath: string; initialCombinedSlug?: string
}) {
  const router = useRouter()
  const [v1, setV1] = useState<LoadedVehicle | null>(null)
  const [v2, setV2] = useState<LoadedVehicle | null>(null)
  const [v3, setV3] = useState<LoadedVehicle | null>(null)
  const [showThird, setShowThird] = useState(false)

  useEffect(() => {
    if (!initialCombinedSlug) return
    loadVehiclesFromSlugs([initialCombinedSlug]).then(([loaded]) => { if (loaded) setV1(loaded) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const allVehicles = [v1, v2, showThird ? v3 : null]
  const filled      = allVehicles.filter(Boolean) as LoadedVehicle[]
  const typeLabel   = TYPE_LABEL[vehicleType]
  const popular     = POPULAR_COMPARISONS_BY_TYPE[vehicleType]

  function navigateToComparison() {
    if (filled.length >= 2) router.push(buildTypedComparisonPath(basePath, filled))
  }

  useEffect(() => {
    if (filled.length >= 2) router.push(buildTypedComparisonPath(basePath, filled))
  }, [v1, v2, v3, showThird, basePath, router]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ background: '#06142D', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <StickyBar vehicles={allVehicles} onNavigate={navigateToComparison} />
      <div style={{ padding: '28px 20px 72px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#8E99A8', marginBottom: 24, alignItems: 'center' }}>
            <Link href="/" style={{ color: '#8E99A8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/compare" style={{ color: '#8E99A8', textDecoration: 'none' }}>Compare</Link>
            <span>›</span>
            <span style={{ color: '#00D4FF' }}>Compare {typeLabel}</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 28, fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px' }}>
              Compare <span style={{ color: '#00D4FF' }}>{typeLabel}</span>
            </h1>
            <p style={{ fontSize: 13, color: '#8E99A8', margin: 0 }}>
              Select brand → model → variant. Auto-compares when 2 are ready.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: showThird ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 14, marginBottom: 14, alignItems: 'start' }}>
            <VehicleSelector slot={1} vehicle={v1} vehicleType={vehicleType} onLoad={setV1} onClear={() => setV1(null)} />
            <VehicleSelector slot={2} vehicle={v2} vehicleType={vehicleType} onLoad={setV2} onClear={() => setV2(null)} />
            {showThird && <VehicleSelector slot={3} vehicle={v3} vehicleType={vehicleType} onLoad={setV3} onClear={() => setV3(null)} />}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            {!showThird ? (
              <button onClick={() => setShowThird(true)} style={{ background: 'rgba(0,212,255,0.05)', border: '1px dashed rgba(0,212,255,0.22)', color: '#8E99A8', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontSize: 12, fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                + Add 3rd {typeLabel.slice(0, -1).toLowerCase()}
              </button>
            ) : (
              <button onClick={() => { setShowThird(false); setV3(null) }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#8E99A8', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontSize: 12 }}>
                Remove 3rd vehicle
              </button>
            )}
          </div>

          <div style={{ textAlign: 'center', color: '#8E99A8', fontSize: 13, marginBottom: 36 }}>
            {filled.length === 0 && `Click a brand to start selecting ${typeLabel.toLowerCase()}`}
            {filled.length === 1 && 'Select one more vehicle — then pick a variant or skip'}
            {filled.length >= 2  && <span style={{ color: '#00D4FF' }}>Navigating to comparison…</span>}
          </div>

          <div style={{ background: 'rgba(0,212,255,0.02)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 14, padding: '18px 20px' }}>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 800, color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 12px' }}>
              Popular {typeLabel} Comparisons
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {popular.map(c => (
                <Link key={c.slug} href={`${basePath}/${c.slug}/`} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 7, padding: '7px 12px', textDecoration: 'none', fontSize: 12, color: '#C0C0C0' }}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
