'use client'

import { useState, useEffect, useCallback } from 'react'

interface TopModel { name: string; price: string }

interface BrandPageSeoRow {
  id: string
  brand_slug: string
  brand_name: string
  vehicle_type: string
  seo_heading: string | null
  seo_text: string
  top_models: TopModel[]
  is_published: boolean
  updated_at: string
}

interface FormData {
  brand_slug: string
  brand_name: string
  vehicle_type: string
  seo_heading: string
  seo_text: string
  top_models: TopModel[]
  is_published: boolean
}

const EMPTY_FORM: FormData = {
  brand_slug: '', brand_name: '', vehicle_type: 'cars',
  seo_heading: '', seo_text: '',
  top_models: [{ name: '', price: '' }, { name: '', price: '' }, { name: '', price: '' }, { name: '', price: '' }, { name: '', price: '' }],
  is_published: true,
}

const TYPE_COLORS: Record<string, string> = {
  cars: '#00D4FF', bikes: '#FFB400', scooters: '#00CC66',
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export default function BrandPageSeoPage() {
  const [rows, setRows]           = useState<BrandPageSeoRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editSlug, setEditSlug]   = useState<string | null>(null)
  const [form, setForm]           = useState<FormData>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/brand-page-seo')
      const json = await res.json()
      setRows(Array.isArray(json) ? json : [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filterType === 'all' ? rows : rows.filter(r => r.vehicle_type === filterType)

  const openAdd = () => {
    setEditSlug(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (row: BrandPageSeoRow) => {
    setEditSlug(row.brand_slug)
    const models = [...(row.top_models ?? [])]
    while (models.length < 5) models.push({ name: '', price: '' })
    setForm({
      brand_slug:   row.brand_slug,
      brand_name:   row.brand_name,
      vehicle_type: row.vehicle_type,
      seo_heading:  row.seo_heading  ?? '',
      seo_text:     row.seo_text,
      top_models:   models,
      is_published: row.is_published,
    })
    setFormError('')
    setShowModal(true)
  }

  const setModel = (i: number, field: 'name' | 'price', val: string) => {
    setForm(f => {
      const m = [...f.top_models]
      m[i] = { ...m[i], [field]: val }
      return { ...f, top_models: m }
    })
  }

  const addModelRow = () => {
    setForm(f => ({ ...f, top_models: [...f.top_models, { name: '', price: '' }] }))
  }

  const removeModelRow = (i: number) => {
    setForm(f => ({ ...f, top_models: f.top_models.filter((_, idx) => idx !== i) }))
  }

  const handleNameChange = (val: string) => {
    setForm(f => ({
      ...f,
      brand_name: val,
      brand_slug: editSlug ? f.brand_slug : `${slugify(val)}-${f.vehicle_type}`,
    }))
  }

  const handleTypeChange = (val: string) => {
    setForm(f => ({
      ...f,
      vehicle_type: val,
      brand_slug: editSlug ? f.brand_slug : `${slugify(f.brand_name)}-${val}`,
    }))
  }

  const handleSave = async () => {
    if (!form.brand_slug || !form.brand_name || !form.seo_text.trim()) {
      setFormError('Brand slug, brand name and SEO text are required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const isEdit = editSlug !== null
      const payload = {
        ...form,
        top_models: form.top_models.filter(m => m.name.trim()),
      }
      const res = await fetch(
        isEdit ? `/api/brand-page-seo/${editSlug}` : '/api/brand-page-seo',
        { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      )
      const json = await res.json()
      if (!res.ok) { setFormError(json.error ?? 'Save failed'); return }
      setShowModal(false)
      load()
    } catch { setFormError('Network error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`Delete SEO content for "${name}"? This cannot be undone.`)) return
    setDeleting(slug)
    try {
      await fetch(`/api/brand-page-seo/${slug}`, { method: 'DELETE' })
      load()
    } catch { alert('Delete failed') }
    finally { setDeleting(null) }
  }

  const handleTogglePublished = async (row: BrandPageSeoRow) => {
    await fetch(`/api/brand-page-seo/${row.brand_slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !row.is_published }),
    })
    load()
  }

  const wc = wordCount(form.seo_text)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '24px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>
            Brand Page SEO
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            {rows.length} brand{rows.length !== 1 ? 's' : ''} · editorial content + top models table
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{ background: '#00D4FF', color: '#06142D', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '13px', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
        >
          + Add Brand
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', 'cars', 'bikes', 'scooters'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: '6px 16px', borderRadius: '20px', border: '1px solid',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              background: filterType === t ? (TYPE_COLORS[t] ?? '#00D4FF') : 'transparent',
              color: filterType === t ? '#06142D' : (TYPE_COLORS[t] ?? '#C0C0C0'),
              borderColor: TYPE_COLORS[t] ?? '#C0C0C0',
              textTransform: 'capitalize',
            }}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#8E99A8' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#8E99A8' }}>
            No entries yet.{' '}
            <button onClick={openAdd} style={{ color: '#00D4FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              Add the first brand →
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                {['Brand', 'Type', 'Words', 'Models', 'Status', 'Updated', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#8E99A8', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{row.brand_name}</div>
                    <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>{row.brand_slug}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: `${TYPE_COLORS[row.vehicle_type] ?? '#666'}18`,
                      color: TYPE_COLORS[row.vehicle_type] ?? '#C0C0C0',
                      border: `1px solid ${TYPE_COLORS[row.vehicle_type] ?? '#666'}40`,
                      borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize',
                    }}>
                      {row.vehicle_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: wordCount(row.seo_text) >= 300 ? '#00CC66' : '#FFB400', fontWeight: 700 }}>
                      {wordCount(row.seo_text)}
                    </span>
                    <span style={{ color: '#666', fontSize: '11px' }}> / 300+</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#C0C0C0' }}>
                    {(row.top_models ?? []).filter(m => m.name).length} / 5
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleTogglePublished(row)}
                      style={{
                        background: row.is_published ? 'rgba(0,204,102,.15)' : 'rgba(255,77,79,.1)',
                        color: row.is_published ? '#00CC66' : '#FF4D4F',
                        border: `1px solid ${row.is_published ? '#00CC66' : '#FF4D4F'}40`,
                        borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      {row.is_published ? '● Live' : '○ Draft'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#8E99A8', fontSize: '12px' }}>
                    {new Date(row.updated_at).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => openEdit(row)} style={{ color: '#00D4FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Edit</button>
                      <button
                        onClick={() => handleDelete(row.brand_slug, row.brand_name)}
                        disabled={deleting === row.brand_slug}
                        style={{ color: '#FF4D4F', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', opacity: deleting === row.brand_slug ? 0.5 : 1 }}
                      >
                        {deleting === row.brand_slug ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)} />
          <div style={{ position: 'relative', background: '#0A1F44', border: '1px solid #1e3a6e', borderRadius: '20px', width: '100%', maxWidth: '720px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,.5)' }}>

            {/* Modal header */}
            <div style={{ position: 'sticky', top: 0, background: '#0A1F44', borderBottom: '1px solid #1e3a6e', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '17px', color: '#fff', margin: 0 }}>
                {editSlug ? `Edit: ${form.brand_name}` : 'Add Brand Page SEO'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: '#C0C0C0', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {formError && (
                <div style={{ background: 'rgba(255,77,79,.15)', border: '1px solid rgba(255,77,79,.4)', color: '#FF4D4F', borderRadius: '10px', padding: '12px 16px', fontSize: '13px' }}>
                  {formError}
                </div>
              )}

              {/* Brand Name + Type row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Brand Name *</label>
                  <input
                    type="text"
                    value={form.brand_name}
                    onChange={e => handleNameChange(e.target.value)}
                    disabled={!!editSlug}
                    placeholder="e.g. Tata Motors"
                    style={{ width: '100%', background: '#06142D', border: '1px solid #1e3a6e', borderRadius: '8px', padding: '10px 14px', color: editSlug ? '#666' : '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Vehicle Type *</label>
                  <select
                    value={form.vehicle_type}
                    onChange={e => handleTypeChange(e.target.value)}
                    disabled={!!editSlug}
                    style={{ width: '100%', background: '#06142D', border: '1px solid #1e3a6e', borderRadius: '8px', padding: '10px 14px', color: editSlug ? '#666' : '#fff', fontSize: '13px', cursor: editSlug ? 'not-allowed' : 'pointer', boxSizing: 'border-box' }}
                  >
                    <option value="cars">Cars</option>
                    <option value="bikes">Bikes</option>
                    <option value="scooters">Scooters</option>
                  </select>
                </div>
              </div>

              {/* Brand Slug */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Brand Slug (auto-generated)</label>
                <input
                  type="text"
                  value={form.brand_slug}
                  onChange={e => setForm(f => ({ ...f, brand_slug: e.target.value }))}
                  disabled={!!editSlug}
                  placeholder="e.g. tata-cars"
                  style={{ width: '100%', background: '#06142D', border: '1px solid #1e3a6e', borderRadius: '8px', padding: '10px 14px', color: editSlug ? '#666' : '#C0C0C0', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <p style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>Matches the URL path, e.g. /tata-cars/</p>
              </div>

              {/* SEO Heading */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>SEO Heading (optional)</label>
                <input
                  type="text"
                  value={form.seo_heading}
                  onChange={e => setForm(f => ({ ...f, seo_heading: e.target.value }))}
                  placeholder={`Everything About ${form.brand_name || 'Brand'} in India 2026`}
                  style={{ width: '100%', background: '#06142D', border: '1px solid #1e3a6e', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Top Models */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Models</label>
                  <button
                    onClick={addModelRow}
                    style={{ color: '#00D4FF', background: 'none', border: '1px solid #1e3a6e', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    + Add Row
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {form.top_models.map((m, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={m.name}
                        onChange={e => setModel(i, 'name', e.target.value)}
                        placeholder="Model name"
                        style={{ background: '#06142D', border: '1px solid #1e3a6e', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                      <input
                        type="text"
                        value={m.price}
                        onChange={e => setModel(i, 'price', e.target.value)}
                        placeholder="₹X.XX – ₹Y.YY Lakh"
                        style={{ background: '#06142D', border: '1px solid #1e3a6e', borderRadius: '6px', padding: '8px 12px', color: '#00D4FF', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                      {form.top_models.length > 1 && (
                        <button
                          onClick={() => removeModelRow(i)}
                          style={{ color: '#FF4D4F', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0 4px', lineHeight: 1 }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>Empty-name rows are excluded from the saved data.</p>
              </div>

              {/* SEO Text */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SEO Text *</label>
                  <span style={{ fontSize: '11px', color: wc >= 300 ? '#00CC66' : wc >= 200 ? '#FFB400' : '#FF4D4F', fontWeight: 700 }}>
                    {wc} words {wc >= 300 ? '✓' : '(target: 300–500)'}
                  </span>
                </div>
                <textarea
                  value={form.seo_text}
                  onChange={e => setForm(f => ({ ...f, seo_text: e.target.value }))}
                  placeholder="Write editorial-quality content. Use blank lines between paragraphs."
                  rows={16}
                  style={{ width: '100%', background: '#06142D', border: '1px solid #1e3a6e', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box' }}
                />
              </div>

              {/* Published toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                  style={{ width: '40px', height: '20px', borderRadius: '10px', background: form.is_published ? '#00D4FF' : '#333', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}
                >
                  <span style={{ position: 'absolute', top: '2px', left: form.is_published ? '22px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
                </div>
                <span style={{ color: '#fff', fontSize: '14px' }}>
                  {form.is_published ? 'Published (visible on site)' : 'Draft (hidden from site)'}
                </span>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ position: 'sticky', bottom: 0, background: '#0A1F44', borderTop: '1px solid #1e3a6e', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1px solid #1e3a6e', color: '#C0C0C0', borderRadius: '10px', background: 'none', cursor: 'pointer', fontSize: '13px' }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '10px 24px', background: '#00D4FF', color: '#06142D', borderRadius: '10px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving...' : editSlug ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
