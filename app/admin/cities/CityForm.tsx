'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toSlug } from '@/lib/utils'

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

function Toggle({ on, onChange, label, offLabel = 'Off' }: {
  on: boolean; onChange: (v: boolean) => void; label: string; offLabel?: string
}) {
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
        {on ? label : offLabel}
      </span>
    </div>
  )
}

// ─── redeploy ─────────────────────────────────────────────────────────────────

async function triggerRedeploy() {
  const hookUrl = process.env.NEXT_PUBLIC_VERCEL_DEPLOY_HOOK
  if (!hookUrl) return
  try { await fetch(hookUrl, { method: 'POST' }) } catch { /* non-fatal */ }
}

// ─── types ────────────────────────────────────────────────────────────────────

interface State { id: string; name: string; rto_percentage: number }

interface FormState {
  name: string
  slug: string
  state_id: string
  is_featured: boolean
  is_active: boolean
  population_tier: 'metro' | 'tier1' | 'tier2' | 'tier3'
}

const DEFAULT: FormState = {
  name: '', slug: '', state_id: '',
  is_featured: false, is_active: true,
  population_tier: 'tier2',
}

// ─── component ────────────────────────────────────────────────────────────────

export default function CityForm({ cityId }: { cityId?: string }) {
  const router  = useRouter()
  const isEdit  = !!cityId
  const sbRef   = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current

  const [form,    setForm]    = useState<FormState>(DEFAULT)
  const [states,  setStates]  = useState<State[]>([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean; deploy?: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok: boolean, deploy = false) => {
    setToast({ msg, ok, deploy })
    setTimeout(() => setToast(null), deploy ? 8000 : 4000)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: statesData }, cityResult] = await Promise.all([
        sb.from('states').select('id, name, rto_percentage').order('name'),
        cityId
          ? sb.from('cities').select('*').eq('id', cityId).single()
          : Promise.resolve({ data: null, error: null }),
      ])

      setStates((statesData ?? []) as State[])

      if (cityId) {
        const { data, error: err } = cityResult as { data: Record<string, unknown> | null; error: unknown }
        if (err || !data) { setError('City not found'); setLoading(false); return }
        setForm({
          name:            String(data.name ?? ''),
          slug:            String(data.slug ?? ''),
          state_id:        String(data.state_id ?? ''),
          is_featured:     Boolean(data.is_featured ?? false),
          is_active:       Boolean(data.is_active ?? true),
          population_tier: (data.population_tier as FormState['population_tier']) ?? 'tier2',
        })
      }
      setLoading(false)
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId])

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleNameChange(val: string) {
    set('name', val)
    if (!isEdit) set('slug', toSlug(val))
  }

  const selectedState = states.find(s => s.id === form.state_id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) { setError('City name is required'); return }
    if (!form.slug.trim() || !/^[a-z0-9-]+$/.test(form.slug)) {
      setError('Slug must be lowercase letters, numbers and hyphens only')
      return
    }
    if (!form.state_id) { setError('Please select a state'); return }

    setSaving(true)
    try {
      const payload = {
        name:            form.name.trim(),
        slug:            form.slug.trim(),
        state_id:        form.state_id,
        is_featured:     form.is_featured,
        is_active:       form.is_active,
        population_tier: form.population_tier,
      }

      if (isEdit) {
        const { error: uErr } = await sb.from('cities').update(payload).eq('id', cityId!)
        if (uErr) throw new Error(uErr.message)
      } else {
        const { error: iErr } = await sb.from('cities').insert(payload)
        if (iErr) throw new Error(iErr.message)
      }

      await triggerRedeploy()
      showToast(
        `✅ Saved. New city pages will be live in ~2 minutes.`,
        true, true
      )
      setTimeout(() => { router.push('/admin/cities'); router.refresh() }, 1400)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      showToast(msg, false)
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!cityId || !window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return
    setSaving(true)
    try {
      const { error: dErr } = await sb.from('cities').delete().eq('id', cityId)
      if (dErr) throw new Error(dErr.message)
      router.push('/admin/cities')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: '#8E99A8', fontSize: 14 }}>Loading…</div>
  }

  return (
    <div style={{ maxWidth: '560px' }}>

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
          maxWidth: 380,
        }}>
          {toast.msg}
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
          {isEdit ? 'Edit City' : 'New City'}
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
        <div style={CARD}>
          <p style={CARD_TITLE}>City Details</p>

          {/* Name + Slug */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="City Name *">
              <input type="text" value={form.name} required
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Pune"
                style={INPUT} />
            </Field>
            <Field label="Slug *" hint="Auto-generated from name">
              <input type="text" value={form.slug} required
                onChange={e => set('slug', e.target.value)}
                placeholder="e.g. pune"
                style={{ ...INPUT, fontFamily: 'monospace' }} />
            </Field>
          </div>

          {/* State selector */}
          <Field label="State *" hint={
            selectedState ? `RTO rate: ${selectedState.rto_percentage}% (inherited from state)` : 'RTO % is taken from the selected state'
          }>
            <select
              value={form.state_id}
              onChange={e => set('state_id', e.target.value)}
              required
              style={{ ...INPUT, cursor: 'pointer', appearance: 'none' }}
            >
              <option value="" style={{ background: '#0A1F44' }}>— Select a state —</option>
              {states.map(s => (
                <option key={s.id} value={s.id} style={{ background: '#0A1F44' }}>
                  {s.name} ({s.rto_percentage}%)
                </option>
              ))}
            </select>
          </Field>

          {/* Population Tier */}
          <Field label="Population Tier" hint="Used for SEO prioritisation and sitemap weighting">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['metro', 'tier1', 'tier2', 'tier3'] as const).map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => set('population_tier', tier)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    border: '1px solid',
                    background: form.population_tier === tier ? '#00D4FF' : 'rgba(0,212,255,0.06)',
                    color: form.population_tier === tier ? '#06142D' : '#C0C0C0',
                    borderColor: form.population_tier === tier ? 'transparent' : 'rgba(0,212,255,0.12)',
                  }}
                >
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Toggles card */}
        <div style={CARD}>
          <p style={CARD_TITLE}>Visibility</p>

          <Field label="Featured" hint="Featured cities appear in the on-road price calculator dropdown">
            <Toggle on={form.is_featured} onChange={v => set('is_featured', v)} label="Featured" offLabel="Not featured" />
          </Field>

          <Field label="Active" hint="Inactive cities are hidden from all public pages">
            <Toggle on={form.is_active} onChange={v => set('is_active', v)} label="Active" offLabel="Inactive" />
          </Field>
        </div>

        {/* Deploy note */}
        <div style={{
          background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
          fontSize: 12, color: '#8E99A8',
        }}>
          💡 Saving triggers a Vercel deploy. New city price pages will be live in ~2 minutes.
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
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create City'}
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
