'use client'

import { useState, useEffect, useCallback } from 'react'

interface BrandSeoRow {
  id: string
  brand_slug: string
  brand_name: string
  seo_title: string | null
  seo_text: string
  meta_description: string | null
  is_published: boolean
  updated_at: string
}

interface FormData {
  brand_slug: string
  brand_name: string
  seo_title: string
  seo_text: string
  meta_description: string
  is_published: boolean
}

const EMPTY_FORM: FormData = {
  brand_slug: '', brand_name: '', seo_title: '',
  seo_text: '', meta_description: '', is_published: true,
}

const KNOWN_BRANDS = [
  { slug: 'tata',          name: 'Tata Motors' },
  { slug: 'maruti-suzuki', name: 'Maruti Suzuki' },
  { slug: 'hyundai',       name: 'Hyundai' },
  { slug: 'mahindra',      name: 'Mahindra' },
  { slug: 'kia',           name: 'Kia India' },
  { slug: 'honda',         name: 'Honda Cars India' },
  { slug: 'bajaj',         name: 'Bajaj Auto' },
  { slug: 'hero',          name: 'Hero MotoCorp' },
  { slug: 'tvs',           name: 'TVS Motor Company' },
  { slug: 'toyota',        name: 'Toyota' },
  { slug: 'volkswagen',    name: 'Volkswagen' },
  { slug: 'skoda',         name: 'Skoda' },
  { slug: 'mg',            name: 'MG Motor India' },
  { slug: 'royal-enfield', name: 'Royal Enfield' },
  { slug: 'yamaha',        name: 'Yamaha Motor India' },
  { slug: 'ather',         name: 'Ather Energy' },
  { slug: 'ola',           name: 'Ola Electric' },
]

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export default function BrandSeoPage() {
  const [rows, setRows]         = useState<BrandSeoRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editSlug, setEditSlug] = useState<string | null>(null)
  const [form, setForm]         = useState<FormData>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/brand-seo')
      const json = await res.json()
      setRows(Array.isArray(json) ? json : [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setEditSlug(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (row: BrandSeoRow) => {
    setEditSlug(row.brand_slug)
    setForm({
      brand_slug:       row.brand_slug,
      brand_name:       row.brand_name,
      seo_title:        row.seo_title        ?? '',
      seo_text:         row.seo_text,
      meta_description: row.meta_description ?? '',
      is_published:     row.is_published,
    })
    setFormError('')
    setShowModal(true)
  }

  const handleBrandChange = (slug: string) => {
    const brand = KNOWN_BRANDS.find(b => b.slug === slug)
    setForm(f => ({ ...f, brand_slug: slug, brand_name: brand?.name ?? f.brand_name }))
  }

  const handleSave = async () => {
    if (!form.brand_slug || !form.brand_name || !form.seo_text.trim()) {
      setFormError('Brand, brand name and SEO text are required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const isEdit = editSlug !== null
      const res = await fetch(
        isEdit ? `/api/brand-seo/${editSlug}` : '/api/brand-seo',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
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
      await fetch(`/api/brand-seo/${slug}`, { method: 'DELETE' })
      load()
    } catch { alert('Delete failed') }
    finally { setDeleting(null) }
  }

  const handleTogglePublished = async (row: BrandSeoRow) => {
    await fetch(`/api/brand-seo/${row.brand_slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !row.is_published }),
    })
    load()
  }

  const wc = wordCount(form.seo_text)
  const mc = form.meta_description.length

  // Published slugs for "add new" dropdown filtering
  const existingSlugs = new Set(rows.map(r => r.brand_slug))

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '24px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>
            Brand SEO Content
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            {rows.length} brand{rows.length !== 1 ? 's' : ''} with SEO content
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            background: '#00D4FF', color: '#06142D', fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900, fontSize: '13px', padding: '10px 20px',
            borderRadius: '10px', border: 'none', cursor: 'pointer',
          }}
        >
          + Add Brand SEO
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#8E99A8' }}>Loading...</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#8E99A8' }}>
            No SEO content yet.{' '}
            <button onClick={openAdd} style={{ color: '#00D4FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              Add the first brand →
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                {['Brand', 'Words', 'Meta Desc', 'Status', 'Updated', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    color: '#8E99A8', fontWeight: 700, fontSize: '11px',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{row.brand_name}</div>
                    <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>{row.brand_slug}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      color: wordCount(row.seo_text) >= 300 ? '#00CC66' : '#FFB400',
                      fontWeight: 700,
                    }}>
                      {wordCount(row.seo_text)}
                    </span>
                    <span style={{ color: '#666', fontSize: '11px' }}> / 300+</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#C0C0C0', maxWidth: '200px' }}>
                    {row.meta_description ? (
                      <span style={{ fontSize: '12px' }}>{row.meta_description.length} chars</span>
                    ) : (
                      <span style={{ color: '#666', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleTogglePublished(row)}
                      style={{
                        background: row.is_published ? 'rgba(0,204,102,.15)' : 'rgba(255,77,79,.1)',
                        color: row.is_published ? '#00CC66' : '#FF4D4F',
                        border: `1px solid ${row.is_published ? '#00CC66' : '#FF4D4F'}40`,
                        borderRadius: '20px', padding: '3px 10px',
                        fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      {row.is_published ? '● Published' : '○ Draft'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#8E99A8', fontSize: '12px' }}>
                    {new Date(row.updated_at).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => openEdit(row)}
                        style={{ color: '#00D4FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                      >
                        Edit
                      </button>
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
          <div style={{
            position: 'relative', background: '#0A1F44', border: '1px solid #1e3a6e',
            borderRadius: '20px', width: '100%', maxWidth: '680px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,.5)',
          }}>
            {/* Modal header */}
            <div style={{
              position: 'sticky', top: 0, background: '#0A1F44',
              borderBottom: '1px solid #1e3a6e', padding: '18px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10,
            }}>
              <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '17px', color: '#fff', margin: 0 }}>
                {editSlug ? `Edit: ${form.brand_name}` : 'Add Brand SEO Content'}
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

              {/* Brand selector */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Brand *
                </label>
                {editSlug ? (
                  <div style={{ background: '#06142D', border: '1px solid #1e3a6e', borderRadius: '8px', padding: '10px 14px', color: '#C0C0C0', fontSize: '13px' }}>
                    {form.brand_name} <span style={{ color: '#666' }}>({form.brand_slug})</span>
                  </div>
                ) : (
                  <select
                    value={form.brand_slug}
                    onChange={e => handleBrandChange(e.target.value)}
                    style={{ width: '100%', background: '#06142D', border: '1px solid #1e3a6e', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer', boxSizing: 'border-box' }}
                  >
                    <option value="">Select brand...</option>
                    {KNOWN_BRANDS.filter(b => !existingSlugs.has(b.slug)).map(b => (
                      <option key={b.slug} value={b.slug}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* SEO Title */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  SEO Title (optional)
                </label>
                <input
                  type="text"
                  value={form.seo_title}
                  onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))}
                  placeholder={`${form.brand_name || 'Brand'} Dealers in India | AutoPortal360`}
                  style={{ width: '100%', background: '#06142D', border: '1px solid #1e3a6e', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Meta Description */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Meta Description (optional)
                  </label>
                  <span style={{ fontSize: '11px', color: mc > 160 ? '#FF4D4F' : mc >= 150 ? '#00CC66' : '#8E99A8', fontWeight: 700 }}>
                    {mc} / 160
                  </span>
                </div>
                <textarea
                  value={form.meta_description}
                  onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                  placeholder="Find authorized ... dealers across India. Contact info, ratings and directions."
                  rows={3}
                  style={{ width: '100%', background: '#06142D', border: `1px solid ${mc > 160 ? '#FF4D4F' : '#1e3a6e'}`, borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
                <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Recommended: 150–160 characters</p>
              </div>

              {/* SEO Text */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    SEO Text *
                  </label>
                  <span style={{ fontSize: '11px', color: wc >= 300 ? '#00CC66' : wc >= 200 ? '#FFB400' : '#FF4D4F', fontWeight: 700 }}>
                    {wc} words {wc >= 300 ? '✓' : '(target: 300–500)'}
                  </span>
                </div>
                <textarea
                  value={form.seo_text}
                  onChange={e => setForm(f => ({ ...f, seo_text: e.target.value }))}
                  placeholder="Write editorial-quality content about the brand in the Indian market. Use double line breaks between paragraphs."
                  rows={14}
                  style={{ width: '100%', background: '#06142D', border: '1px solid #1e3a6e', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box' }}
                />
                <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Use blank lines between paragraphs. No keyword stuffing — editorial quality only.</p>
              </div>

              {/* Published toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                  style={{
                    width: '40px', height: '20px', borderRadius: '10px',
                    background: form.is_published ? '#00D4FF' : '#333',
                    position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '2px',
                    left: form.is_published ? '22px' : '2px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: '#fff', transition: 'left .2s',
                  }} />
                </div>
                <span style={{ color: '#fff', fontSize: '14px' }}>
                  {form.is_published ? 'Published (visible on site)' : 'Draft (hidden from site)'}
                </span>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{
              position: 'sticky', bottom: 0, background: '#0A1F44',
              borderTop: '1px solid #1e3a6e', padding: '16px 24px',
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '10px 20px', border: '1px solid #1e3a6e', color: '#C0C0C0', borderRadius: '10px', background: 'none', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '10px 24px', background: '#00D4FF', color: '#06142D', borderRadius: '10px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving...' : editSlug ? 'Update Content' : 'Create Content'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
