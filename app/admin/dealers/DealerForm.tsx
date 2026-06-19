'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toSlug } from '@/lib/utils'
import { dbInsert, dbUpdate, dbDelete } from '@/lib/admin-db'
import {
  type DealerFormData,
  type VehicleType,
  EMPTY_DEALER_FORM,
  INDIAN_STATES,
} from '@/types/dealer'

// ─── style tokens ──────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(0,212,255,0.04)',
  border: '1px solid rgba(0,212,255,0.15)',
  borderRadius: '10px', padding: '10px 14px',
  color: '#FFFFFF', fontSize: '14px', outline: 'none',
  fontFamily: 'system-ui, sans-serif',
}

const LABEL: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#8E99A8', marginBottom: '6px',
  textTransform: 'uppercase', letterSpacing: '0.8px',
}

const CARD: React.CSSProperties = {
  background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
  borderRadius: '16px', padding: '28px', marginBottom: '16px',
}

const CARD_TITLE: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif', fontSize: 13,
  fontWeight: 800, color: '#8E99A8', margin: '0 0 20px',
  textTransform: 'uppercase', letterSpacing: '1px',
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={LABEL}>{label}</label>
      {children}
      {hint  && <p style={{ fontSize: 11, color: '#8E99A8', margin: '5px 0 0' }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: '#FF6B6B', margin: '4px 0 0' }}>{error}</p>}
    </div>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: 6 }}>
      <button type="button" onClick={() => onChange(!on)} style={{
        width: 44, height: 24, borderRadius: 12, border: 'none',
        cursor: 'pointer', position: 'relative', flexShrink: 0,
        background: on ? '#00D4FF' : 'rgba(255,255,255,0.12)',
        transition: 'background 0.2s',
      }}>
        <span style={{
          position: 'absolute', top: 3,
          left: on ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#FFFFFF',
          transition: 'left 0.15s',
        }} />
      </button>
      <span style={{ fontSize: 13, fontWeight: 600, color: on ? '#00D4FF' : '#8E99A8' }}>
        {on ? label : 'No'}
      </span>
    </div>
  )
}

const VEHICLE_TYPES: VehicleType[] = ['cars', 'bikes', 'scooters']

// ─── component ────────────────────────────────────────────────────────────────

export default function DealerForm({ dealerId }: { dealerId?: string }) {
  const router  = useRouter()
  const isEdit  = !!dealerId
  const sbRef   = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current

  const [form,    setForm]    = useState<DealerFormData>(EMPTY_DEALER_FORM)
  const [slug,    setSlug]    = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  useEffect(() => {
    if (!dealerId) return
    sb.from('dealers').select('*').eq('id', dealerId).single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError('Dealer not found'); setLoading(false); return }
        setSlug(data.slug)
        setForm({
          name:           data.name,
          brand_slug:     data.brand_slug,
          brand_name:     data.brand_name,
          city:           data.city,
          city_slug:      data.city_slug,
          state:          data.state,
          address:        data.address ?? '',
          locality:       data.locality ?? '',
          pincode:        data.pincode ?? '',
          phone:          data.phone ?? '',
          email:          data.email ?? '',
          website:        data.website ?? '',
          google_maps_url: data.google_maps_url ?? '',
          vehicle_types:  (data.vehicle_types ?? ['cars']) as VehicleType[],
          is_authorized:  data.is_authorized ?? true,
          is_active:      data.is_active ?? true,
          working_hours:  data.working_hours ?? EMPTY_DEALER_FORM.working_hours,
        })
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId])

  function set<K extends keyof DealerFormData>(key: K, val: DealerFormData[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleNameChange(val: string) {
    set('name', val)
    if (!isEdit) setSlug(toSlug(val))
  }

  function handleCityChange(val: string) {
    set('city', val)
    if (!isEdit) set('city_slug', toSlug(val))
  }

  function handleBrandNameChange(val: string) {
    set('brand_name', val)
    if (!isEdit) set('brand_slug', toSlug(val))
  }

  function toggleVehicleType(t: VehicleType) {
    setForm(f => ({
      ...f,
      vehicle_types: f.vehicle_types.includes(t)
        ? f.vehicle_types.filter(v => v !== t)
        : [...f.vehicle_types, t],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim())       { setError('Name is required'); return }
    if (!slug.trim())            { setError('Slug is required'); return }
    if (!form.brand_slug.trim()) { setError('Brand slug is required'); return }
    if (!form.brand_name.trim()) { setError('Brand name is required'); return }
    if (!form.city.trim())       { setError('City is required'); return }
    if (!form.city_slug.trim())  { setError('City slug is required'); return }
    if (!form.state.trim())      { setError('State is required'); return }
    if (form.vehicle_types.length === 0) { setError('Select at least one vehicle type'); return }

    setSaving(true)
    try {
      const payload = {
        name:            form.name.trim(),
        slug:            slug.trim(),
        brand_slug:      form.brand_slug.trim(),
        brand_name:      form.brand_name.trim(),
        city:            form.city.trim(),
        city_slug:       form.city_slug.trim(),
        state:           form.state.trim(),
        address:         form.address.trim(),
        locality:        form.locality.trim() || null,
        pincode:         form.pincode.trim() || null,
        phone:           form.phone.trim() || null,
        email:           form.email.trim() || null,
        website:         form.website.trim() || null,
        google_maps_url: form.google_maps_url.trim() || null,
        vehicle_types:   form.vehicle_types,
        is_authorized:   form.is_authorized,
        is_active:       form.is_active,
        working_hours:   form.working_hours.trim() || null,
      }

      if (isEdit) {
        await dbUpdate('dealers', dealerId!, payload)
      } else {
        await dbInsert('dealers', payload)
      }

      showToast(isEdit ? 'Dealer saved!' : 'Dealer created!', true)
      setTimeout(() => { router.push('/admin/dealers'); router.refresh() }, 1200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      showToast(msg, false)
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!dealerId || !window.confirm(`Delete "${form.name}"?`)) return
    setSaving(true)
    try {
      await dbDelete('dealers', dealerId)
      router.push('/admin/dealers')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: '#8E99A8', fontSize: 14 }}>Loading…</div>
  }

  const SELECT_STYLE: React.CSSProperties = {
    ...INPUT,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238E99A8'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 32,
    cursor: 'pointer',
  }

  return (
    <div style={{ maxWidth: '720px' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toast.ok ? 'rgba(0,204,102,0.12)' : 'rgba(255,80,80,0.12)',
          border: `1px solid ${toast.ok ? 'rgba(0,204,102,0.35)' : 'rgba(255,80,80,0.35)'}`,
          color: toast.ok ? '#00CC66' : '#FF8080',
          padding: '14px 20px', borderRadius: 12,
          fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {toast.ok ? '✓ ' : '✗ '}{toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button type="button" onClick={() => router.back()} style={{
          background: 'rgba(255,255,255,0.04)', color: '#8E99A8',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', padding: '8px 14px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          ← Back
        </button>
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: 24,
          fontWeight: 900, color: '#FFFFFF', margin: 0, flex: 1,
        }}>
          {isEdit ? 'Edit Dealer' : 'New Dealer'}
        </h1>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={saving} style={{
            background: 'rgba(255,80,80,0.08)', color: '#FF8080',
            border: '1px solid rgba(255,80,80,0.2)',
            borderRadius: '8px', padding: '8px 16px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            Delete
          </button>
        )}
      </div>

      {/* ── Global error ── */}
      {error && (
        <div style={{
          background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '24px',
          fontSize: 13, color: '#FF6B6B',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ── Basic Info ── */}
        <div style={CARD}>
          <p style={CARD_TITLE}>Dealer Info</p>

          <Field label="Dealer Name *">
            <input type="text" value={form.name} required
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Tata Motors Delhi North"
              style={INPUT} />
          </Field>

          <Field label="Slug *" hint="URL-safe, auto-generated from name">
            <input type="text" value={slug} required
              onChange={e => setSlug(e.target.value)}
              placeholder="e.g. tata-motors-delhi-north"
              style={{ ...INPUT, fontFamily: 'monospace' }} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Brand Name *">
              <input type="text" value={form.brand_name} required
                onChange={e => handleBrandNameChange(e.target.value)}
                placeholder="e.g. Tata"
                style={INPUT} />
            </Field>
            <Field label="Brand Slug *" hint="Match brand slug in DB">
              <input type="text" value={form.brand_slug} required
                onChange={e => set('brand_slug', e.target.value)}
                placeholder="e.g. tata"
                style={{ ...INPUT, fontFamily: 'monospace' }} />
            </Field>
          </div>

          <Field label="Vehicle Types *">
            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              {VEHICLE_TYPES.map(t => {
                const active = form.vehicle_types.includes(t)
                return (
                  <button
                    key={t} type="button"
                    onClick={() => toggleVehicleType(t)}
                    style={{
                      padding: '7px 16px', borderRadius: 20, border: 'none',
                      cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      textTransform: 'capitalize',
                      background: active ? '#00D4FF' : 'rgba(0,212,255,0.07)',
                      color: active ? '#06142D' : '#8E99A8',
                    }}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </Field>
        </div>

        {/* ── Location ── */}
        <div style={CARD}>
          <p style={CARD_TITLE}>Location</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="City *">
              <input type="text" value={form.city} required
                onChange={e => handleCityChange(e.target.value)}
                placeholder="e.g. Delhi"
                style={INPUT} />
            </Field>
            <Field label="City Slug *">
              <input type="text" value={form.city_slug} required
                onChange={e => set('city_slug', e.target.value)}
                placeholder="e.g. delhi"
                style={{ ...INPUT, fontFamily: 'monospace' }} />
            </Field>
          </div>

          <Field label="State *">
            <select value={form.state} required onChange={e => set('state', e.target.value)} style={SELECT_STYLE}>
              <option value="">Select state…</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label="Address *">
            <input type="text" value={form.address} required
              onChange={e => set('address', e.target.value)}
              placeholder="e.g. Plot 12, Industrial Area"
              style={INPUT} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Locality">
              <input type="text" value={form.locality}
                onChange={e => set('locality', e.target.value)}
                placeholder="e.g. Wazirpur"
                style={INPUT} />
            </Field>
            <Field label="Pincode">
              <input type="text" value={form.pincode}
                onChange={e => set('pincode', e.target.value)}
                placeholder="e.g. 110052"
                style={{ ...INPUT, fontFamily: 'monospace' }} />
            </Field>
          </div>
        </div>

        {/* ── Contact ── */}
        <div style={CARD}>
          <p style={CARD_TITLE}>Contact</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Phone">
              <input type="text" value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="e.g. 011-12345678"
                style={{ ...INPUT, fontFamily: 'monospace' }} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="e.g. dealer@tata.com"
                style={INPUT} />
            </Field>
          </div>

          <Field label="Website">
            <input type="url" value={form.website}
              onChange={e => set('website', e.target.value)}
              placeholder="https://…"
              style={{ ...INPUT, fontFamily: 'monospace' }} />
          </Field>

          <Field label="Google Maps URL">
            <input type="url" value={form.google_maps_url}
              onChange={e => set('google_maps_url', e.target.value)}
              placeholder="https://maps.google.com/…"
              style={{ ...INPUT, fontFamily: 'monospace' }} />
          </Field>

          <Field label="Working Hours">
            <input type="text" value={form.working_hours}
              onChange={e => set('working_hours', e.target.value)}
              placeholder="e.g. Mon-Sat: 9 AM – 7 PM"
              style={INPUT} />
          </Field>
        </div>

        {/* ── Status ── */}
        <div style={CARD}>
          <p style={CARD_TITLE}>Status</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Authorized Dealer">
              <Toggle on={form.is_authorized} onChange={v => set('is_authorized', v)} label="Authorized" />
            </Field>
            <Field label="Active">
              <Toggle on={form.is_active} onChange={v => set('is_active', v)} label="Active" />
            </Field>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={saving} style={{
            background: saving ? 'rgba(0,212,255,0.35)' : '#00D4FF',
            color: '#06142D',
            fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
            fontSize: 14, padding: '12px 32px',
            borderRadius: '10px', border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Dealer'}
          </button>
          <button type="button" onClick={() => router.back()} disabled={saving} style={{
            background: 'rgba(255,255,255,0.04)', color: '#C0C0C0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', padding: '12px 24px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
