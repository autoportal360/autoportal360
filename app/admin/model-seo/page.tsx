'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { dbInsert, dbUpdate, dbDelete } from '@/lib/admin-db'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Faq { question: string; answer: string }

interface ModelOption { id: string; name: string; brand_name: string; brand_slug: string; slug: string }

interface Entry {
  id: string
  model_id: string
  page_type: string
  seo_heading: string | null
  seo_text: string
  faqs: Faq[]
  is_published: boolean
  updated_at: string
  models: { id: string; name: string; slug: string; brands: { name: string; slug: string } | null } | null
}

type PageType = 'overview' | 'images' | 'colours' | 'variants' | 'specs' | 'mileage' | 'price' | 'faqs'
const PAGE_TYPES: PageType[] = ['overview','images','colours','variants','specs','mileage','price','faqs']

const BLANK = {
  model_id:    '',
  page_type:   'images' as PageType,
  seo_heading: '',
  seo_text:    '',
  faqs:        [] as Faq[],
  is_published: true,
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: '#06142D', border: '1px solid rgba(0,212,255,0.15)',
  color: '#fff', fontSize: '13px', padding: '9px 12px',
  borderRadius: '8px', fontFamily: 'inherit', outline: 'none',
}
const LABEL: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px',
}
const BTN = (primary = false): React.CSSProperties => ({
  background: primary ? '#00D4FF' : 'rgba(0,212,255,0.1)',
  border:     primary ? 'none' : '1px solid rgba(0,212,255,0.2)',
  color:      primary ? '#06142D' : '#00D4FF',
  fontWeight: 700, fontSize: '13px', padding: '9px 18px',
  borderRadius: '8px', cursor: 'pointer', transition: 'opacity .15s',
})

function wordCount(s: string) { return s.trim().split(/\s+/).filter(Boolean).length }

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminModelSeo() {
  const [entries,  setEntries]  = useState<Entry[]>([])
  const [models,   setModels]   = useState<ModelOption[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<'all' | PageType>('all')
  const [modal,    setModal]    = useState<'add' | 'edit' | null>(null)
  const [editing,  setEditing]  = useState<Entry | null>(null)
  const [form,     setForm]     = useState<typeof BLANK>(BLANK)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null)

  const sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3500)
  }, [])

  async function loadEntries() {
    const res = await fetch('/api/admin/model-page-seo')
    const json = await res.json()
    setEntries((json.data ?? []) as Entry[])
    setLoading(false)
  }

  async function loadModels() {
    const { data } = await sb
      .from('models')
      .select('id, name, slug, brands(name, slug)')
      .order('name')
    setModels(((data ?? []) as unknown as { id: string; name: string; slug: string; brands: { name: string; slug: string } | null }[]).map(r => ({
      id:         r.id,
      name:       r.name,
      slug:       r.slug,
      brand_name: r.brands?.name ?? '',
      brand_slug: r.brands?.slug ?? '',
    })))
  }

  useEffect(() => { loadEntries(); loadModels() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function openAdd() {
    setEditing(null); setForm(BLANK); setModal('add')
  }
  function openEdit(e: Entry) {
    setEditing(e)
    setForm({
      model_id:    e.model_id,
      page_type:   e.page_type as PageType,
      seo_heading: e.seo_heading ?? '',
      seo_text:    e.seo_text,
      faqs:        e.faqs ?? [],
      is_published: e.is_published,
    })
    setModal('edit')
  }
  function closeModal() { setModal(null); setEditing(null) }

  function setF<K extends keyof typeof BLANK>(k: K, v: typeof BLANK[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function addFaq() { setF('faqs', [...form.faqs, { question: '', answer: '' }]) }
  function setFaq(i: number, field: 'question' | 'answer', val: string) {
    const next = form.faqs.map((f, idx) => idx === i ? { ...f, [field]: val } : f)
    setF('faqs', next)
  }
  function removeFaq(i: number) { setF('faqs', form.faqs.filter((_, idx) => idx !== i)) }

  async function handleSave() {
    if (!form.model_id) { showToast('Select a model', false); return }
    setSaving(true)
    try {
      const payload = {
        model_id:    form.model_id,
        page_type:   form.page_type,
        seo_heading: form.seo_heading || null,
        seo_text:    form.seo_text,
        faqs:        form.faqs.filter(f => f.question && f.answer),
        is_published: form.is_published,
      }
      if (editing) {
        await dbUpdate('model_page_seo', editing.id, payload)
        showToast('Updated')
      } else {
        await dbInsert('model_page_seo', payload)
        showToast('Created')
      }
      closeModal()
      await loadEntries()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this SEO entry?')) return
    try {
      await dbDelete('model_page_seo', id)
      setEntries(prev => prev.filter(e => e.id !== id))
      showToast('Deleted')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Delete failed', false)
    }
  }

  const displayed = tab === 'all' ? entries : entries.filter(e => e.page_type === tab)

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: '9999px', cursor: 'pointer',
    fontSize: '12px', fontWeight: 700, border: 'none',
    background: tab === t ? '#00D4FF' : 'rgba(0,212,255,0.08)',
    color:      tab === t ? '#06142D' : '#00D4FF',
  })

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
          background: toast.ok ? '#00CC66' : '#FF4D4D', color: '#fff',
          padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>
            Model Page SEO
          </h1>
          <p style={{ color: '#8E99A8', fontSize: '13px', margin: '4px 0 0' }}>
            SEO text + FAQs for each model sub-page (images, specs, colours, etc.)
          </p>
        </div>
        <button style={BTN(true)} onClick={openAdd}>+ Add Entry</button>
      </div>

      {/* Page-type tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button style={tabStyle('all')} onClick={() => setTab('all')}>All ({entries.length})</button>
        {PAGE_TYPES.map(pt => (
          <button key={pt} style={tabStyle(pt)} onClick={() => setTab(pt)}>
            {pt.charAt(0).toUpperCase() + pt.slice(1)} ({entries.filter(e => e.page_type === pt).length})
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#8E99A8' }}>Loading…</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#8E99A8', background: '#0A1F44', borderRadius: '12px', border: '1px solid #1e3a6e' }}>
          No entries yet. Click &ldquo;+ Add Entry&rdquo; to create one.
        </div>
      ) : (
        <div style={{ background: '#0A1F44', borderRadius: '12px', border: '1px solid #1e3a6e', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e3a6e' }}>
                {['Model', 'Page', 'Words', 'FAQs', 'Published', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#8E99A8', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid rgba(30,58,110,0.4)' }}>
                  <td style={{ padding: '14px 16px', color: '#C0C0C0' }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>
                      {e.models?.brands?.name} {e.models?.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8E99A8', marginTop: '2px' }}>
                      /{e.models?.brands?.slug}/{e.models?.slug}/
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px' }}>
                      {e.page_type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#C0C0C0' }}>{wordCount(e.seo_text)}</td>
                  <td style={{ padding: '14px 16px', color: '#C0C0C0' }}>{e.faqs?.length ?? 0}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: e.is_published ? '#00CC66' : '#FF4D4D', fontWeight: 700, fontSize: '12px' }}>
                      {e.is_published ? '● Live' : '○ Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={{ ...BTN(), fontSize: '12px', padding: '5px 12px' }} onClick={() => openEdit(e)}>Edit</button>
                      <button
                        style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.2)', color: '#FF4D4D', fontWeight: 700, fontSize: '12px', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => handleDelete(e.id)}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}>
          <div style={{ background: '#0A1F44', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '680px' }}>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 900, color: '#fff', margin: '0 0 24px' }}>
              {modal === 'add' ? 'Add SEO Entry' : 'Edit SEO Entry'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Model selector */}
              <div>
                <label style={LABEL}>Model</label>
                <select style={{ ...INPUT }} value={form.model_id} onChange={e => setF('model_id', e.target.value)}>
                  <option value="">— Select model —</option>
                  {models.map(mo => (
                    <option key={mo.id} value={mo.id}>{mo.brand_name} {mo.name}</option>
                  ))}
                </select>
              </div>

              {/* Page type */}
              <div>
                <label style={LABEL}>Page Type</label>
                <select style={{ ...INPUT }} value={form.page_type} onChange={e => setF('page_type', e.target.value as PageType)}>
                  {PAGE_TYPES.map(pt => (
                    <option key={pt} value={pt}>{pt.charAt(0).toUpperCase() + pt.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* SEO heading */}
              <div>
                <label style={LABEL}>SEO Heading (optional)</label>
                <input style={INPUT} type="text" value={form.seo_heading ?? ''} onChange={e => setF('seo_heading', e.target.value)} placeholder="About [Model] Images…" />
              </div>

              {/* SEO text */}
              <div>
                <label style={LABEL}>SEO Text ({wordCount(form.seo_text)} words) — blank lines = new paragraph</label>
                <textarea
                  style={{ ...INPUT, minHeight: '160px', resize: 'vertical' }}
                  value={form.seo_text}
                  onChange={e => setF('seo_text', e.target.value)}
                  placeholder="Write 150–300 words about this page…"
                />
              </div>

              {/* FAQs */}
              <div>
                <label style={LABEL}>FAQs ({form.faqs.length})</label>
                {form.faqs.map((faq, i) => (
                  <div key={i} style={{ background: '#06142D', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#8E99A8', fontSize: '11px', fontWeight: 700 }}>FAQ {i + 1}</span>
                      <button onClick={() => removeFaq(i)} style={{ background: 'none', border: 'none', color: '#FF4D4D', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>×</button>
                    </div>
                    <input
                      style={{ ...INPUT, marginBottom: '8px' }}
                      type="text"
                      placeholder="Question"
                      value={faq.question}
                      onChange={e => setFaq(i, 'question', e.target.value)}
                    />
                    <textarea
                      style={{ ...INPUT, minHeight: '70px', resize: 'vertical' }}
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={e => setFaq(i, 'answer', e.target.value)}
                    />
                  </div>
                ))}
                <button style={{ ...BTN(), fontSize: '12px', padding: '6px 14px' }} onClick={addFaq}>+ Add FAQ</button>
              </div>

              {/* Published */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="pub" checked={form.is_published} onChange={e => setF('is_published', e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <label htmlFor="pub" style={{ color: '#C0C0C0', fontSize: '13px', cursor: 'pointer' }}>Published (visible on site)</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button style={BTN()} onClick={closeModal}>Cancel</button>
              <button style={BTN(true)} onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
