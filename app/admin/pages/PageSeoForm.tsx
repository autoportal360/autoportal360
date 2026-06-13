'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

type FaqRow = { q: string; a: string }
type PageType = 'city' | 'model' | 'brand' | 'specs' | 'new-cars' | 'new-bikes' | 'new-scooters' | 'home' | 'compare-cars' | 'compare-bikes' | 'compare-scooters' | 'custom'

const FIXED_KEYS: Partial<Record<PageType, string>> = {
  'new-cars':     'new-cars',
  'new-bikes':    'new-bikes',
  'new-scooters': 'new-scooters',
  'home':         'home',
}

function detectType(key: string): PageType {
  if (key.startsWith('city-'))             return 'city'
  if (key.startsWith('model-'))            return 'model'
  if (key.startsWith('brand-'))            return 'brand'
  if (key.startsWith('specs-'))            return 'specs'
  if (key.startsWith('compare-cars-'))     return 'compare-cars'
  if (key.startsWith('compare-bikes-'))    return 'compare-bikes'
  if (key.startsWith('compare-scooters-')) return 'compare-scooters'
  if (key === 'new-cars')                  return 'new-cars'
  if (key === 'new-bikes')                 return 'new-bikes'
  if (key === 'new-scooters')              return 'new-scooters'
  if (key === 'home')                      return 'home'
  return 'custom'
}

function buildKey(type: PageType, brand: string, model: string, city: string, brand2: string, model2: string): string {
  if (FIXED_KEYS[type]) return FIXED_KEYS[type]!
  const b  = brand.trim(),  m  = model.trim(),  c = city.trim()
  const b2 = brand2.trim(), m2 = model2.trim()
  if (type === 'city')              return b && m && c ? `city-${b}-${m}-${c}` : ''
  if (type === 'model')             return b && m ? `model-${b}-${m}` : ''
  if (type === 'brand')             return b ? `brand-${b}` : ''
  if (type === 'specs')             return b && m ? `specs-${b}-${m}` : ''
  if (type === 'compare-cars')      return b && m && b2 && m2 ? `compare-cars-${b}-${m}-vs-${b2}-${m2}` : ''
  if (type === 'compare-bikes')     return b && m && b2 && m2 ? `compare-bikes-${b}-${m}-vs-${b2}-${m2}` : ''
  if (type === 'compare-scooters')  return b && m && b2 && m2 ? `compare-scooters-${b}-${m}-vs-${b2}-${m2}` : ''
  return ''
}

const supabaseClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─────────────────────────────────────────────────────────────────────────────

export default function PageSeoForm({
  recordId,
  initialKey,
}: {
  recordId?: string
  initialKey?: string
}) {
  const router = useRouter()

  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [toast,      setToast]      = useState<string | null>(null)
  const [existingId, setExistingId] = useState<string | null>(recordId ?? null)

  const [pageType,    setPageType]    = useState<PageType>('custom')
  const [brandSlug,   setBrandSlug]   = useState('')
  const [modelSlug,   setModelSlug]   = useState('')
  const [citySlug,    setCitySlug]    = useState('')
  const [brand2Slug,  setBrand2Slug]  = useState('')
  const [model2Slug,  setModel2Slug]  = useState('')
  const [pageKey,     setPageKey]     = useState(initialKey ?? '')

  const [metaTitle,  setMetaTitle]  = useState('')
  const [metaDesc,   setMetaDesc]   = useState('')
  const [h1,         setH1]         = useState('')
  const [introText,  setIntroText]  = useState('')
  const [seoContent, setSeoContent] = useState('')
  const [faqs,       setFaqs]       = useState<FaqRow[]>([{ q: '', a: '' }])
  const [schemaJson, setSchemaJson] = useState('')

  // ── Load existing record ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const sb = supabaseClient()
      let data: Record<string, unknown> | null = null

      if (recordId) {
        const res = await sb.from('page_seo').select('*').eq('id', recordId).single()
        data = res.data
      } else if (initialKey) {
        const res = await sb.from('page_seo').select('*').eq('page_key', initialKey).maybeSingle()
        data = res.data
      }

      if (data) {
        setExistingId(data.id as string)
        const key = data.page_key as string
        setPageKey(key)
        setPageType(detectType(key))
        setMetaTitle((data.meta_title as string) ?? '')
        setMetaDesc((data.meta_description as string) ?? '')
        setH1((data.h1 as string) ?? '')
        setIntroText((data.intro_text as string) ?? '')
        setSeoContent((data.seo_content as string) ?? '')
        setSchemaJson((data.schema_jsonld as string) ?? '')
        const rawFaqs = data.faqs as FaqRow[] | null
        if (rawFaqs && rawFaqs.length > 0) setFaqs(rawFaqs)
      } else if (initialKey) {
        setPageType(detectType(initialKey))
      }
      setLoading(false)
    }
    load()
  }, [recordId, initialKey])

  // ── Auto-build page_key from slug helpers ─────────────────────────────────
  useEffect(() => {
    if (pageType === 'custom') return
    const built = buildKey(pageType, brandSlug, modelSlug, citySlug, brand2Slug, model2Slug)
    if (built) setPageKey(built)
    else if (FIXED_KEYS[pageType]) setPageKey(FIXED_KEYS[pageType]!)
  }, [pageType, brandSlug, modelSlug, citySlug, brand2Slug, model2Slug])

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!pageKey.trim()) { setToast('❌ Page key is required'); return }
    setSaving(true)
    const sb = supabaseClient()
    const payload = {
      page_key:         pageKey.trim(),
      page_type:        pageType,
      meta_title:       metaTitle.trim()  || null,
      meta_description: metaDesc.trim()   || null,
      h1:               h1.trim()         || null,
      intro_text:       introText.trim()  || null,
      seo_content:      seoContent.trim() || null,
      faqs:             faqs.filter(f => f.q.trim()).length > 0 ? faqs.filter(f => f.q.trim()) : null,
      schema_jsonld:    schemaJson.trim()  || null,
      updated_at:       new Date().toISOString(),
    }

    const { data, error } = existingId
      ? await sb.from('page_seo').update(payload).eq('id', existingId).select().single()
      : await sb.from('page_seo').upsert(payload, { onConflict: 'page_key' }).select().single()

    setSaving(false)
    if (error) {
      setToast(`❌ ${error.message}`)
      setTimeout(() => setToast(null), 5000)
      return
    }
    if (data && !existingId) {
      setExistingId((data as { id: string }).id)
      router.replace(`/admin/pages/${(data as { id: string }).id}`)
    }
    setToast('✅ Saved successfully')
    setTimeout(() => setToast(null), 4000)
  }

  // ── FAQ helpers ───────────────────────────────────────────────────────────
  function addFaq()  { setFaqs(f => [...f, { q: '', a: '' }]) }
  function removeFaq(i: number) { setFaqs(f => f.filter((_, idx) => idx !== i)) }
  function updateFaq(i: number, field: 'q' | 'a', val: string) {
    setFaqs(f => f.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const labelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 700, color: '#8E99A8', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }
  const inputStyle: React.CSSProperties = { width: '100%', background: '#06142D', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#FFFFFF', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }
  const taStyle: React.CSSProperties    = { ...inputStyle, resize: 'vertical', minHeight: '90px' }
  const sectionStyle: React.CSSProperties = { background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }
  const sectionTitle: React.CSSProperties = { fontFamily: 'Montserrat, sans-serif', fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 20px' }
  const gridTwo: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }

  if (loading) return <div style={{ color: '#8E99A8', padding: '48px', textAlign: 'center' }}>Loading…</div>

  const PAGE_TYPES: PageType[] = ['city', 'model', 'brand', 'specs', 'new-cars', 'new-bikes', 'new-scooters', 'home', 'compare-cars', 'compare-bikes', 'compare-scooters', 'custom']
  const isCompare = pageType === 'compare-cars' || pageType === 'compare-bikes' || pageType === 'compare-scooters'

  return (
    <div style={{ maxWidth: '860px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '22px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px' }}>
            {existingId ? 'Edit Page SEO' : 'New Page SEO'}
          </h1>
          {pageKey && <code style={{ fontSize: '11px', color: '#8E99A8' }}>{pageKey}</code>}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: '#00D4FF', color: '#06142D', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '13px', padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {toast && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', background: toast.startsWith('❌') ? 'rgba(244,67,54,0.1)' : 'rgba(0,212,255,0.1)', border: `1px solid ${toast.startsWith('❌') ? 'rgba(244,67,54,0.3)' : 'rgba(0,212,255,0.3)'}`, borderRadius: '10px', fontSize: '13px', color: toast.startsWith('❌') ? '#f44336' : '#00D4FF', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* ── SECTION 1: Page Identification ── */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Page Identification</div>

        {/* Page Type */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Page Type</label>
          <select
            value={pageType}
            onChange={e => setPageType(e.target.value as PageType)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {PAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Slug helpers — standard page types */}
        {(pageType === 'city' || pageType === 'model' || pageType === 'brand' || pageType === 'specs') && (
          <div style={{ ...gridTwo, marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Brand Slug</label>
              <input style={inputStyle} value={brandSlug} onChange={e => setBrandSlug(e.target.value)} placeholder="e.g. maruti-suzuki-cars" />
            </div>
            {(pageType === 'city' || pageType === 'model' || pageType === 'specs') && (
              <div>
                <label style={labelStyle}>Model Slug</label>
                <input style={inputStyle} value={modelSlug} onChange={e => setModelSlug(e.target.value)} placeholder="e.g. swift" />
              </div>
            )}
            {pageType === 'city' && (
              <div>
                <label style={labelStyle}>City Slug</label>
                <input style={inputStyle} value={citySlug} onChange={e => setCitySlug(e.target.value)} placeholder="e.g. lucknow" />
              </div>
            )}
          </div>
        )}

        {/* Slug helpers — compare page types */}
        {isCompare && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#8E99A8', marginBottom: '10px', fontWeight: 600 }}>
              Vehicle 1
            </div>
            <div style={{ ...gridTwo, marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Brand DB Slug</label>
                <input style={inputStyle} value={brandSlug} onChange={e => setBrandSlug(e.target.value)} placeholder="e.g. tata" />
              </div>
              <div>
                <label style={labelStyle}>Model Slug</label>
                <input style={inputStyle} value={modelSlug} onChange={e => setModelSlug(e.target.value)} placeholder="e.g. punch" />
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#8E99A8', marginBottom: '10px', fontWeight: 600 }}>
              Vehicle 2
            </div>
            <div style={gridTwo}>
              <div>
                <label style={labelStyle}>Brand DB Slug</label>
                <input style={inputStyle} value={brand2Slug} onChange={e => setBrand2Slug(e.target.value)} placeholder="e.g. maruti-suzuki" />
              </div>
              <div>
                <label style={labelStyle}>Model Slug</label>
                <input style={inputStyle} value={model2Slug} onChange={e => setModel2Slug(e.target.value)} placeholder="e.g. swift" />
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#8E99A8', marginTop: '8px' }}>
              💡 Auto-generates key: <code style={{ color: '#00D4FF' }}>compare-cars-{brandSlug || 'brand1'}-{modelSlug || 'model1'}-vs-{brand2Slug || 'brand2'}-{model2Slug || 'model2'}</code>
            </div>
          </div>
        )}

        {/* Page Key */}
        <div>
          <label style={labelStyle}>
            Page Key
            {pageType !== 'custom' && pageType !== 'home' && !FIXED_KEYS[pageType] && (
              <span style={{ marginLeft: '8px', color: '#00D4FF', textTransform: 'none', fontWeight: 600 }}>— auto-built from slugs above, or edit manually</span>
            )}
          </label>
          <input
            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }}
            value={pageKey}
            onChange={e => setPageKey(e.target.value)}
            placeholder="e.g. city-maruti-suzuki-cars-swift-lucknow"
            readOnly={!!FIXED_KEYS[pageType]}
          />
        </div>
      </div>

      {/* ── SECTION 2: SEO Meta ── */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>SEO Meta</div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Meta Title <span style={{ color: '#8E99A8', fontWeight: 400, textTransform: 'none' }}>— overrides default</span></label>
          <input style={inputStyle} value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Leave blank to use default" />
          <div style={{ fontSize: '11px', color: metaTitle.length > 60 ? '#FF9800' : '#8E99A8', marginTop: '5px' }}>
            {metaTitle.length}/60 chars recommended
          </div>
        </div>
        <div>
          <label style={labelStyle}>Meta Description <span style={{ color: '#8E99A8', fontWeight: 400, textTransform: 'none' }}>— overrides default</span></label>
          <textarea style={taStyle} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder="Leave blank to use default" />
          <div style={{ fontSize: '11px', color: metaDesc.length > 160 ? '#FF9800' : '#8E99A8', marginTop: '5px' }}>
            {metaDesc.length}/160 chars recommended
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Page Content ── */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Page Content</div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>H1 Heading <span style={{ color: '#8E99A8', fontWeight: 400, textTransform: 'none' }}>— overrides default</span></label>
          <input style={inputStyle} value={h1} onChange={e => setH1(e.target.value)} placeholder="Leave blank to use default" />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Intro Text <span style={{ color: '#8E99A8', fontWeight: 400, textTransform: 'none' }}>— shown below H1</span></label>
          <textarea style={{ ...taStyle, minHeight: '80px' }} value={introText} onChange={e => setIntroText(e.target.value)} placeholder="Optional short intro paragraph…" />
        </div>
        <div>
          <label style={labelStyle}>SEO Content HTML <span style={{ color: '#8E99A8', fontWeight: 400, textTransform: 'none' }}>— shown before FAQ section</span></label>
          <textarea style={{ ...taStyle, minHeight: '160px', fontFamily: 'monospace', fontSize: '12px' }} value={seoContent} onChange={e => setSeoContent(e.target.value)} placeholder="<p>Rich SEO content HTML…</p>" />
        </div>
      </div>

      {/* ── SECTION 4: FAQs ── */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={sectionTitle}>FAQs <span style={{ color: '#8E99A8', fontSize: '12px', fontWeight: 600 }}>— overrides auto-generated FAQs</span></div>
          <button
            onClick={addFaq}
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '6px 14px', color: '#00D4FF', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            + Add FAQ
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.08)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase' }}>FAQ {i + 1}</span>
                {faqs.length > 1 && (
                  <button onClick={() => removeFaq(i)} style={{ background: 'none', border: 'none', color: '#8E99A8', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 4px' }}>×</button>
                )}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ ...labelStyle, marginBottom: '5px' }}>Question</label>
                <input style={inputStyle} value={faq.q} onChange={e => updateFaq(i, 'q', e.target.value)} placeholder="What is the…?" />
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom: '5px' }}>Answer</label>
                <textarea style={{ ...taStyle, minHeight: '70px' }} value={faq.a} onChange={e => updateFaq(i, 'a', e.target.value)} placeholder="The answer…" />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#8E99A8' }}>
          💡 Leave all questions blank to use the auto-generated FAQs from page context.
        </div>
      </div>

      {/* ── SECTION 5: Schema JSON-LD ── */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Schema JSON-LD</div>
        <textarea
          style={{ ...taStyle, minHeight: '140px', fontFamily: 'monospace', fontSize: '12px' }}
          value={schemaJson}
          onChange={e => setSchemaJson(e.target.value)}
          placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  …\n}'}
        />
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#8E99A8' }}>
          Paste valid JSON-LD. Injected as a <code style={{ color: '#00D4FF' }}>&lt;script type=&quot;application/ld+json&quot;&gt;</code> tag on the page.
        </div>
      </div>

      {/* Footer save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={() => router.push('/admin/pages')}
          style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '10px', padding: '10px 20px', color: '#8E99A8', fontSize: '13px', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: '#00D4FF', color: '#06142D', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '13px', padding: '10px 32px', borderRadius: '10px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : 'Save Page SEO'}
        </button>
      </div>

    </div>
  )
}
