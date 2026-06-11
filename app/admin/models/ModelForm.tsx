'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toSlug } from '@/lib/utils'
import type { Brand } from '@/types'

// ─── style tokens ──────────────────────────────────────────────────────────────

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

const BTN_PRIMARY: React.CSSProperties = {
  background: '#00D4FF', color: '#06142D',
  fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
  fontSize: 13, padding: '10px 24px',
  borderRadius: '10px', border: 'none', cursor: 'pointer',
}

const BTN_GHOST: React.CSSProperties = {
  background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
  border: '1px solid rgba(0,212,255,0.2)',
  borderRadius: '8px', padding: '8px 16px',
  fontSize: 12, fontWeight: 700, cursor: 'pointer',
}

const BTN_DANGER: React.CSSProperties = {
  background: 'rgba(255,80,80,0.08)', color: '#FF8080',
  border: '1px solid rgba(255,80,80,0.2)',
  borderRadius: '6px', width: 28, height: 28,
  fontSize: 16, cursor: 'pointer', lineHeight: '1',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// ─── helper components ─────────────────────────────────────────────────────────

function Field({
  label, hint, error, counter, children,
}: {
  label: string; hint?: string; error?: string
  counter?: React.ReactNode; children: React.ReactNode
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
  const len = value.length
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
      color: len > max ? '#FF6B6B' : len > max * 0.85 ? '#FFB400' : '#8E99A8',
    }}>
      {len}/{max}
    </span>
  )
}

function LockedMessage() {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 32px',
      border: '1px dashed rgba(0,212,255,0.15)', borderRadius: 12,
      color: '#8E99A8', fontSize: 13,
    }}>
      Save <strong style={{ color: '#00D4FF' }}>Basic Info</strong> first to unlock this tab.
    </div>
  )
}

// ─── types ─────────────────────────────────────────────────────────────────────

interface FormState {
  brand_id: string; name: string; slug: string
  type: string; body_type: string; segment: string
  launch_year: string; status: string
  price_min: string; price_max: string
}

interface SeoState {
  meta_title: string; meta_description: string
  overview_html: string; schema_json: string
}

interface VariantRow {
  id?: string; name: string; slug: string
  fuel_type: string; transmission: string
  ex_showroom_price: string; is_popular: boolean; sort_order: string
}

interface SpecState {
  engine_cc: string; power_bhp: string; torque_nm: string
  mileage_arai: string; fuel_tank_l: string; seating: string
  boot_space_l: string; ground_clearance_mm: string
  length_mm: string; width_mm: string; height_mm: string
  wheelbase_mm: string; kerb_weight_kg: string
  tyre_size: string; ncap_rating: string
}

interface ImageRow {
  id?: string; url: string; alt_text: string
  type: string; sort_order: string
  file?: File; preview?: string
}

interface ColourRow {
  id?: string; name: string; hex_code: string
  image_url: string; is_available: boolean; sort_order: string
  file?: File; preview?: string
}

interface FaqRow { id?: string; question: string; answer: string }

const DEFAULT_FORM: FormState = {
  brand_id: '', name: '', slug: '', type: 'car',
  body_type: '', segment: '', launch_year: '',
  status: 'active', price_min: '', price_max: '',
}

const DEFAULT_SEO: SeoState = {
  meta_title: '', meta_description: '', overview_html: '', schema_json: '',
}

const DEFAULT_SPEC: SpecState = {
  engine_cc: '', power_bhp: '', torque_nm: '', mileage_arai: '',
  fuel_tank_l: '', seating: '', boot_space_l: '', ground_clearance_mm: '',
  length_mm: '', width_mm: '', height_mm: '', wheelbase_mm: '',
  kerb_weight_kg: '', tyre_size: '', ncap_rating: '',
}

const TABS = ['Basic Info', 'Variants', 'Specs', 'Images', 'Colours', 'FAQs', 'SEO']

const IMAGE_TYPES = ['exterior', 'interior', 'colour', 'detail', 'road-test']

// ─── main component ────────────────────────────────────────────────────────────

export default function ModelForm({ modelId }: { modelId?: string }) {
  const router   = useRouter()
  const isEdit   = !!modelId
  const sbRef    = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current

  // ── core state ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]         = useState(0)
  const [currentModelId, setCurrentModelId] = useState<string | undefined>(modelId)
  const [brands, setBrands]               = useState<Pick<Brand, 'id' | 'name' | 'slug' | 'type'>[]>([])

  const [form, setForm]           = useState<FormState>(DEFAULT_FORM)
  const [seo,  setSeo]            = useState<SeoState>(DEFAULT_SEO)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const [thumbExisting, setThumbExisting] = useState<string | null>(null)

  const [variants, setVariants]           = useState<VariantRow[]>([])
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([])

  const [specVariantId, setSpecVariantId] = useState('')
  const [specId,        setSpecId]        = useState<string | undefined>()
  const [spec,          setSpec]          = useState<SpecState>(DEFAULT_SPEC)
  const [specLoading,   setSpecLoading]   = useState(false)

  const [images,  setImages]  = useState<ImageRow[]>([])
  const [colours, setColours] = useState<ColourRow[]>([])
  const [faqs,    setFaqs]    = useState<FaqRow[]>([])

  const [loading,      setLoading]      = useState(isEdit)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')
  const [fieldErrors,  setFieldErrors]  = useState<Partial<Record<keyof FormState, string>>>({})
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null)

  // ── toast ─────────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── load brands ───────────────────────────────────────────────────────────────
  useEffect(() => {
    sb.from('brands').select('id, name, slug, type').order('name')
      .then(({ data }) => setBrands((data ?? []) as Pick<Brand, 'id' | 'name' | 'slug' | 'type'>[]))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── load model data ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!modelId) return
    Promise.all([
      sb.from('models').select('*').eq('id', modelId).single(),
      sb.from('variants').select('*').eq('model_id', modelId).order('sort_order'),
      sb.from('model_images').select('*').eq('model_id', modelId).order('sort_order'),
      sb.from('model_colours').select('*').eq('model_id', modelId).order('sort_order'),
      sb.from('model_faqs').select('*').eq('model_id', modelId).order('sort_order'),
    ]).then(([{ data: m, error: mErr }, { data: vars }, { data: imgs }, { data: cols }, { data: faqs }]) => {
      if (mErr || !m) { setError('Model not found'); setLoading(false); return }

      const r = m as Record<string, unknown>
      setForm({
        brand_id:    (r.brand_id    as string) ?? '',
        name:        (r.name        as string) ?? '',
        slug:        (r.slug        as string) ?? '',
        type:        (r.type        as string) ?? 'car',
        body_type:   (r.body_type   as string) ?? '',
        segment:     (r.segment     as string) ?? '',
        launch_year: r.launch_year != null ? String(r.launch_year) : '',
        status:      (r.status      as string) ?? 'active',
        price_min:   r.price_min   != null ? String(r.price_min)   : '',
        price_max:   r.price_max   != null ? String(r.price_max)   : '',
      })
      setSeo({
        meta_title:       (r.meta_title       as string) ?? '',
        meta_description: (r.meta_description as string) ?? '',
        overview_html:    (r.overview_html    as string) ?? '',
        schema_json:      (r.schema_json      as string) ?? '',
      })
      setThumbExisting((r.thumbnail_url as string) ?? null)
      setThumbPreview((r.thumbnail_url as string) ?? null)

      setVariants((vars ?? []).map(v => ({
        id: v.id as string, name: v.name as string, slug: v.slug as string,
        fuel_type: (v.fuel_type as string) ?? '',
        transmission: (v.transmission as string) ?? '',
        ex_showroom_price: v.ex_showroom_price != null ? String(v.ex_showroom_price) : '',
        is_popular: Boolean(v.is_popular),
        sort_order: v.sort_order != null ? String(v.sort_order) : '0',
      })))

      setImages((imgs ?? []).map(i => ({
        id: i.id as string, url: (i.url as string) ?? '',
        alt_text: (i.alt_text as string) ?? '',
        type: (i.type as string) ?? 'exterior',
        sort_order: i.sort_order != null ? String(i.sort_order) : '0',
        preview: (i.url as string) ?? '',
      })))

      setColours((cols ?? []).map(c => ({
        id: c.id as string, name: (c.name as string) ?? '',
        hex_code: (c.hex_code as string) ?? '',
        image_url: (c.image_url as string) ?? '',
        is_available: Boolean(c.is_available),
        sort_order: c.sort_order != null ? String(c.sort_order) : '0',
        preview: (c.image_url as string) ?? '',
      })))

      setFaqs((faqs ?? []).map(f => ({
        id: f.id as string,
        question: (f.question as string) ?? '',
        answer: (f.answer as string) ?? '',
      })))

      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId])

  // ── load specs when variant selection changes ─────────────────────────────────
  useEffect(() => {
    if (!specVariantId) { setSpec(DEFAULT_SPEC); setSpecId(undefined); return }
    setSpecLoading(true)
    sb.from('specs').select('*').eq('variant_id', specVariantId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          const r = data as Record<string, unknown>
          setSpecId(r.id as string)
          setSpec({
            engine_cc:          r.engine_cc          != null ? String(r.engine_cc)          : '',
            power_bhp:          r.power_bhp          != null ? String(r.power_bhp)          : '',
            torque_nm:          r.torque_nm          != null ? String(r.torque_nm)          : '',
            mileage_arai:       r.mileage_arai       != null ? String(r.mileage_arai)       : '',
            fuel_tank_l:        r.fuel_tank_l        != null ? String(r.fuel_tank_l)        : '',
            seating:            r.seating            != null ? String(r.seating)            : '',
            boot_space_l:       r.boot_space_l       != null ? String(r.boot_space_l)       : '',
            ground_clearance_mm:r.ground_clearance_mm != null ? String(r.ground_clearance_mm) : '',
            length_mm:          r.length_mm          != null ? String(r.length_mm)          : '',
            width_mm:           r.width_mm           != null ? String(r.width_mm)           : '',
            height_mm:          r.height_mm          != null ? String(r.height_mm)          : '',
            wheelbase_mm:       r.wheelbase_mm       != null ? String(r.wheelbase_mm)       : '',
            kerb_weight_kg:     r.kerb_weight_kg     != null ? String(r.kerb_weight_kg)     : '',
            tyre_size:          (r.tyre_size         as string) ?? '',
            ncap_rating:        (r.ncap_rating       as string) ?? '',
          })
        } else {
          setSpecId(undefined)
          setSpec(DEFAULT_SPEC)
        }
        setSpecLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specVariantId])

  // ── field helpers ─────────────────────────────────────────────────────────────
  function setF<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
    setFieldErrors(e => ({ ...e, [key]: undefined }))
  }

  function handleNameChange(val: string) {
    setF('name', val)
    if (!currentModelId) setF('slug', toSlug(val))
  }

  function handleBrandChange(id: string) {
    setF('brand_id', id)
    const brand = brands.find(b => b.id === id)
    if (brand) setF('type', brand.type)
  }

  function getBrandSlug() {
    return brands.find(b => b.id === form.brand_id)?.slug ?? 'unknown'
  }

  // ── thumbnail ─────────────────────────────────────────────────────────────────
  function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (thumbPreview?.startsWith('blob:')) URL.revokeObjectURL(thumbPreview)
    setThumbFile(file)
    setThumbPreview(URL.createObjectURL(file))
  }

  async function uploadThumb(brandSlug: string, modelSlug: string): Promise<string | null> {
    if (!thumbFile) return thumbExisting
    const path = `${brandSlug}/${modelSlug}/thumb.webp`
    const { error } = await sb.storage.from('models').upload(path, thumbFile, {
      contentType: thumbFile.type, upsert: true,
    })
    if (error) throw new Error(`Thumb upload: ${error.message}`)
    return sb.storage.from('models').getPublicUrl(path).data.publicUrl
  }

  // ── variant helpers ───────────────────────────────────────────────────────────
  function addVariant() {
    setVariants(vs => [...vs, {
      name: '', slug: '', fuel_type: '', transmission: '',
      ex_showroom_price: '', is_popular: false, sort_order: String(vs.length),
    }])
  }

  function updateVariant<K extends keyof VariantRow>(i: number, key: K, val: VariantRow[K]) {
    setVariants(vs => vs.map((v, idx) => {
      if (idx !== i) return v
      const updated = { ...v, [key]: val }
      if (key === 'name' && !v.id) updated.slug = toSlug(val as string)
      return updated
    }))
  }

  function removeVariant(i: number) {
    const v = variants[i]
    if (v.id) setDeletedVariantIds(ids => [...ids, v.id!])
    setVariants(vs => vs.filter((_, idx) => idx !== i))
  }

  // ── image helpers ─────────────────────────────────────────────────────────────
  function handleImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newRows: ImageRow[] = files.map((file, i) => ({
      url: '', alt_text: '', type: 'exterior',
      sort_order: String(images.length + i),
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages(imgs => [...imgs, ...newRows])
    e.target.value = ''
  }

  function updateImage<K extends keyof ImageRow>(i: number, key: K, val: ImageRow[K]) {
    setImages(imgs => imgs.map((img, idx) => idx === i ? { ...img, [key]: val } : img))
  }

  function removeImage(i: number) {
    setImages(imgs => {
      const img = imgs[i]
      if (img.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview)
      return imgs.filter((_, idx) => idx !== i)
    })
  }

  // ── colour helpers ────────────────────────────────────────────────────────────
  function addColour() {
    setColours(cs => [...cs, {
      name: '', hex_code: '', image_url: '',
      is_available: true, sort_order: String(cs.length),
    }])
  }

  function updateColour<K extends keyof ColourRow>(i: number, key: K, val: ColourRow[K]) {
    setColours(cs => cs.map((c, idx) => idx === i ? { ...c, [key]: val } : c))
  }

  function handleColourFile(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const col = colours[i]
    if (col.preview?.startsWith('blob:')) URL.revokeObjectURL(col.preview)
    setColours(cs => cs.map((c, idx) => idx === i
      ? { ...c, file, preview: URL.createObjectURL(file) }
      : c
    ))
  }

  function removeColour(i: number) {
    setColours(cs => {
      const c = cs[i]
      if (c.preview?.startsWith('blob:')) URL.revokeObjectURL(c.preview)
      return cs.filter((_, idx) => idx !== i)
    })
  }

  // ── FAQ helpers ───────────────────────────────────────────────────────────────
  function addFaq()        { setFaqs(f => [...f, { question: '', answer: '' }]) }
  function removeFaq(i: number) { setFaqs(f => f.filter((_, idx) => idx !== i)) }
  function updateFaq(i: number, key: 'question' | 'answer', val: string) {
    setFaqs(f => f.map((faq, idx) => idx === i ? { ...faq, [key]: val } : faq))
  }

  // ── validate basic info ───────────────────────────────────────────────────────
  function validate(): Partial<Record<keyof FormState, string>> {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.brand_id)       errs.brand_id = 'Brand is required'
    if (!form.name.trim())    errs.name     = 'Name is required'
    if (!form.slug.trim())    errs.slug     = 'Slug is required'
    if (!/^[a-z0-9-]+$/.test(form.slug))
      errs.slug = 'Lowercase letters, numbers and hyphens only'
    if (form.price_min && form.price_max &&
        Number(form.price_min) > Number(form.price_max))
      errs.price_max = 'Max must be ≥ Min'
    return errs
  }

  // ── save basic info ───────────────────────────────────────────────────────────
  async function saveBasicInfo() {
    setError('')
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setSaving(true)
    try {
      const brandSlug   = getBrandSlug()
      const thumbnail_url = await uploadThumb(brandSlug, form.slug.trim())
      const payload = {
        brand_id:     form.brand_id,
        name:         form.name.trim(),
        slug:         form.slug.trim(),
        type:         form.type,
        body_type:    form.body_type.trim()  || null,
        segment:      form.segment.trim()    || null,
        launch_year:  form.launch_year       ? Number(form.launch_year) : null,
        status:       form.status,
        price_min:    form.price_min         ? Number(form.price_min)   : null,
        price_max:    form.price_max         ? Number(form.price_max)   : null,
        thumbnail_url,
      }
      if (currentModelId) {
        const { error: uErr } = await sb.from('models').update(payload).eq('id', currentModelId)
        if (uErr) throw new Error(uErr.message)
      } else {
        const { data, error: iErr } = await sb.from('models').insert(payload).select('id').single()
        if (iErr) throw new Error(iErr.message)
        setCurrentModelId(data.id as string)
      }
      showToast('Basic info saved!', true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      setError(msg); showToast(msg, false)
    }
    setSaving(false)
  }

  // ── save variants ─────────────────────────────────────────────────────────────
  async function saveVariants() {
    if (!currentModelId) return
    setSaving(true)
    try {
      if (deletedVariantIds.length) {
        const { error } = await sb.from('variants').delete().in('id', deletedVariantIds)
        if (error) throw new Error(error.message)
        setDeletedVariantIds([])
      }
      const valid = variants.filter(v => v.name.trim())
      for (const v of valid.filter(v => v.id)) {
        const { error } = await sb.from('variants').update({
          name:               v.name.trim(),
          slug:               v.slug.trim()  || toSlug(v.name),
          fuel_type:          v.fuel_type.trim()     || null,
          transmission:       v.transmission.trim()  || null,
          ex_showroom_price:  Number(v.ex_showroom_price) || 0,
          is_popular:         v.is_popular,
          sort_order:         Number(v.sort_order)   || 0,
        }).eq('id', v.id!)
        if (error) throw new Error(error.message)
      }
      const newOnes = valid.filter(v => !v.id)
      if (newOnes.length) {
        const { error } = await sb.from('variants').insert(
          newOnes.map((v, i) => ({
            model_id:           currentModelId,
            name:               v.name.trim(),
            slug:               v.slug.trim()  || toSlug(v.name),
            fuel_type:          v.fuel_type.trim()    || null,
            transmission:       v.transmission.trim() || null,
            ex_showroom_price:  Number(v.ex_showroom_price) || 0,
            is_popular:         v.is_popular,
            sort_order:         Number(v.sort_order) || i,
          }))
        )
        if (error) throw new Error(error.message)
      }
      const { data: refreshed } = await sb.from('variants').select('*')
        .eq('model_id', currentModelId).order('sort_order')
      setVariants((refreshed ?? []).map(v => ({
        id: v.id as string, name: v.name as string, slug: v.slug as string,
        fuel_type: (v.fuel_type as string) ?? '',
        transmission: (v.transmission as string) ?? '',
        ex_showroom_price: v.ex_showroom_price != null ? String(v.ex_showroom_price) : '',
        is_popular: Boolean(v.is_popular),
        sort_order: v.sort_order != null ? String(v.sort_order) : '0',
      })))
      showToast('Variants saved!', true)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  // ── save specs ────────────────────────────────────────────────────────────────
  async function saveSpecs() {
    if (!specVariantId) return
    setSaving(true)
    try {
      const payload = {
        variant_id:          specVariantId,
        engine_cc:           spec.engine_cc           ? Number(spec.engine_cc)           : null,
        power_bhp:           spec.power_bhp           ? Number(spec.power_bhp)           : null,
        torque_nm:           spec.torque_nm           ? Number(spec.torque_nm)           : null,
        mileage_arai:        spec.mileage_arai        ? Number(spec.mileage_arai)        : null,
        fuel_tank_l:         spec.fuel_tank_l         ? Number(spec.fuel_tank_l)         : null,
        seating:             spec.seating             ? Number(spec.seating)             : null,
        boot_space_l:        spec.boot_space_l        ? Number(spec.boot_space_l)        : null,
        ground_clearance_mm: spec.ground_clearance_mm ? Number(spec.ground_clearance_mm) : null,
        length_mm:           spec.length_mm           ? Number(spec.length_mm)           : null,
        width_mm:            spec.width_mm            ? Number(spec.width_mm)            : null,
        height_mm:           spec.height_mm           ? Number(spec.height_mm)           : null,
        wheelbase_mm:        spec.wheelbase_mm        ? Number(spec.wheelbase_mm)        : null,
        kerb_weight_kg:      spec.kerb_weight_kg      ? Number(spec.kerb_weight_kg)      : null,
        tyre_size:           spec.tyre_size.trim()    || null,
        ncap_rating:         spec.ncap_rating.trim()  || null,
      }
      if (specId) {
        const { error } = await sb.from('specs').update(payload).eq('id', specId)
        if (error) throw new Error(error.message)
      } else {
        const { data, error } = await sb.from('specs').insert(payload).select('id').single()
        if (error) throw new Error(error.message)
        setSpecId(data.id as string)
      }
      showToast('Specs saved!', true)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  // ── save images ───────────────────────────────────────────────────────────────
  async function saveImages() {
    if (!currentModelId) return
    setSaving(true)
    try {
      const brandSlug = getBrandSlug()
      const modelSlug = form.slug || 'model'
      const uploaded  = await Promise.all(images.map(async (img, i) => {
        if (!img.file) return img
        const ext  = img.file.name.split('.').pop() ?? 'jpg'
        const path = `${brandSlug}/${modelSlug}/images/img-${Date.now()}-${i}.${ext}`
        const { error } = await sb.storage.from('models').upload(path, img.file, {
          contentType: img.file.type, upsert: true,
        })
        if (error) throw new Error(error.message)
        const url = sb.storage.from('models').getPublicUrl(path).data.publicUrl
        return { ...img, url, file: undefined, preview: url }
      }))

      await sb.from('model_images').delete().eq('model_id', currentModelId)
      const valid = uploaded.filter(img => img.url)
      if (valid.length) {
        const { error } = await sb.from('model_images').insert(
          valid.map((img, i) => ({
            model_id:  currentModelId, url: img.url,
            alt_text:  img.alt_text.trim() || null,
            type:      img.type,
            sort_order: Number(img.sort_order) || i,
          }))
        )
        if (error) throw new Error(error.message)
      }
      const { data: refreshed } = await sb.from('model_images').select('*')
        .eq('model_id', currentModelId).order('sort_order')
      setImages((refreshed ?? []).map(i => ({
        id: i.id as string, url: (i.url as string) ?? '',
        alt_text: (i.alt_text as string) ?? '',
        type: (i.type as string) ?? 'exterior',
        sort_order: i.sort_order != null ? String(i.sort_order) : '0',
        preview: (i.url as string) ?? '',
      })))
      showToast('Images saved!', true)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  // ── save colours ──────────────────────────────────────────────────────────────
  async function saveColours() {
    if (!currentModelId) return
    setSaving(true)
    try {
      const brandSlug = getBrandSlug()
      const modelSlug = form.slug || 'model'
      const uploaded  = await Promise.all(colours.map(async (col, i) => {
        if (!col.file) return col
        const ext  = col.file.name.split('.').pop() ?? 'jpg'
        const path = `${brandSlug}/${modelSlug}/colours/${toSlug(col.name) || `colour-${i}`}.${ext}`
        const { error } = await sb.storage.from('models').upload(path, col.file, {
          contentType: col.file.type, upsert: true,
        })
        if (error) throw new Error(error.message)
        const url = sb.storage.from('models').getPublicUrl(path).data.publicUrl
        return { ...col, image_url: url, file: undefined, preview: url }
      }))

      await sb.from('model_colours').delete().eq('model_id', currentModelId)
      const valid = uploaded.filter(c => c.name.trim())
      if (valid.length) {
        const { error } = await sb.from('model_colours').insert(
          valid.map((c, i) => ({
            model_id:    currentModelId, name: c.name.trim(),
            hex_code:    c.hex_code.trim()  || null,
            image_url:   c.image_url        || null,
            is_available: c.is_available,
            sort_order:  Number(c.sort_order) || i,
          }))
        )
        if (error) throw new Error(error.message)
      }
      const { data: refreshed } = await sb.from('model_colours').select('*')
        .eq('model_id', currentModelId).order('sort_order')
      setColours((refreshed ?? []).map(c => ({
        id: c.id as string, name: (c.name as string) ?? '',
        hex_code: (c.hex_code as string) ?? '',
        image_url: (c.image_url as string) ?? '',
        is_available: Boolean(c.is_available),
        sort_order: c.sort_order != null ? String(c.sort_order) : '0',
        preview: (c.image_url as string) ?? '',
      })))
      showToast('Colours saved!', true)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  // ── save FAQs ─────────────────────────────────────────────────────────────────
  async function saveFaqs() {
    if (!currentModelId) return
    setSaving(true)
    try {
      await sb.from('model_faqs').delete().eq('model_id', currentModelId)
      const valid = faqs.filter(f => f.question.trim() && f.answer.trim())
      if (valid.length) {
        const { error } = await sb.from('model_faqs').insert(
          valid.map((f, i) => ({
            model_id: currentModelId, question: f.question.trim(),
            answer: f.answer.trim(), sort_order: i,
          }))
        )
        if (error) throw new Error(error.message)
      }
      showToast('FAQs saved!', true)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  // ── save SEO ──────────────────────────────────────────────────────────────────
  async function saveSeo() {
    if (!currentModelId) return
    if (seo.schema_json.trim()) {
      try { JSON.parse(seo.schema_json) }
      catch { showToast('Invalid JSON in schema field', false); return }
    }
    setSaving(true)
    try {
      const { error } = await sb.from('models').update({
        meta_title:       seo.meta_title.trim()       || null,
        meta_description: seo.meta_description.trim() || null,
        overview_html:    seo.overview_html.trim()    || null,
        schema_json:      seo.schema_json.trim()      || null,
      }).eq('id', currentModelId)
      if (error) throw new Error(error.message)
      showToast('SEO saved!', true)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  // ── delete model ──────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!currentModelId || !window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return
    setSaving(true)
    try {
      const { error } = await sb.from('models').delete().eq('id', currentModelId)
      if (error) throw new Error(error.message)
      router.push('/admin/models')
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
  const locked = !currentModelId

  return (
    <div style={{ maxWidth: '860px' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toast.ok ? 'rgba(0,204,102,0.12)' : 'rgba(255,80,80,0.12)',
          border: `1px solid ${toast.ok ? 'rgba(0,204,102,0.35)' : 'rgba(255,80,80,0.35)'}`,
          color: toast.ok ? '#00CC66' : '#FF8080',
          padding: '14px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>{toast.ok ? '✓' : '✗'}</span>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
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
          {isEdit ? 'Edit Model' : 'New Model'}
        </h1>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={saving} style={{
            background: 'rgba(255,80,80,0.08)', color: '#FF8080',
            border: '1px solid rgba(255,80,80,0.2)',
            borderRadius: '8px', padding: '8px 16px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            Delete Model
          </button>
        )}
      </div>

      {/* ── Global error ── */}
      {error && (
        <div style={{
          background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
          fontSize: 13, color: '#FF6B6B',
        }}>
          {error}
        </div>
      )}

      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '24px',
        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: '12px', padding: '6px', flexWrap: 'wrap',
      }}>
        {TABS.map((tab, i) => {
          const isActive = activeTab === i
          const isLocked = locked && i > 0
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(i)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                background: isActive ? '#00D4FF' : 'transparent',
                color: isActive ? '#06142D' : isLocked ? '#444' : '#C0C0C0',
                transition: 'all 0.15s',
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1 — BASIC INFO */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <>
          <div style={CARD}>
            <p style={CARD_TITLE}>Basic Info</p>

            <Field label="Brand *" error={fieldErrors.brand_id}>
              <select
                value={form.brand_id}
                onChange={e => handleBrandChange(e.target.value)}
                style={{ ...INPUT, cursor: 'pointer', borderColor: fieldErrors.brand_id ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }}
              >
                <option value="">— Select a brand —</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Model Name *" error={fieldErrors.name}>
                <input
                  type="text" value={form.name} required
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Nexon"
                  style={{ ...INPUT, borderColor: fieldErrors.name ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }}
                />
              </Field>
              <Field label="Slug *" error={fieldErrors.slug}>
                <input
                  type="text" value={form.slug} required
                  onChange={e => setF('slug', e.target.value)}
                  placeholder="e.g. nexon"
                  style={{ ...INPUT, fontFamily: 'monospace', borderColor: fieldErrors.slug ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Type">
                <select
                  value={form.type}
                  onChange={e => setF('type', e.target.value)}
                  style={{ ...INPUT, cursor: 'pointer' }}
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={e => setF('status', e.target.value)}
                  style={{ ...INPUT, cursor: 'pointer' }}
                >
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Body Type">
                <input
                  type="text" value={form.body_type}
                  onChange={e => setF('body_type', e.target.value)}
                  placeholder="e.g. SUV, Sedan, Hatchback"
                  style={INPUT}
                />
              </Field>
              <Field label="Segment">
                <input
                  type="text" value={form.segment}
                  onChange={e => setF('segment', e.target.value)}
                  placeholder="e.g. Compact SUV, B-segment"
                  style={INPUT}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <Field label="Launch Year">
                <input
                  type="number" value={form.launch_year}
                  onChange={e => setF('launch_year', e.target.value)}
                  placeholder="e.g. 2019" min={1950} max={2030}
                  style={INPUT}
                />
              </Field>
              <Field label="Price Min (₹)">
                <input
                  type="number" value={form.price_min}
                  onChange={e => setF('price_min', e.target.value)}
                  placeholder="e.g. 800000" min={0}
                  style={INPUT}
                />
              </Field>
              <Field label="Price Max (₹)" error={fieldErrors.price_max}>
                <input
                  type="number" value={form.price_max}
                  onChange={e => setF('price_max', e.target.value)}
                  placeholder="e.g. 1400000" min={0}
                  style={{ ...INPUT, borderColor: fieldErrors.price_max ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }}
                />
              </Field>
            </div>
          </div>

          {/* Thumbnail */}
          <div style={CARD}>
            <p style={CARD_TITLE}>Thumbnail</p>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{
                width: 120, height: 80, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                background: thumbPreview ? '#111' : 'rgba(0,212,255,0.04)',
                border: thumbPreview ? 'none' : '2px dashed rgba(0,212,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {thumbPreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={thumbPreview} alt="Thumbnail preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: 11, color: '#8E99A8' }}>No image</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={LABEL}>Upload Thumbnail</label>
                <input type="file" accept="image/*" onChange={handleThumbChange} style={{
                  display: 'block', width: '100%', boxSizing: 'border-box',
                  background: 'rgba(0,212,255,0.04)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '10px', padding: '9px 14px',
                  color: '#8E99A8', fontSize: 13, cursor: 'pointer',
                }} />
                <p style={{ fontSize: 11, color: '#8E99A8', margin: '6px 0 0' }}>
                  Stored at models/{'{brand-slug}'}/{'{model-slug}'}/thumb.webp
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={saveBasicInfo} disabled={saving} style={{
              ...BTN_PRIMARY,
              opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 14, padding: '12px 32px',
            }}>
              {saving ? 'Saving…' : currentModelId ? 'Save Basic Info' : 'Create Model'}
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
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2 — VARIANTS */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        locked ? <LockedMessage /> : (
          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ ...CARD_TITLE, margin: 0 }}>Variants</p>
              <button type="button" onClick={addVariant} style={BTN_GHOST}>
                + Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px',
                border: '1px dashed rgba(0,212,255,0.15)', borderRadius: 12,
                color: '#8E99A8', fontSize: 13,
              }}>
                No variants yet. Click <strong style={{ color: '#00D4FF' }}>+ Add Variant</strong>.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
                      {['Name', 'Slug', 'Fuel Type', 'Transmission', 'Ex-Showroom (₹)', 'Popular', 'Sort', ''].map(h => (
                        <th key={h} style={{
                          padding: '8px 10px', textAlign: 'left',
                          color: '#8E99A8', fontWeight: 700, fontSize: 10,
                          textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
                        <td style={{ padding: '6px 6px 6px 0' }}>
                          <input
                            type="text" value={v.name} placeholder="e.g. XZ Plus"
                            onChange={e => updateVariant(i, 'name', e.target.value)}
                            style={{ ...INPUT, padding: '7px 10px', fontSize: 12, minWidth: 120 }}
                          />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input
                            type="text" value={v.slug}
                            onChange={e => updateVariant(i, 'slug', e.target.value)}
                            style={{ ...INPUT, padding: '7px 10px', fontSize: 11, fontFamily: 'monospace', minWidth: 100 }}
                          />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input
                            type="text" value={v.fuel_type} placeholder="Petrol"
                            onChange={e => updateVariant(i, 'fuel_type', e.target.value)}
                            style={{ ...INPUT, padding: '7px 10px', fontSize: 12, minWidth: 80 }}
                          />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input
                            type="text" value={v.transmission} placeholder="Manual"
                            onChange={e => updateVariant(i, 'transmission', e.target.value)}
                            style={{ ...INPUT, padding: '7px 10px', fontSize: 12, minWidth: 80 }}
                          />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input
                            type="number" value={v.ex_showroom_price} placeholder="0"
                            onChange={e => updateVariant(i, 'ex_showroom_price', e.target.value)}
                            style={{ ...INPUT, padding: '7px 10px', fontSize: 12, minWidth: 110 }}
                          />
                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => updateVariant(i, 'is_popular', !v.is_popular)}
                            title={v.is_popular ? 'Popular' : 'Not popular'}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: 20, lineHeight: 1,
                              color: v.is_popular ? '#FFB400' : '#444',
                            }}
                          >
                            {v.is_popular ? '★' : '☆'}
                          </button>
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input
                            type="number" value={v.sort_order}
                            onChange={e => updateVariant(i, 'sort_order', e.target.value)}
                            style={{ ...INPUT, padding: '7px 8px', fontSize: 12, width: 56 }}
                          />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <button
                            type="button" onClick={() => removeVariant(i)}
                            style={BTN_DANGER} title="Delete variant"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <button type="button" onClick={saveVariants} disabled={saving} style={{
                ...BTN_PRIMARY,
                opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer',
              }}>
                {saving ? 'Saving…' : 'Save Variants'}
              </button>
            </div>
          </div>
        )
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3 — SPECS */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        locked ? <LockedMessage /> : (
          <div style={CARD}>
            <p style={CARD_TITLE}>Specs</p>

            {variants.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px',
                border: '1px dashed rgba(0,212,255,0.15)', borderRadius: 12,
                color: '#8E99A8', fontSize: 13,
              }}>
                No saved variants yet. Go to <strong style={{ color: '#00D4FF' }}>Variants</strong> tab and save first.
              </div>
            ) : (
              <>
                <Field label="Select Variant" hint="Choose a variant to view or edit its specs.">
                  <select
                    value={specVariantId}
                    onChange={e => setSpecVariantId(e.target.value)}
                    style={{ ...INPUT, cursor: 'pointer' }}
                  >
                    <option value="">— Select variant —</option>
                    {variants.filter(v => v.id).map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </Field>

                {specVariantId && (
                  specLoading ? (
                    <p style={{ color: '#8E99A8', fontSize: 13 }}>Loading specs…</p>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        {([
                          ['Engine CC', 'engine_cc', 'cc', 'number'],
                          ['Power (BHP)', 'power_bhp', 'bhp', 'number'],
                          ['Torque (NM)', 'torque_nm', 'Nm', 'number'],
                          ['Mileage ARAI', 'mileage_arai', 'kmpl', 'number'],
                          ['Fuel Tank (L)', 'fuel_tank_l', 'litres', 'number'],
                          ['Seating', 'seating', 'persons', 'number'],
                          ['Boot Space (L)', 'boot_space_l', 'litres', 'number'],
                          ['Ground Clearance (MM)', 'ground_clearance_mm', 'mm', 'number'],
                          ['Length (MM)', 'length_mm', 'mm', 'number'],
                          ['Width (MM)', 'width_mm', 'mm', 'number'],
                          ['Height (MM)', 'height_mm', 'mm', 'number'],
                          ['Wheelbase (MM)', 'wheelbase_mm', 'mm', 'number'],
                          ['Kerb Weight (KG)', 'kerb_weight_kg', 'kg', 'number'],
                          ['Tyre Size', 'tyre_size', '', 'text'],
                          ['NCAP Rating', 'ncap_rating', '', 'text'],
                        ] as [string, keyof SpecState, string, string][]).map(([label, key, placeholder, inputType]) => (
                          <Field key={key} label={label}>
                            <input
                              type={inputType}
                              value={spec[key]}
                              placeholder={placeholder}
                              onChange={e => setSpec(s => ({ ...s, [key]: e.target.value }))}
                              style={INPUT}
                            />
                          </Field>
                        ))}
                      </div>

                      <button type="button" onClick={saveSpecs} disabled={saving} style={{
                        ...BTN_PRIMARY,
                        opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer',
                      }}>
                        {saving ? 'Saving…' : specId ? 'Update Specs' : 'Save Specs'}
                      </button>

                      {specId && (
                        <div style={{
                          marginTop: 28,
                          background: '#06142D',
                          border: '1px solid rgba(0,212,255,0.18)',
                          borderRadius: 12,
                          padding: '18px 20px',
                        }}>
                          <p style={{
                            margin: '0 0 14px',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.9px',
                            textTransform: 'uppercase',
                            color: '#00D4FF',
                          }}>Specs Preview</p>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '10px 16px',
                          }}>
                            {([
                              ['Engine',          spec.engine_cc      ? `${spec.engine_cc} cc`        : null],
                              ['Power',           spec.power_bhp      ? `${spec.power_bhp} bhp`       : null],
                              ['Torque',          spec.torque_nm      ? `${spec.torque_nm} Nm`        : null],
                              ['Mileage (ARAI)',  spec.mileage_arai   ? `${spec.mileage_arai} kmpl`   : null],
                              ['Fuel Tank',       spec.fuel_tank_l    ? `${spec.fuel_tank_l} L`       : null],
                              ['Seating',         spec.seating        ? `${spec.seating} persons`     : null],
                              ['Boot Space',      spec.boot_space_l   ? `${spec.boot_space_l} L`      : null],
                              ['Ground Clearance',spec.ground_clearance_mm ? `${spec.ground_clearance_mm} mm` : null],
                              ['Dimensions',      (spec.length_mm && spec.width_mm && spec.height_mm)
                                ? `${spec.length_mm} × ${spec.width_mm} × ${spec.height_mm} mm` : null],
                              ['Tyres',           spec.tyre_size      || null],
                              ['NCAP Rating',     spec.ncap_rating    || null],
                            ] as [string, string | null][]).filter(([, v]) => v !== null).map(([label, value]) => (
                              <div key={label}>
                                <div style={{ fontSize: 10, color: '#8E99A8', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                                <div style={{ fontSize: 13, color: '#E8F4FD', fontWeight: 600 }}>{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )
                )}
              </>
            )}
          </div>
        )
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4 — IMAGES */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 3 && (
        locked ? <LockedMessage /> : (
          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ ...CARD_TITLE, margin: 0 }}>Images</p>
              <label style={{
                ...BTN_GHOST, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center',
              }}>
                + Add Images
                <input
                  type="file" accept="image/*" multiple
                  onChange={handleImageFiles}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {images.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px',
                border: '1px dashed rgba(0,212,255,0.15)', borderRadius: 12,
                color: '#8E99A8', fontSize: 13,
              }}>
                No images yet. Click <strong style={{ color: '#00D4FF' }}>+ Add Images</strong> to upload.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {images.map((img, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '16px', alignItems: 'flex-start',
                    background: 'rgba(0,212,255,0.02)',
                    border: '1px solid rgba(0,212,255,0.08)',
                    borderRadius: '12px', padding: '14px',
                  }}>
                    {/* Preview */}
                    <div style={{
                      width: 80, height: 56, borderRadius: 8, flexShrink: 0,
                      background: img.preview ? '#111' : 'rgba(0,212,255,0.04)',
                      border: '1px solid rgba(0,212,255,0.1)',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {img.preview ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 10, color: '#8E99A8' }}>No preview</span>
                      )}
                    </div>

                    {/* Fields */}
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 60px', gap: '10px' }}>
                      <Field label="Alt Text" hint="">
                        <input
                          type="text" value={img.alt_text} placeholder="Describe the image…"
                          onChange={e => updateImage(i, 'alt_text', e.target.value)}
                          style={{ ...INPUT, padding: '7px 10px', fontSize: 12 }}
                        />
                      </Field>
                      <Field label="Type">
                        <select
                          value={img.type}
                          onChange={e => updateImage(i, 'type', e.target.value)}
                          style={{ ...INPUT, padding: '7px 10px', fontSize: 12, cursor: 'pointer' }}
                        >
                          {IMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </Field>
                      <Field label="Sort">
                        <input
                          type="number" value={img.sort_order}
                          onChange={e => updateImage(i, 'sort_order', e.target.value)}
                          style={{ ...INPUT, padding: '7px 8px', fontSize: 12 }}
                        />
                      </Field>
                    </div>

                    <button type="button" onClick={() => removeImage(i)} style={{ ...BTN_DANGER, marginTop: 20 }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <button type="button" onClick={saveImages} disabled={saving} style={{
                ...BTN_PRIMARY,
                opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer',
              }}>
                {saving ? 'Saving…' : 'Save Images'}
              </button>
            </div>
          </div>
        )
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 5 — COLOURS */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 4 && (
        locked ? <LockedMessage /> : (
          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ ...CARD_TITLE, margin: 0 }}>Colours</p>
              <button type="button" onClick={addColour} style={BTN_GHOST}>
                + Add Colour
              </button>
            </div>

            {colours.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px',
                border: '1px dashed rgba(0,212,255,0.15)', borderRadius: 12,
                color: '#8E99A8', fontSize: 13,
              }}>
                No colours yet. Click <strong style={{ color: '#00D4FF' }}>+ Add Colour</strong>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {colours.map((col, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                    background: 'rgba(0,212,255,0.02)',
                    border: '1px solid rgba(0,212,255,0.08)',
                    borderRadius: '12px', padding: '14px',
                  }}>
                    {/* Colour image preview */}
                    <div style={{
                      width: 56, height: 56, borderRadius: 8, flexShrink: 0,
                      background: col.preview ? '#111' : (col.hex_code || 'rgba(0,212,255,0.04)'),
                      border: '1px solid rgba(0,212,255,0.1)',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {col.preview ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={col.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : !col.hex_code ? (
                        <span style={{ fontSize: 10, color: '#8E99A8' }}>No img</span>
                      ) : null}
                    </div>

                    {/* Fields */}
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 140px 1fr 60px', gap: '10px' }}>
                      <Field label="Colour Name">
                        <input
                          type="text" value={col.name} placeholder="e.g. Pristine White"
                          onChange={e => updateColour(i, 'name', e.target.value)}
                          style={{ ...INPUT, padding: '7px 10px', fontSize: 12 }}
                        />
                      </Field>

                      <Field label="Hex Code">
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={col.hex_code || '#000000'}
                            onChange={e => updateColour(i, 'hex_code', e.target.value)}
                            style={{
                              width: 36, height: 36, padding: 2, borderRadius: 6,
                              border: '1px solid rgba(0,212,255,0.2)', cursor: 'pointer',
                              background: 'transparent',
                            }}
                          />
                          <input
                            type="text" value={col.hex_code} placeholder="#FFFFFF"
                            onChange={e => updateColour(i, 'hex_code', e.target.value)}
                            style={{ ...INPUT, padding: '7px 8px', fontSize: 11, fontFamily: 'monospace', flex: 1 }}
                          />
                        </div>
                      </Field>

                      <Field label="Image">
                        <label style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          ...INPUT, padding: '7px 10px', fontSize: 12, cursor: 'pointer',
                        }}>
                          <span style={{ color: '#8E99A8' }}>
                            {col.file ? col.file.name : (col.image_url ? 'Replace…' : 'Upload…')}
                          </span>
                          <input
                            type="file" accept="image/*"
                            onChange={e => handleColourFile(i, e)}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </Field>

                      <Field label="Sort">
                        <input
                          type="number" value={col.sort_order}
                          onChange={e => updateColour(i, 'sort_order', e.target.value)}
                          style={{ ...INPUT, padding: '7px 8px', fontSize: 12 }}
                        />
                      </Field>
                    </div>

                    {/* Available toggle */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', paddingTop: '18px' }}>
                      <span style={{ fontSize: 10, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avail.</span>
                      <button
                        type="button"
                        onClick={() => updateColour(i, 'is_available', !col.is_available)}
                        style={{
                          width: 40, height: 22, borderRadius: 11, border: 'none',
                          cursor: 'pointer', position: 'relative', flexShrink: 0,
                          background: col.is_available ? '#00D4FF' : 'rgba(255,255,255,0.12)',
                          transition: 'background 0.2s',
                        }}
                      >
                        <span style={{
                          position: 'absolute', top: 3,
                          left: col.is_available ? 21 : 3,
                          width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF',
                          transition: 'left 0.15s',
                        }} />
                      </button>
                    </div>

                    <button type="button" onClick={() => removeColour(i)} style={{ ...BTN_DANGER, marginTop: 20 }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <button type="button" onClick={saveColours} disabled={saving} style={{
                ...BTN_PRIMARY,
                opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer',
              }}>
                {saving ? 'Saving…' : 'Save Colours'}
              </button>
            </div>
          </div>
        )
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 6 — FAQs */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 5 && (
        locked ? <LockedMessage /> : (
          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ ...CARD_TITLE, margin: 0 }}>FAQs</p>
              <button type="button" onClick={addFaq} style={BTN_GHOST}>
                + Add FAQ
              </button>
            </div>

            {faqs.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px',
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
                    borderRadius: '12px', padding: '18px', position: 'relative',
                  }}>
                    <button
                      type="button" onClick={() => removeFaq(i)}
                      style={{ ...BTN_DANGER, position: 'absolute', top: 12, right: 12 }}
                    >
                      ×
                    </button>
                    <div style={{ marginBottom: '12px', paddingRight: '40px' }}>
                      <label style={LABEL}>Question {i + 1}</label>
                      <input
                        type="text" value={faq.question}
                        onChange={e => updateFaq(i, 'question', e.target.value)}
                        placeholder="e.g. What are the variants of the Nexon?"
                        style={INPUT}
                      />
                    </div>
                    <div>
                      <label style={LABEL}>Answer</label>
                      <textarea
                        value={faq.answer} rows={3}
                        onChange={e => updateFaq(i, 'answer', e.target.value)}
                        placeholder="Write a clear, helpful answer…"
                        style={TEXTAREA}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <button type="button" onClick={saveFaqs} disabled={saving} style={{
                ...BTN_PRIMARY,
                opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer',
              }}>
                {saving ? 'Saving…' : 'Save FAQs'}
              </button>
            </div>
          </div>
        )
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 7 — SEO */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 6 && (
        locked ? <LockedMessage /> : (
          <div style={CARD}>
            <p style={CARD_TITLE}>SEO</p>

            <Field
              label="Meta Title"
              counter={<CharCount value={seo.meta_title} max={60} />}
            >
              <input
                type="text" value={seo.meta_title} maxLength={70}
                onChange={e => setSeo(s => ({ ...s, meta_title: e.target.value }))}
                placeholder="Tata Nexon Price in India 2026 | AutoPortal360"
                style={INPUT}
              />
            </Field>

            <Field
              label="Meta Description"
              counter={<CharCount value={seo.meta_description} max={160} />}
            >
              <textarea
                value={seo.meta_description} rows={3} maxLength={180}
                onChange={e => setSeo(s => ({ ...s, meta_description: e.target.value }))}
                placeholder="Tata Nexon price in India starts at ₹8.00 Lakh. Check all variants, specs, colours and EMI options at AutoPortal360."
                style={TEXTAREA}
              />
            </Field>

            <Field
              label="Overview HTML"
              hint="Displayed on the model page below the variant table. Supports HTML tags."
            >
              <textarea
                value={seo.overview_html} rows={8}
                onChange={e => setSeo(s => ({ ...s, overview_html: e.target.value }))}
                placeholder="About this model — you can use <strong>, <p>, <ul> etc."
                style={TEXTAREA}
              />
            </Field>

            <Field
              label="Custom Schema JSON-LD"
              hint="Leave empty to use auto-generated schema. Paste valid JSON-LD only."
            >
              <textarea
                value={seo.schema_json} rows={10}
                onChange={e => setSeo(s => ({ ...s, schema_json: e.target.value }))}
                spellCheck={false}
                placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "Tata Nexon"\n}`}
                style={{ ...TEXTAREA, fontFamily: 'monospace', fontSize: 13 }}
              />
            </Field>

            <button type="button" onClick={saveSeo} disabled={saving} style={{
              ...BTN_PRIMARY,
              opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer',
            }}>
              {saving ? 'Saving…' : 'Save SEO'}
            </button>
          </div>
        )
      )}

    </div>
  )
}
