'use client'

import { useState, useEffect, useCallback } from 'react'

interface Vehicle {
  brand: string; model: string; price: string
  fuel: string; type: string; slug: string; tag: string
}
interface Faq { question: string; answer: string }

interface StaticPage {
  id: string; title: string; slug: string; page_type: string
  meta_title: string | null; meta_description: string | null
  hero_heading: string; hero_subtext: string | null
  vehicles: Vehicle[]; seo_heading: string | null
  seo_text: string; faqs: Faq[]
  is_published: boolean; sort_order: number
  created_at: string; updated_at: string
}

type PageType = 'all' | 'cars' | 'bikes' | 'scooters' | 'mixed'

const BLANK: Omit<StaticPage, 'id' | 'created_at' | 'updated_at'> = {
  title: '', slug: '', page_type: 'cars',
  meta_title: '', meta_description: '',
  hero_heading: '', hero_subtext: '',
  vehicles: [], seo_heading: '', seo_text: '', faqs: [],
  is_published: true, sort_order: 0,
}

function toSlug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#06142D', border: '1px solid rgba(0,212,255,0.15)',
  color: '#FFFFFF', fontSize: '13px', padding: '9px 12px',
  borderRadius: '8px', fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px',
}

export default function AdminStaticPages() {
  const [pages,      setPages]      = useState<StaticPage[]>([])
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState<PageType>('all')
  const [modal,      setModal]      = useState<'add' | 'edit' | null>(null)
  const [editing,    setEditing]    = useState<StaticPage | null>(null)
  const [form,       setForm]       = useState<typeof BLANK>(BLANK)
  const [saving,     setSaving]     = useState(false)
  const [toast,      setToast]      = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/static-pages?admin=1')
      const json = await res.json()
      setPages(json.pages ?? [])
    } catch { setPages([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setEditing(null)
    setForm(BLANK)
    setModal('add')
  }

  const openEdit = (p: StaticPage) => {
    setEditing(p)
    setForm({
      title: p.title, slug: p.slug, page_type: p.page_type,
      meta_title: p.meta_title ?? '', meta_description: p.meta_description ?? '',
      hero_heading: p.hero_heading, hero_subtext: p.hero_subtext ?? '',
      vehicles: p.vehicles ?? [], seo_heading: p.seo_heading ?? '',
      seo_text: p.seo_text ?? '', faqs: p.faqs ?? [],
      is_published: p.is_published, sort_order: p.sort_order,
    })
    setModal('edit')
  }

  const handleTitleChange = (t: string) => {
    setForm(f => ({
      ...f,
      title: t,
      slug: modal === 'add' ? toSlug(t) : f.slug,
    }))
  }

  const addVehicle = () => {
    setForm(f => ({ ...f, vehicles: [...f.vehicles, { brand: '', model: '', price: '', fuel: '', type: '', slug: '', tag: '' }] }))
  }
  const removeVehicle = (i: number) => {
    setForm(f => ({ ...f, vehicles: f.vehicles.filter((_, idx) => idx !== i) }))
  }
  const updateVehicle = (i: number, field: keyof Vehicle, val: string) => {
    setForm(f => {
      const v = [...f.vehicles]
      v[i] = { ...v[i], [field]: val }
      return { ...f, vehicles: v }
    })
  }

  const addFaq = () => {
    setForm(f => ({ ...f, faqs: [...f.faqs, { question: '', answer: '' }] }))
  }
  const removeFaq = (i: number) => {
    setForm(f => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }))
  }
  const updateFaq = (i: number, field: keyof Faq, val: string) => {
    setForm(f => {
      const arr = [...f.faqs]
      arr[i] = { ...arr[i], [field]: val }
      return { ...f, faqs: arr }
    })
  }

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.hero_heading) {
      showToast('Title, slug and hero heading are required.')
      return
    }
    setSaving(true)
    try {
      const url    = modal === 'edit' && editing ? `/api/static-pages/${editing.slug}` : '/api/static-pages'
      const method = modal === 'edit' ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error(await res.text())
      showToast(modal === 'edit' ? 'Page updated.' : 'Page created.')
      setModal(null)
      load()
    } catch (e) {
      showToast('Error: ' + String(e))
    } finally { setSaving(false) }
  }

  const handleDelete = async (page: StaticPage) => {
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/static-pages/${page.slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast('Page deleted.')
      load()
    } catch { showToast('Delete failed.') }
  }

  const togglePublish = async (page: StaticPage) => {
    try {
      await fetch(`/api/static-pages/${page.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !page.is_published }),
      })
      load()
    } catch { showToast('Failed to update.') }
  }

  const filtered = tab === 'all' ? pages : pages.filter(p => p.page_type === tab)

  const TABS: PageType[] = ['all', 'cars', 'bikes', 'scooters', 'mixed']

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.3)',
          color: '#00D4FF', padding: '12px 20px', borderRadius: '10px',
          fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '26px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px' }}>
            Static Pages
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            Manage category and listing pages with vehicles, SEO content and FAQs
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            background: '#00D4FF', color: '#06142D', fontWeight: 900,
            fontSize: '13px', padding: '11px 22px', borderRadius: '10px',
            border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          + Add New Page
        </button>
      </div>

      {/* Type filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? '#00D4FF' : 'rgba(0,212,255,0.06)',
              color:      tab === t ? '#06142D' : '#8E99A8',
              border:     tab === t ? 'none'    : '1px solid rgba(0,212,255,0.1)',
              borderRadius: '8px', padding: '6px 16px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 700, fontFamily: 'Montserrat, sans-serif',
              textTransform: 'capitalize',
            }}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: '#8E99A8', padding: '40px', textAlign: 'center' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#8E99A8',
        }}>
          No pages yet. Click &quot;Add New Page&quot; to create one.
        </div>
      ) : (
        <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                {['Title', 'Slug', 'Type', 'Vehicles', 'SEO Words', 'Published', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#8E99A8', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}>
                  <td style={{ padding: '14px 16px', color: '#FFFFFF', fontWeight: 700, maxWidth: '200px' }}>
                    {p.title}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#8E99A8', fontFamily: 'monospace', fontSize: '12px' }}>
                    /pages/{p.slug}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px',
                      background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)',
                      textTransform: 'capitalize',
                    }}>
                      {p.page_type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#C0C0C0' }}>
                    {(p.vehicles ?? []).length}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#C0C0C0' }}>
                    {wordCount(p.seo_text ?? '')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => togglePublish(p)}
                      style={{
                        fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        background: p.is_published ? 'rgba(46,204,113,0.12)' : 'rgba(255,77,79,0.12)',
                        color:      p.is_published ? '#2ECC71' : '#FF4D4F',
                      }}
                    >
                      {p.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(p)} style={{ fontSize: '12px', color: '#00D4FF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p)} style={{ fontSize: '12px', color: '#FF4D4F', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL ── */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '24px', overflowY: 'auto',
        }}>
          <div style={{
            background: '#111111', border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '800px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)', marginBottom: '24px',
          }}>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '24px' }}>
              {modal === 'add' ? 'Add New Page' : `Edit: ${editing?.title}`}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Title *</label>
                <input value={form.title} onChange={e => handleTitleChange(e.target.value)} style={inputStyle} placeholder="Popular Cars in India" />
              </div>
              <div>
                <label style={labelStyle}>Slug * (URL: /pages/…)</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))} style={inputStyle} placeholder="popular-cars-in-india" />
              </div>
              <div>
                <label style={labelStyle}>Page Type</label>
                <select value={form.page_type} onChange={e => setForm(f => ({ ...f, page_type: e.target.value }))} style={inputStyle}>
                  <option value="cars">Cars</option>
                  <option value="bikes">Bikes</option>
                  <option value="scooters">Scooters</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Meta Title</label>
                <input value={form.meta_title ?? ''} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Meta Description ({(form.meta_description ?? '').length}/160)</label>
                <textarea
                  value={form.meta_description ?? ''}
                  onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                  rows={2} maxLength={160}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Hero Heading *</label>
                <input value={form.hero_heading} onChange={e => setForm(f => ({ ...f, hero_heading: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Hero Subtext</label>
                <input value={form.hero_subtext ?? ''} onChange={e => setForm(f => ({ ...f, hero_subtext: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            {/* Vehicles */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Vehicles ({form.vehicles.length})</label>
                <button onClick={addVehicle} style={{ fontSize: '12px', color: '#00D4FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  + Add Vehicle
                </button>
              </div>
              {form.vehicles.map((v, i) => (
                <div key={i} style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <input value={v.brand}  onChange={e => updateVehicle(i, 'brand',  e.target.value)} placeholder="Brand"  style={{ ...inputStyle, fontSize: '12px', padding: '7px 10px' }} />
                    <input value={v.model}  onChange={e => updateVehicle(i, 'model',  e.target.value)} placeholder="Model"  style={{ ...inputStyle, fontSize: '12px', padding: '7px 10px' }} />
                    <input value={v.price}  onChange={e => updateVehicle(i, 'price',  e.target.value)} placeholder="Price"  style={{ ...inputStyle, fontSize: '12px', padding: '7px 10px' }} />
                    <input value={v.fuel}   onChange={e => updateVehicle(i, 'fuel',   e.target.value)} placeholder="Fuel"   style={{ ...inputStyle, fontSize: '12px', padding: '7px 10px' }} />
                    <input value={v.type}   onChange={e => updateVehicle(i, 'type',   e.target.value)} placeholder="Type"   style={{ ...inputStyle, fontSize: '12px', padding: '7px 10px' }} />
                    <input value={v.tag}    onChange={e => updateVehicle(i, 'tag',    e.target.value)} placeholder="Tag badge" style={{ ...inputStyle, fontSize: '12px', padding: '7px 10px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input value={v.slug}   onChange={e => updateVehicle(i, 'slug',   e.target.value)} placeholder="/brand-cars/model/" style={{ ...inputStyle, fontSize: '12px', padding: '7px 10px', flex: 1 }} />
                    <button onClick={() => removeVehicle(i)} style={{ fontSize: '11px', color: '#FF4D4F', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, fontWeight: 700 }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SEO */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>SEO Section Heading</label>
              <input value={form.seo_heading ?? ''} onChange={e => setForm(f => ({ ...f, seo_heading: e.target.value }))} style={{ ...inputStyle, marginBottom: '12px' }} />
              <label style={labelStyle}>SEO Text ({wordCount(form.seo_text)} words) — use blank lines for paragraph breaks</label>
              <textarea
                value={form.seo_text}
                onChange={e => setForm(f => ({ ...f, seo_text: e.target.value }))}
                rows={10}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                placeholder="Write 800-1000 words of SEO content here. Separate paragraphs with blank lines."
              />
            </div>

            {/* FAQs */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>FAQs ({form.faqs.length})</label>
                <button onClick={addFaq} style={{ fontSize: '12px', color: '#00D4FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  + Add FAQ
                </button>
              </div>
              {form.faqs.map((faq, i) => (
                <div key={i} style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                  <input
                    value={faq.question}
                    onChange={e => updateFaq(i, 'question', e.target.value)}
                    placeholder="Question"
                    style={{ ...inputStyle, fontSize: '12px', padding: '7px 10px', marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <textarea
                      value={faq.answer}
                      onChange={e => updateFaq(i, 'answer', e.target.value)}
                      placeholder="Answer"
                      rows={3}
                      style={{ ...inputStyle, fontSize: '12px', padding: '7px 10px', resize: 'vertical', flex: 1 }}
                    />
                    <button onClick={() => removeFaq(i)} style={{ fontSize: '11px', color: '#FF4D4F', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, fontWeight: 700, paddingTop: '8px' }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Published + actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#C0C0C0', fontSize: '13px', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#00D4FF' }}
                />
                Published (visible on site)
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setModal(null)}
                  style={{
                    background: 'transparent', color: '#8E99A8', border: '1px solid rgba(255,255,255,0.1)',
                    padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: '#00D4FF', color: '#06142D', fontWeight: 900, fontSize: '13px',
                    padding: '10px 28px', borderRadius: '8px', border: 'none', cursor: saving ? 'wait' : 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {saving ? 'Saving…' : 'Save Page'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
