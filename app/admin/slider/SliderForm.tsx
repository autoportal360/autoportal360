'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { dbInsert, dbUpdate, dbDelete } from '@/lib/admin-db'

// ─── Style tokens ─────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(0,212,255,0.04)',
  border: '1px solid rgba(0,212,255,0.15)',
  borderRadius: '10px', padding: '10px 14px',
  color: '#FFFFFF', fontSize: '14px', outline: 'none',
  fontFamily: 'system-ui, sans-serif',
}
const SELECT: React.CSSProperties = { ...INPUT, cursor: 'pointer' }
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

// ─── Types ────────────────────────────────────────────────────────────────────

type BrandOption = { id: string; name: string; type: string }
type ModelOption = { id: string; name: string; brand_id: string; type: string }

interface FormState {
  type: 'auto' | 'oem'
  brand_id: string
  model_id: string
  oem_advertiser: string
  oem_destination_url: string
  oem_impression_pixel: string
  oem_click_tracking_url: string
  oem_headline: string
  oem_subline: string
  oem_cta_text: string
  is_active: boolean
  start_date: string
  end_date: string
  sort_order: string
}

const DEFAULT: FormState = {
  type: 'auto', brand_id: '', model_id: '',
  oem_advertiser: '', oem_destination_url: '',
  oem_impression_pixel: '', oem_click_tracking_url: '',
  oem_headline: '', oem_subline: '', oem_cta_text: '',
  is_active: true, start_date: '', end_date: '', sort_order: '0',
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SliderForm({ slideId }: { slideId?: string }) {
  const router = useRouter()
  const isEdit = !!slideId
  const sbRef = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current

  const [form, setForm] = useState<FormState>(DEFAULT)
  const [brands, setBrands] = useState<BrandOption[]>([])
  const [allModels, setAllModels] = useState<ModelOption[]>([])
  const [existingBanner, setExistingBanner] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  function set(key: keyof FormState, val: string | boolean) {
    setForm(f => ({ ...f, [key]: val }))
  }

  // Load brands + models
  useEffect(() => {
    Promise.all([
      sb.from('brands').select('id, name, type').eq('is_active', true).order('name'),
      sb.from('models').select('id, name, brand_id, type').neq('status', 'discontinued').order('name'),
    ]).then(([{ data: bData }, { data: mData }]) => {
      setBrands((bData ?? []) as BrandOption[])
      setAllModels((mData ?? []) as ModelOption[])
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load existing slide for edit
  useEffect(() => {
    if (!slideId) { setLoading(false); return }
    sb.from('slider_slides').select('*').eq('id', slideId).single()
      .then(({ data: s, error }) => {
        if (error || !s) { setLoading(false); return }
        const r = s as Record<string, unknown>
        // Find brand_id from model
        const modelId = (r.model_id as string) ?? ''
        const matchedModel = allModels.find(m => m.id === modelId)
        setForm({
          type: (r.type as 'auto' | 'oem') ?? 'auto',
          brand_id: matchedModel?.brand_id ?? '',
          model_id: modelId,
          oem_advertiser: (r.oem_advertiser as string) ?? '',
          oem_destination_url: (r.oem_destination_url as string) ?? '',
          oem_impression_pixel: (r.oem_impression_pixel as string) ?? '',
          oem_click_tracking_url: (r.oem_click_tracking_url as string) ?? '',
          oem_headline: (r.oem_headline as string) ?? '',
          oem_subline: (r.oem_subline as string) ?? '',
          oem_cta_text: (r.oem_cta_text as string) ?? '',
          is_active: (r.is_active as boolean) ?? true,
          start_date: (r.start_date as string) ?? '',
          end_date: (r.end_date as string) ?? '',
          sort_order: String(r.sort_order ?? 0),
        })
        setExistingBanner((r.oem_banner_url as string) ?? null)
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideId, allModels.length])

  // When brand changes, clear model selection
  function handleBrandChange(brandId: string) {
    setForm(f => ({ ...f, brand_id: brandId, model_id: '' }))
  }

  const filteredModels = allModels.filter(m => m.brand_id === form.brand_id)

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  async function uploadBanner(): Promise<string | null> {
    if (!bannerFile) return existingBanner
    const ext = bannerFile.name.split('.').pop() ?? 'jpg'
    const path = `banners/${Date.now()}.${ext}`
    const { error } = await sb.storage
      .from('slider').upload(path, bannerFile, { contentType: bannerFile.type, upsert: true })
    if (error) throw new Error(`Banner upload: ${error.message}`)
    const { data } = sb.storage.from('slider').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSave() {
    if (form.type === 'auto' && !form.model_id) {
      showToast('Please select a model for the auto slide.', false); return
    }
    if (form.type === 'oem' && !existingBanner && !bannerFile) {
      showToast('Please upload a banner image for the OEM slide.', false); return
    }
    setSaving(true)
    try {
      const bannerUrl = form.type === 'oem' ? await uploadBanner() : null
      const payload: Record<string, unknown> = {
        type: form.type,
        model_id: form.type === 'auto' ? form.model_id || null : null,
        oem_advertiser: form.type === 'oem' ? form.oem_advertiser || null : null,
        oem_banner_url: form.type === 'oem' ? bannerUrl : null,
        oem_destination_url: form.type === 'oem' ? form.oem_destination_url || null : null,
        oem_impression_pixel: form.type === 'oem' ? form.oem_impression_pixel || null : null,
        oem_click_tracking_url: form.type === 'oem' ? form.oem_click_tracking_url || null : null,
        oem_headline: form.type === 'oem' ? form.oem_headline || null : null,
        oem_subline: form.type === 'oem' ? form.oem_subline || null : null,
        oem_cta_text: form.type === 'oem' ? form.oem_cta_text || null : null,
        is_active: form.is_active,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        sort_order: parseInt(form.sort_order) || 0,
      }
      if (isEdit) {
        await dbUpdate('slider_slides', slideId!, payload)
        showToast('Slide updated!', true)
      } else {
        await dbInsert('slider_slides', payload)
        showToast('Slide created!', true)
        setTimeout(() => router.push('/admin/slider'), 1200)
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!slideId || !confirm('Delete this slide?')) return
    try {
      await dbDelete('slider_slides', slideId)
      router.push('/admin/slider')
      router.refresh()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Delete failed', false)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#8E99A8', fontSize: 14 }}>Loading…</div>
  )

  return (
    <div style={{ maxWidth: '720px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toast.ok ? 'rgba(0,204,102,0.12)' : 'rgba(255,80,80,0.12)',
          border: `1px solid ${toast.ok ? 'rgba(0,204,102,0.35)' : 'rgba(255,80,80,0.35)'}`,
          color: toast.ok ? '#00CC66' : '#FF8080',
          padding: '14px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.ok ? '✓' : '✗'}</span>{toast.msg}
        </div>
      )}

      {/* ── Slide Type ── */}
      <div style={CARD}>
        <p style={CARD_TITLE}>Slide Type</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['auto', 'oem'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => set('type', t)}
              style={{
                flex: 1, padding: '12px',
                borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                fontFamily: 'Montserrat,sans-serif',
                background: form.type === t ? '#00D4FF' : 'rgba(0,212,255,0.04)',
                color: form.type === t ? '#06142D' : '#8E99A8',
                border: form.type === t ? 'none' : '1px solid rgba(0,212,255,0.15)',
              }}
            >
              {t === 'auto' ? '🚗 Auto Model' : '📢 OEM Campaign'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Auto slide fields ── */}
      {form.type === 'auto' && (
        <div style={CARD}>
          <p style={CARD_TITLE}>Model Selection</p>
          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Brand</label>
            <select value={form.brand_id} onChange={e => handleBrandChange(e.target.value)} style={SELECT}>
              <option value="">— Select Brand —</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={LABEL}>Model</label>
            <select
              value={form.model_id}
              onChange={e => set('model_id', e.target.value)}
              disabled={!form.brand_id}
              style={{ ...SELECT, opacity: form.brand_id ? 1 : 0.5 }}
            >
              <option value="">— Select Model —</option>
              {filteredModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {form.brand_id && filteredModels.length === 0 && (
              <p style={{ fontSize: 11, color: '#FFB400', margin: '5px 0 0' }}>
                No active models for this brand.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── OEM Campaign fields ── */}
      {form.type === 'oem' && (
        <div style={CARD}>
          <p style={CARD_TITLE}>OEM Campaign</p>

          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Advertiser Name</label>
            <input type="text" value={form.oem_advertiser} onChange={e => set('oem_advertiser', e.target.value)}
              placeholder="e.g. Maruti Suzuki" style={INPUT} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Banner Image</label>
            <input type="file" accept="image/*" onChange={handleBannerChange}
              style={{ ...INPUT, padding: '8px 14px', cursor: 'pointer' }} />
            {(bannerPreview ?? existingBanner) && (
              <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', maxHeight: 140, position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bannerPreview ?? existingBanner!} alt="Banner preview"
                  style={{ width: '100%', height: 140, objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Destination URL (on CTA click)</label>
            <input type="url" value={form.oem_destination_url} onChange={e => set('oem_destination_url', e.target.value)}
              placeholder="https://example.com/campaign" style={INPUT} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={LABEL}>Impression Pixel URL</label>
              <input type="url" value={form.oem_impression_pixel} onChange={e => set('oem_impression_pixel', e.target.value)}
                placeholder="https://track.example.com/imp" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Click Tracking URL</label>
              <input type="url" value={form.oem_click_tracking_url} onChange={e => set('oem_click_tracking_url', e.target.value)}
                placeholder="https://track.example.com/click" style={INPUT} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Headline</label>
            <input type="text" value={form.oem_headline} onChange={e => set('oem_headline', e.target.value)}
              placeholder="Introducing the New Baleno 2026" style={INPUT} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Subline</label>
            <input type="text" value={form.oem_subline} onChange={e => set('oem_subline', e.target.value)}
              placeholder="Starting at ₹6.49 Lakh. Book now." style={INPUT} />
          </div>

          <div>
            <label style={LABEL}>CTA Button Text</label>
            <input type="text" value={form.oem_cta_text} onChange={e => set('oem_cta_text', e.target.value)}
              placeholder="Book a Test Drive" style={INPUT} />
          </div>
        </div>
      )}

      {/* ── Settings ── */}
      <div style={CARD}>
        <p style={CARD_TITLE}>Settings</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => set('is_active', !form.is_active)}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', padding: 0,
              background: form.is_active ? '#00D4FF' : 'rgba(142,153,168,0.3)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
              background: '#FFFFFF', transition: 'left 0.2s',
              left: form.is_active ? 23 : 3,
            }} />
          </button>
          <span style={{ fontSize: 13, color: form.is_active ? '#00CC66' : '#8E99A8', fontWeight: 600 }}>
            {form.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={LABEL}>Start Date</label>
            <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
              style={{ ...INPUT, colorScheme: 'dark' }} />
          </div>
          <div>
            <label style={LABEL}>End Date</label>
            <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}
              style={{ ...INPUT, colorScheme: 'dark' }} />
          </div>
          <div>
            <label style={LABEL}>Sort Order</label>
            <input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)}
              min={0} style={INPUT} />
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#8E99A8', margin: '8px 0 0' }}>
          Leave dates empty to show indefinitely. Lower sort order = shown first.
        </p>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={handleSave} disabled={saving} style={{
          background: saving ? 'rgba(0,212,255,0.35)' : '#00D4FF',
          color: '#06142D', fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
          fontSize: 14, padding: '12px 32px', borderRadius: 10, border: 'none',
          cursor: saving ? 'not-allowed' : 'pointer',
        }}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Slide'}
        </button>

        {isEdit && (
          <button type="button" onClick={handleDelete} style={{
            background: 'rgba(255,80,80,0.08)', color: '#FF6B6B',
            border: '1px solid rgba(255,80,80,0.3)', fontWeight: 700, fontSize: 13,
            padding: '12px 24px', borderRadius: 10, cursor: 'pointer',
          }}>
            Delete Slide
          </button>
        )}

        <button type="button" onClick={() => router.push('/admin/slider')} style={{
          background: 'transparent', color: '#8E99A8',
          border: '1px solid rgba(142,153,168,0.2)', fontWeight: 600, fontSize: 13,
          padding: '12px 24px', borderRadius: 10, cursor: 'pointer',
        }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
