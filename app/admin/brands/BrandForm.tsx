'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Brand } from '@/types'
import { toSlug } from '@/lib/utils'

// ─── style tokens ─────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(0,212,255,0.04)',
  border: '1px solid rgba(0,212,255,0.15)',
  borderRadius: '10px', padding: '10px 14px',
  color: '#FFFFFF', fontSize: '14px', outline: 'none',
  fontFamily: 'system-ui, sans-serif',
}

const TEXTAREA: React.CSSProperties = {
  ...INPUT, resize: 'vertical' as const, lineHeight: '1.6',
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

// ─── helper components ────────────────────────────────────────────────────────

function Field({
  label, hint, error, counter, children,
}: {
  label: string
  hint?: string
  error?: string
  counter?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={LABEL}>{label}</label>
        {counter}
      </div>
      {children}
      {hint  && <p style={{ fontSize: 11, color: '#8E99A8', margin: '5px 0 0' }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: '#FF6B6B', margin: '4px 0 0' }}>{error}</p>}
    </div>
  )
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len  = value.length
  const warn = len > max * 0.85
  const over = len > max
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
      color: over ? '#FF6B6B' : warn ? '#FFB400' : '#8E99A8',
    }}>
      {len}/{max}
    </span>
  )
}

// ─── types ────────────────────────────────────────────────────────────────────

interface Faq {
  id?: string
  question: string
  answer: string
}

interface FormState {
  name: string; slug: string; type: Brand['type']
  tagline: string; country: string
  founded_year: string; price_min: string; price_max: string
  is_active: boolean; sort_order: string
  meta_title: string; meta_description: string
  overview_html: string; schema_json: string
}

const DEFAULT: FormState = {
  name: '', slug: '', type: 'car',
  tagline: '', country: 'India',
  founded_year: '', price_min: '', price_max: '',
  is_active: true, sort_order: '0',
  meta_title: '', meta_description: '',
  overview_html: '', schema_json: '',
}

// ─── main component ───────────────────────────────────────────────────────────

export default function BrandForm({ brandId }: { brandId?: string }) {
  const router  = useRouter()
  const isEdit  = !!brandId
  const sbRef   = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current

  const [form, setForm]             = useState<FormState>(DEFAULT)
  const [existingLogo, setExistingLogo] = useState<string | null>(null)
  const [logoFile, setLogoFile]     = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faqs, setFaqs]             = useState<Faq[]>([])
  const [loading, setLoading]       = useState(isEdit)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null)

  // ── toast helper ──────────────────────────────────────────────────────────────

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── fetch brand + FAQs ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!brandId) return
    Promise.all([
      sb.from('brands').select('*').eq('id', brandId).single(),
      sb.from('brand_faqs').select('*').eq('brand_id', brandId).order('sort_order'),
    ]).then(([{ data: b, error: bErr }, { data: faqData }]) => {
      if (bErr || !b) { setError('Brand not found'); setLoading(false); return }
      setForm({
        name:            b.name,
        slug:            b.slug,
        type:            b.type,
        tagline:         b.tagline         ?? '',
        country:         b.country         ?? 'India',
        founded_year:    b.founded_year?.toString()    ?? '',
        price_min:       b.price_min?.toString()       ?? '',
        price_max:       b.price_max?.toString()       ?? '',
        is_active:       b.is_active,
        sort_order:      b.sort_order.toString(),
        meta_title:      (b as Record<string, unknown>).meta_title       as string ?? '',
        meta_description:(b as Record<string, unknown>).meta_description as string ?? '',
        overview_html:   (b as Record<string, unknown>).overview_html    as string ?? '',
        schema_json:     (b as Record<string, unknown>).schema_json      as string ?? '',
      })
      setExistingLogo(b.logo_url)
      setLogoPreview(b.logo_url)
      setFaqs((faqData ?? []).map(f => ({
        id: f.id, question: f.question, answer: f.answer,
      })))
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId])

  // ── field helpers ─────────────────────────────────────────────────────────────

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

  // ── FAQ helpers ───────────────────────────────────────────────────────────────

  function addFaq() {
    setFaqs(f => [...f, { question: '', answer: '' }])
  }

  function updateFaq(i: number, key: 'question' | 'answer', val: string) {
    setFaqs(f => f.map((faq, idx) => idx === i ? { ...faq, [key]: val } : faq))
  }

  function removeFaq(i: number) {
    setFaqs(f => f.filter((_, idx) => idx !== i))
  }

  // ── logo upload ───────────────────────────────────────────────────────────────

  async function uploadLogo(slug: string): Promise<string | null> {
    if (!logoFile) return existingLogo
    const ext  = logoFile.name.split('.').pop() ?? 'jpg'
    const path = `${slug}/logo.${ext}`
    const { error: upErr } = await sb.storage
      .from('brands').upload(path, logoFile, { contentType: logoFile.type, upsert: true })
    if (upErr) throw new Error(`Logo upload: ${upErr.message}`)
    const { data } = sb.storage.from('brands').getPublicUrl(path)
    return data.publicUrl
  }

  // ── FAQ save (delete-then-insert) ─────────────────────────────────────────────

  async function saveFaqs(bId: string) {
    await sb.from('brand_faqs').delete().eq('brand_id', bId)
    const valid = faqs.filter(f => f.question.trim() && f.answer.trim())
    if (!valid.length) return
    const { error: fErr } = await sb.from('brand_faqs').insert(
      valid.map((f, i) => ({
        brand_id: bId, question: f.question.trim(),
        answer: f.answer.trim(), sort_order: i,
      }))
    )
    if (fErr) throw new Error(`FAQ save: ${fErr.message}`)
  }

  // ── validation ────────────────────────────────────────────────────────────────

  function validate(): Partial<Record<keyof FormState, string>> {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.slug.trim()) errs.slug = 'Slug is required'
    if (!/^[a-z0-9-]+$/.test(form.slug))
      errs.slug = 'Lowercase letters, numbers and hyphens only'
    if (form.price_min && form.price_max &&
        Number(form.price_min) > Number(form.price_max))
      errs.price_max = 'Max must be ≥ Min'
    if (form.meta_title.length > 60)
      errs.meta_title = 'Must be 60 characters or fewer'
    if (form.meta_description.length > 160)
      errs.meta_description = 'Must be 160 characters or fewer'
    if (form.schema_json.trim()) {
      try { JSON.parse(form.schema_json) }
      catch { errs.schema_json = 'Invalid JSON — check syntax' }
    }
    return errs
  }

  // ── submit ────────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setSaving(true)
    try {
      const logo_url = await uploadLogo(form.slug)

      const payload = {
        name:             form.name.trim(),
        slug:             form.slug.trim(),
        type:             form.type,
        tagline:          form.tagline.trim()          || null,
        country:          form.country.trim()          || null,
        founded_year:     form.founded_year ? Number(form.founded_year) : null,
        price_min:        form.price_min    ? Number(form.price_min)    : null,
        price_max:        form.price_max    ? Number(form.price_max)    : null,
        is_active:        form.is_active,
        sort_order:       Number(form.sort_order) || 0,
        logo_url,
        meta_title:       form.meta_title.trim()       || null,
        meta_description: form.meta_description.trim() || null,
        overview_html:    form.overview_html.trim()    || null,
        schema_json:      form.schema_json.trim()      || null,
      }

      let savedId = brandId

      if (isEdit) {
        const { data: updated, error: uErr } = await sb
          .from('brands').update(payload).eq('id', brandId!).select('id')
        if (uErr) throw new Error(uErr.message)
        if (!updated?.length) throw new Error('Save failed — run the RLS migration in Supabase SQL Editor (supabase/20260613_disable_rls_core_tables.sql)')
      } else {
        const { data, error: iErr } = await sb.from('brands').insert(payload).select('id').single()
        if (iErr) throw new Error(iErr.message)
        savedId = data?.id
      }

      if (savedId) await saveFaqs(savedId)

      if (isEdit) {
        showToast('Brand saved successfully!', true)
        setSaving(false)
      } else {
        showToast('Brand created!', true)
        setTimeout(() => { router.push('/admin/brands'); router.refresh() }, 1200)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      showToast(msg, false)
      setSaving(false)
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!brandId || !window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return
    setSaving(true)
    try {
      const { count } = await sb.from('models')
        .select('*', { count: 'exact', head: true }).eq('brand_id', brandId)
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

  // ── loading ───────────────────────────────────────────────────────────────────

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
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>{toast.ok ? '✓' : '✗'}</span>
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
          {isEdit ? 'Edit Brand' : 'New Brand'}
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

        {/* ══ SECTION 1: Basic Info ══════════════════════════════════════════════ */}
        <div style={CARD}>
          <p style={CARD_TITLE}>Basic Info</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Name *" error={fieldErrors.name}>
              <input type="text" value={form.name} required
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Tata Motors"
                style={{ ...INPUT, borderColor: fieldErrors.name ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }}
              />
            </Field>
            <Field label="Slug *" error={fieldErrors.slug}>
              <input type="text" value={form.slug} required
                onChange={e => set('slug', e.target.value)}
                placeholder="e.g. tata"
                style={{ ...INPUT, fontFamily: 'monospace', borderColor: fieldErrors.slug ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }}
              />
            </Field>
          </div>

          <Field label="Type *">
            <select value={form.type}
              onChange={e => set('type', e.target.value as Brand['type'])}
              style={{ ...INPUT, cursor: 'pointer' }}>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="scooter">Scooter</option>
            </select>
          </Field>

          <Field label="Tagline">
            <input type="text" value={form.tagline}
              onChange={e => set('tagline', e.target.value)}
              placeholder="e.g. Connecting Aspirations"
              style={INPUT} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Country">
              <input type="text" value={form.country}
                onChange={e => set('country', e.target.value)}
                placeholder="India" style={INPUT} />
            </Field>
            <Field label="Founded Year">
              <input type="number" value={form.founded_year}
                onChange={e => set('founded_year', e.target.value)}
                placeholder="e.g. 1945" min={1800} max={2030} style={INPUT} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Price Min (₹)">
              <input type="number" value={form.price_min}
                onChange={e => set('price_min', e.target.value)}
                placeholder="e.g. 500000" min={0} style={INPUT} />
            </Field>
            <Field label="Price Max (₹)" error={fieldErrors.price_max}>
              <input type="number" value={form.price_max}
                onChange={e => set('price_max', e.target.value)}
                placeholder="e.g. 5000000" min={0}
                style={{ ...INPUT, borderColor: fieldErrors.price_max ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 0 }}>
            <Field label="Sort Order">
              <input type="number" value={form.sort_order}
                onChange={e => set('sort_order', e.target.value)}
                min={0} style={INPUT} />
            </Field>
            <Field label="Status">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: 6 }}>
                <button type="button" onClick={() => set('is_active', !form.is_active)} style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none',
                  cursor: 'pointer', position: 'relative', flexShrink: 0,
                  background: form.is_active ? '#00D4FF' : 'rgba(255,255,255,0.12)',
                  transition: 'background 0.2s',
                }}>
                  <span style={{
                    position: 'absolute', top: 3,
                    left: form.is_active ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: '#FFFFFF',
                    transition: 'left 0.15s',
                  }} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 600, color: form.is_active ? '#00D4FF' : '#8E99A8' }}>
                  {form.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Field>
          </div>
        </div>

        {/* ══ SECTION: Logo ══════════════════════════════════════════════════════ */}
        <div style={CARD}>
          <p style={CARD_TITLE}>Logo</p>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{
              width: 88, height: 88, borderRadius: 12, flexShrink: 0,
              background: logoPreview ? '#FFFFFF' : 'rgba(0,212,255,0.04)',
              border: logoPreview ? 'none' : '2px dashed rgba(0,212,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {logoPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoPreview} alt="Logo preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, boxSizing: 'border-box' }}
                />
              ) : (
                <span style={{ fontSize: 11, color: '#8E99A8' }}>No logo</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={LABEL}>{isEdit && existingLogo ? 'Replace Logo' : 'Upload Logo'}</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} style={{
                display: 'block', width: '100%', boxSizing: 'border-box',
                background: 'rgba(0,212,255,0.04)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: '10px', padding: '9px 14px',
                color: '#8E99A8', fontSize: 13, cursor: 'pointer',
              }} />
              <p style={{ fontSize: 11, color: '#8E99A8', margin: '6px 0 0' }}>
                JPG, PNG, SVG or WebP · stored at brands/{form.slug || '{slug}'}/logo.ext
              </p>
            </div>
          </div>
        </div>

        {/* ══ SECTION 2: SEO & Meta ══════════════════════════════════════════════ */}
        <div style={CARD}>
          <p style={CARD_TITLE}>SEO &amp; Meta</p>

          <Field
            label="Meta Title"
            error={fieldErrors.meta_title}
            counter={<CharCount value={form.meta_title} max={60} />}
          >
            <input
              type="text"
              value={form.meta_title}
              maxLength={70}
              onChange={e => set('meta_title', e.target.value)}
              placeholder="Tata Cars Price in India 2026 | AutoPortal360"
              style={{
                ...INPUT,
                borderColor: fieldErrors.meta_title ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)',
              }}
            />
          </Field>

          <Field
            label="Meta Description"
            error={fieldErrors.meta_description}
            counter={<CharCount value={form.meta_description} max={160} />}
          >
            <textarea
              value={form.meta_description}
              maxLength={180}
              rows={3}
              onChange={e => set('meta_description', e.target.value)}
              placeholder="Explore all Tata cars in India with prices, specs and variants. Compare Nexon, Punch, Harrier and more at AutoPortal360."
              style={{
                ...TEXTAREA,
                borderColor: fieldErrors.meta_description ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)',
              }}
            />
          </Field>

          <Field
            label="Brand Overview (supports HTML)"
            hint="Displayed on the brand landing page below the model grid."
          >
            <textarea
              value={form.overview_html}
              rows={6}
              onChange={e => set('overview_html', e.target.value)}
              placeholder="About this brand — you can use <strong>, <p>, <ul> etc."
              style={TEXTAREA}
            />
          </Field>
        </div>

        {/* ══ SECTION 3: FAQs ═══════════════════════════════════════════════════ */}
        <div style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <p style={{ ...CARD_TITLE, margin: 0 }}>FAQs</p>
            <button type="button" onClick={addFaq} style={{
              background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: '8px', padding: '7px 14px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              + Add FAQ
            </button>
          </div>

          {faqs.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '28px',
              border: '1px dashed rgba(0,212,255,0.15)', borderRadius: 12,
              color: '#8E99A8', fontSize: 13,
            }}>
              No FAQs yet. Click <strong style={{ color: '#00D4FF' }}>+ Add FAQ</strong> to add one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{
                  background: 'rgba(0,212,255,0.02)',
                  border: '1px solid rgba(0,212,255,0.1)',
                  borderRadius: '12px', padding: '18px',
                  position: 'relative',
                }}>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    title="Remove FAQ"
                    style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'rgba(255,80,80,0.08)', color: '#FF8080',
                      border: '1px solid rgba(255,80,80,0.2)',
                      borderRadius: '6px', width: 26, height: 26,
                      fontSize: 14, cursor: 'pointer', lineHeight: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>

                  <div style={{ marginBottom: '12px', paddingRight: '36px' }}>
                    <label style={LABEL}>Question {i + 1}</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={e => updateFaq(i, 'question', e.target.value)}
                      placeholder="e.g. Which Tata car is best for family use?"
                      style={INPUT}
                    />
                  </div>

                  <div>
                    <label style={LABEL}>Answer</label>
                    <textarea
                      value={faq.answer}
                      rows={3}
                      onChange={e => updateFaq(i, 'answer', e.target.value)}
                      placeholder="Write a clear, helpful answer…"
                      style={TEXTAREA}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {faqs.length > 0 && (
            <p style={{ fontSize: 11, color: '#8E99A8', margin: '12px 0 0' }}>
              {faqs.length} FAQ{faqs.length > 1 ? 's' : ''} · saved to brand_faqs table on submit
            </p>
          )}
        </div>

        {/* ══ SECTION 4: Schema Markup ═══════════════════════════════════════════ */}
        <div style={{ ...CARD, marginBottom: '24px' }}>
          <p style={CARD_TITLE}>Schema Markup</p>

          <Field
            label="Custom Schema JSON-LD"
            error={fieldErrors.schema_json}
            hint='Leave empty to use auto-generated schema. Paste valid JSON-LD only.'
          >
            <textarea
              value={form.schema_json}
              rows={10}
              onChange={e => set('schema_json', e.target.value)}
              spellCheck={false}
              placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Tata Motors",\n  "url": "https://autoportal360.com/tata-cars/",\n  "logo": "https://autoportal360.com/logos/tata.png",\n  "foundingDate": "1945",\n  "description": "Indian multinational automotive manufacturer"\n}`}
              style={{
                ...TEXTAREA,
                fontFamily: 'monospace', fontSize: 13,
                borderColor: fieldErrors.schema_json ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)',
              }}
            />
          </Field>
        </div>

        {/* ══ Action buttons ════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={saving} style={{
            background: saving ? 'rgba(0,212,255,0.35)' : '#00D4FF',
            color: '#06142D',
            fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
            fontSize: 14, padding: '12px 32px',
            borderRadius: '10px', border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Brand'}
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
