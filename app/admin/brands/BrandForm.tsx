'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import type { Brand } from '@/types'
import { toSlug } from '@/lib/utils'

// ─── shared style tokens ──────────────────────────────────────────────────────

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

const ERR: React.CSSProperties = {
  fontSize: '11px', color: '#FF6B6B', marginTop: '4px',
}

// ─── helper component ─────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={LABEL}>{label}</label>
      {children}
      {error && <p style={ERR}>{error}</p>}
    </div>
  )
}

// ─── types ────────────────────────────────────────────────────────────────────

interface Props {
  brandId?: string
}

interface FormState {
  name: string
  slug: string
  type: Brand['type']
  tagline: string
  country: string
  founded_year: string
  price_min: string
  price_max: string
  is_active: boolean
  sort_order: string
}

const DEFAULT: FormState = {
  name: '', slug: '', type: 'car',
  tagline: '', country: 'India',
  founded_year: '', price_min: '', price_max: '',
  is_active: true, sort_order: '0',
}

// ─── main component ───────────────────────────────────────────────────────────

export default function BrandForm({ brandId }: Props) {
  const router     = useRouter()
  const isEdit     = !!brandId
  const supabaseRef = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )
  const sb = supabaseRef.current

  const [form, setForm]             = useState<FormState>(DEFAULT)
  const [existingLogo, setExistingLogo] = useState<string | null>(null)
  const [logoFile, setLogoFile]     = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading]       = useState(isEdit)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  // Fetch existing brand in edit mode
  useEffect(() => {
    if (!brandId) return
    sb.from('brands').select('*').eq('id', brandId).single()
      .then(({ data, error: e }) => {
        if (e || !data) { setError('Brand not found'); setLoading(false); return }
        setForm({
          name:         data.name,
          slug:         data.slug,
          type:         data.type,
          tagline:      data.tagline      ?? '',
          country:      data.country      ?? 'India',
          founded_year: data.founded_year?.toString() ?? '',
          price_min:    data.price_min?.toString()    ?? '',
          price_max:    data.price_max?.toString()    ?? '',
          is_active:    data.is_active,
          sort_order:   data.sort_order.toString(),
        })
        setExistingLogo(data.logo_url)
        setLogoPreview(data.logo_url)
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId])

  // ── field helpers ────────────────────────────────────────────────────────────

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
    setFieldErrors(e => ({ ...e, [key]: undefined }))
  }

  function handleNameChange(val: string) {
    set('name', val)
    if (!isEdit) set('slug', toSlug(val))
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    setLogoPreview(URL.createObjectURL(file))
  }

  // ── logo upload ──────────────────────────────────────────────────────────────

  async function uploadLogo(slug: string): Promise<string | null> {
    if (!logoFile) return existingLogo

    const ext  = logoFile.name.split('.').pop() ?? 'jpg'
    const path = `${slug}/logo.${ext}`

    const { error: upErr } = await sb.storage
      .from('brands')
      .upload(path, logoFile, { contentType: logoFile.type, upsert: true })

    if (upErr) throw new Error(`Logo upload: ${upErr.message}`)

    const { data } = sb.storage.from('brands').getPublicUrl(path)
    return data.publicUrl
  }

  // ── validation ───────────────────────────────────────────────────────────────

  function validate(): Partial<Record<keyof FormState, string>> {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim())  errs.name = 'Name is required'
    if (!form.slug.trim())  errs.slug = 'Slug is required'
    if (!/^[a-z0-9-]+$/.test(form.slug))
      errs.slug = 'Lowercase letters, numbers and hyphens only'
    if (form.price_min && form.price_max &&
        Number(form.price_min) > Number(form.price_max))
      errs.price_max = 'Max must be ≥ Min'
    return errs
  }

  // ── submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setSaving(true)
    try {
      const logo_url = await uploadLogo(form.slug)

      const payload = {
        name:         form.name.trim(),
        slug:         form.slug.trim(),
        type:         form.type,
        tagline:      form.tagline.trim()     || null,
        country:      form.country.trim()     || null,
        founded_year: form.founded_year ? Number(form.founded_year) : null,
        price_min:    form.price_min    ? Number(form.price_min)    : null,
        price_max:    form.price_max    ? Number(form.price_max)    : null,
        is_active:    form.is_active,
        sort_order:   Number(form.sort_order) || 0,
        logo_url,
      }

      const { error: dbErr } = isEdit
        ? await sb.from('brands').update(payload).eq('id', brandId!)
        : await sb.from('brands').insert(payload)

      if (dbErr) throw new Error(dbErr.message)

      router.push('/admin/brands')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  // ── delete ───────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!brandId || !window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return

    setSaving(true)
    try {
      const { count } = await sb
        .from('models')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId)

      if (count && count > 0) {
        setError(`Cannot delete: this brand has ${count} model${count > 1 ? 's' : ''}. Remove them first.`)
        setSaving(false)
        return
      }

      const { error: dErr } = await sb.from('brands').delete().eq('id', brandId)
      if (dErr) throw new Error(dErr.message)

      router.push('/admin/brands')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setSaving(false)
    }
  }

  // ── loading state ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#8E99A8', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  // ── render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '700px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px',
      }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: 'rgba(255,255,255,0.04)', color: '#8E99A8',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '8px 14px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: 24,
          fontWeight: 900, color: '#FFFFFF', margin: 0, flex: 1,
        }}>
          {isEdit ? 'Edit Brand' : 'New Brand'}
        </h1>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            style={{
              background: 'rgba(255,80,80,0.08)', color: '#FF8080',
              border: '1px solid rgba(255,80,80,0.2)',
              borderRadius: '8px', padding: '8px 16px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Delete
          </button>
        )}
      </div>

      {/* Global error */}
      {error && (
        <div style={{
          background: 'rgba(255,80,80,0.08)',
          border: '1px solid rgba(255,80,80,0.25)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '24px',
          fontSize: 13, color: '#FF6B6B',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ── Core fields card ── */}
        <div style={{
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: '16px', padding: '28px', marginBottom: '16px',
        }}>
          <p style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: 13,
            fontWeight: 800, color: '#8E99A8', margin: '0 0 20px',
            textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            Basic Info
          </p>

          {/* Name + Slug */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Name *" error={fieldErrors.name}>
              <input
                type="text" value={form.name} required
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Tata Motors"
                style={{
                  ...INPUT,
                  borderColor: fieldErrors.name ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)',
                }}
              />
            </Field>

            <Field label="Slug *" error={fieldErrors.slug}>
              <input
                type="text" value={form.slug} required
                onChange={e => set('slug', e.target.value)}
                placeholder="e.g. tata"
                style={{
                  ...INPUT, fontFamily: 'monospace',
                  borderColor: fieldErrors.slug ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)',
                }}
              />
            </Field>
          </div>

          {/* Type */}
          <Field label="Type *">
            <select
              value={form.type}
              onChange={e => set('type', e.target.value as Brand['type'])}
              style={{ ...INPUT, cursor: 'pointer' }}
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="scooter">Scooter</option>
            </select>
          </Field>

          {/* Tagline */}
          <Field label="Tagline">
            <input
              type="text" value={form.tagline}
              onChange={e => set('tagline', e.target.value)}
              placeholder="e.g. Connecting Aspirations"
              style={INPUT}
            />
          </Field>

          {/* Country + Founded Year */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Country">
              <input
                type="text" value={form.country}
                onChange={e => set('country', e.target.value)}
                placeholder="India"
                style={INPUT}
              />
            </Field>
            <Field label="Founded Year">
              <input
                type="number" value={form.founded_year}
                onChange={e => set('founded_year', e.target.value)}
                placeholder="e.g. 1945"
                min={1800} max={2030}
                style={INPUT}
              />
            </Field>
          </div>

          {/* Price Min + Max */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Price Min (₹)">
              <input
                type="number" value={form.price_min}
                onChange={e => set('price_min', e.target.value)}
                placeholder="e.g. 500000"
                min={0}
                style={INPUT}
              />
            </Field>
            <Field label="Price Max (₹)" error={fieldErrors.price_max}>
              <input
                type="number" value={form.price_max}
                onChange={e => set('price_max', e.target.value)}
                placeholder="e.g. 5000000"
                min={0}
                style={{
                  ...INPUT,
                  borderColor: fieldErrors.price_max ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)',
                }}
              />
            </Field>
          </div>

          {/* Sort Order + Active toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 0 }}>
            <Field label="Sort Order">
              <input
                type="number" value={form.sort_order}
                onChange={e => set('sort_order', e.target.value)}
                min={0}
                style={INPUT}
              />
            </Field>

            <Field label="Status">
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                paddingTop: '6px',
              }}>
                {/* Toggle pill */}
                <button
                  type="button"
                  onClick={() => set('is_active', !form.is_active)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none',
                    cursor: 'pointer', position: 'relative', flexShrink: 0,
                    background: form.is_active ? '#00D4FF' : 'rgba(255,255,255,0.12)',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3,
                    left: form.is_active ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#FFFFFF',
                    transition: 'left 0.15s',
                  }} />
                </button>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: form.is_active ? '#00D4FF' : '#8E99A8',
                }}>
                  {form.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Field>
          </div>
        </div>

        {/* ── Logo card ── */}
        <div style={{
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: '16px', padding: '28px', marginBottom: '24px',
        }}>
          <p style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: 13,
            fontWeight: 800, color: '#8E99A8', margin: '0 0 20px',
            textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            Logo
          </p>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* Preview box */}
            <div style={{
              width: 88, height: 88, borderRadius: 12, flexShrink: 0,
              background: logoPreview ? '#FFFFFF' : 'rgba(0,212,255,0.04)',
              border: logoPreview ? 'none' : '2px dashed rgba(0,212,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {logoPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, boxSizing: 'border-box' }}
                />
              ) : (
                <span style={{ fontSize: 11, color: '#8E99A8' }}>No logo</span>
              )}
            </div>

            {/* File input */}
            <div style={{ flex: 1 }}>
              <label style={LABEL}>
                {isEdit && existingLogo ? 'Replace Logo' : 'Upload Logo'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{
                  display: 'block', width: '100%', boxSizing: 'border-box',
                  background: 'rgba(0,212,255,0.04)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '10px', padding: '9px 14px',
                  color: '#8E99A8', fontSize: 13, cursor: 'pointer',
                }}
              />
              <p style={{ fontSize: 11, color: '#8E99A8', margin: '6px 0 0' }}>
                JPG, PNG, SVG or WebP. Stored at brands/{form.slug || '{slug}'}/logo.ext
              </p>
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: saving ? 'rgba(0,212,255,0.35)' : '#00D4FF',
              color: '#06142D',
              fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
              fontSize: 14, padding: '12px 32px',
              borderRadius: '10px', border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Brand'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            style={{
              background: 'rgba(255,255,255,0.04)', color: '#C0C0C0',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '12px 24px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
