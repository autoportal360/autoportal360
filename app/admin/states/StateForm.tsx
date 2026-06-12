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
        {on ? label : 'Inactive'}
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

interface FormState {
  name: string
  slug: string
  rto_percentage: string
  handling_charge: string
  is_active: boolean
}

const DEFAULT: FormState = {
  name: '', slug: '', rto_percentage: '', handling_charge: '', is_active: true,
}

// ─── component ────────────────────────────────────────────────────────────────

export default function StateForm({ stateId }: { stateId?: string }) {
  const router  = useRouter()
  const isEdit  = !!stateId
  const sbRef   = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current

  const [form,    setForm]    = useState<FormState>(DEFAULT)
  const [loading, setLoading] = useState(isEdit)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean; deploy?: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok: boolean, deploy = false) => {
    setToast({ msg, ok, deploy })
    setTimeout(() => setToast(null), deploy ? 8000 : 4000)
  }, [])

  useEffect(() => {
    if (!stateId) return
    sb.from('states').select('*').eq('id', stateId).single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError('State not found'); setLoading(false); return }
        setForm({
          name:            data.name,
          slug:            data.slug,
          rto_percentage:  String(data.rto_percentage ?? ''),
          handling_charge: String(data.handling_charge ?? ''),
          is_active:       data.is_active ?? true,
        })
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId])

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleNameChange(val: string) {
    set('name', val)
    if (!isEdit) set('slug', toSlug(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.slug.trim() || !/^[a-z0-9-]+$/.test(form.slug)) {
      setError('Slug must be lowercase letters, numbers and hyphens only')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name:            form.name.trim(),
        slug:            form.slug.trim(),
        rto_percentage:  form.rto_percentage  ? Number(form.rto_percentage)  : 0,
        handling_charge: form.handling_charge ? Number(form.handling_charge) : 0,
        is_active:       form.is_active,
      }

      if (isEdit) {
        const { error: uErr } = await sb.from('states').update(payload).eq('id', stateId!)
        if (uErr) throw new Error(uErr.message)
      } else {
        const { error: iErr } = await sb.from('states').insert(payload)
        if (iErr) throw new Error(iErr.message)
      }

      await triggerRedeploy()
      showToast(
        isEdit ? 'State saved! City price pages will rebuild in ~2 minutes.' : 'State created! Deploy triggered.',
        true, true
      )
      setTimeout(() => { router.push('/admin/states'); router.refresh() }, 1400)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      showToast(msg, false)
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!stateId || !window.confirm(`Delete "${form.name}"? Cities in this state will lose their RTO data.`)) return
    setSaving(true)
    try {
      const { error: dErr } = await sb.from('states').delete().eq('id', stateId)
      if (dErr) throw new Error(dErr.message)
      router.push('/admin/states')
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
          maxWidth: 360,
        }}>
          {toast.deploy ? '✅ ' : toast.ok ? '✓ ' : '✗ '}{toast.msg}
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
          {isEdit ? 'Edit State' : 'New State'}
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
          <p style={CARD_TITLE}>State Details</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="State Name *">
              <input type="text" value={form.name} required
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Maharashtra"
                style={INPUT} />
            </Field>
            <Field label="Slug *" hint="URL-safe, auto-generated from name">
              <input type="text" value={form.slug} required
                onChange={e => set('slug', e.target.value)}
                placeholder="e.g. maharashtra"
                style={{ ...INPUT, fontFamily: 'monospace' }} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="RTO Percentage (%)" hint="e.g. 11 for 11% road tax">
              <input type="number" value={form.rto_percentage} min={0} max={25} step={0.5}
                onChange={e => set('rto_percentage', e.target.value)}
                placeholder="e.g. 11"
                style={INPUT} />
            </Field>
            <Field label="Handling Charge (₹)" hint="Fixed charge added to on-road price">
              <input type="number" value={form.handling_charge} min={0}
                onChange={e => set('handling_charge', e.target.value)}
                placeholder="e.g. 2500"
                style={INPUT} />
            </Field>
          </div>

          <Field label="Status">
            <Toggle on={form.is_active} onChange={v => set('is_active', v)} label="Active" />
          </Field>
        </div>

        {/* ── Deploy note ── */}
        <div style={{
          background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
          fontSize: 12, color: '#8E99A8',
        }}>
          💡 Saving triggers a Vercel deploy. Updated RTO rates will be live on all city price pages in ~2 minutes.
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
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create State'}
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
