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

// ─── form state ────────────────────────────────────────────────────────────────

interface FormState {
  title:            string
  slug:             string
  excerpt:          string
  content_html:     string
  cover_image_url:  string
  author:           string
  tags:             string
  status:           'draft' | 'published'
  published_at:     string
  meta_title:       string
  meta_description: string
}

const DEFAULT: FormState = {
  title:            '',
  slug:             '',
  excerpt:          '',
  content_html:     '',
  cover_image_url:  '',
  author:           'AutoPortal360',
  tags:             '',
  status:           'draft',
  published_at:     '',
  meta_title:       '',
  meta_description: '',
}

// ─── main component ────────────────────────────────────────────────────────────

export default function BlogForm({ postId }: { postId?: string }) {
  const router  = useRouter()
  const isEdit  = !!postId
  const sbRef   = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current

  const [form,        setForm]        = useState<FormState>(DEFAULT)
  const [loading,     setLoading]     = useState(isEdit)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [toast,       setToast]       = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── load post ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!postId) return
    sb.from('blog_posts').select('*').eq('id', postId).single()
      .then(({ data: p, error: pErr }) => {
        if (pErr || !p) { setError('Post not found'); setLoading(false); return }
        const r = p as Record<string, unknown>
        setForm({
          title:            (r.title            as string) ?? '',
          slug:             (r.slug             as string) ?? '',
          excerpt:          (r.excerpt          as string) ?? '',
          content_html:     (r.content_html     as string) ?? '',
          cover_image_url:  (r.cover_image_url  as string) ?? '',
          author:           (r.author           as string) ?? 'AutoPortal360',
          tags:             Array.isArray(r.tags) ? (r.tags as string[]).join(', ') : '',
          status:           ((r.status as string) ?? 'draft') as FormState['status'],
          published_at:     r.published_at
            ? new Date(r.published_at as string).toISOString().slice(0, 16)
            : '',
          meta_title:       (r.meta_title       as string) ?? '',
          meta_description: (r.meta_description as string) ?? '',
        })
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  // ── field helpers ─────────────────────────────────────────────────────────────
  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
    setFieldErrors(e => ({ ...e, [key]: undefined }))
  }

  function handleTitleChange(val: string) {
    set('title', val)
    if (!isEdit) set('slug', toSlug(val))
  }

  function handleStatusChange(newStatus: FormState['status']) {
    set('status', newStatus)
    if (newStatus === 'published' && !form.published_at) {
      set('published_at', new Date().toISOString().slice(0, 16))
    }
  }

  // ── validation ────────────────────────────────────────────────────────────────
  function validate(): Partial<Record<keyof FormState, string>> {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.slug.trim())  errs.slug  = 'Slug is required'
    if (!/^[a-z0-9-]+$/.test(form.slug))
      errs.slug = 'Lowercase letters, numbers and hyphens only'
    if (form.excerpt.length > 160)
      errs.excerpt = 'Must be 160 characters or fewer'
    if (form.meta_title.length > 60)
      errs.meta_title = 'Must be 60 characters or fewer'
    if (form.meta_description.length > 160)
      errs.meta_description = 'Must be 160 characters or fewer'
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
      const tagsArray = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      const payload = {
        title:            form.title.trim(),
        slug:             form.slug.trim(),
        excerpt:          form.excerpt.trim()          || null,
        content_html:     form.content_html.trim()     || null,
        cover_image_url:  form.cover_image_url.trim()  || null,
        author:           form.author.trim()           || 'AutoPortal360',
        tags:             tagsArray.length ? tagsArray : null,
        status:           form.status,
        published_at:     form.published_at            || null,
        meta_title:       form.meta_title.trim()       || null,
        meta_description: form.meta_description.trim() || null,
        updated_at:       new Date().toISOString(),
      }

      if (isEdit) {
        const { error: uErr } = await sb.from('blog_posts').update(payload).eq('id', postId!)
        if (uErr) throw new Error(uErr.message)
        showToast('Post saved!', true)
        setSaving(false)
      } else {
        const { error: iErr } = await sb.from('blog_posts').insert(payload)
        if (iErr) throw new Error(iErr.message)
        showToast('Post created!', true)
        setTimeout(() => { router.push('/admin/blog'); router.refresh() }, 1200)
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
    if (!postId || !window.confirm(`Delete "${form.title}"? This cannot be undone.`)) return
    setSaving(true)
    try {
      const { error: dErr } = await sb.from('blog_posts').delete().eq('id', postId)
      if (dErr) throw new Error(dErr.message)
      router.push('/admin/blog')
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
    <div style={{ maxWidth: '760px' }}>

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
          {isEdit ? 'Edit Post' : 'New Post'}
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

        {/* ══ Core Content ═════════════════════════════════════════════════════ */}
        <div style={CARD}>
          <p style={CARD_TITLE}>Post Content</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Title *" error={fieldErrors.title}>
              <input
                type="text" value={form.title} required
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="e.g. Best Cars Under 10 Lakh in India 2026"
                style={{ ...INPUT, borderColor: fieldErrors.title ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }}
              />
            </Field>
            <Field label="Slug *" error={fieldErrors.slug}>
              <input
                type="text" value={form.slug} required
                onChange={e => set('slug', e.target.value)}
                placeholder="e.g. best-cars-under-10-lakh"
                style={{ ...INPUT, fontFamily: 'monospace', borderColor: fieldErrors.slug ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }}
              />
            </Field>
          </div>

          <Field
            label="Excerpt"
            error={fieldErrors.excerpt}
            counter={<CharCount value={form.excerpt} max={160} />}
          >
            <textarea
              value={form.excerpt} rows={3}
              onChange={e => set('excerpt', e.target.value)}
              placeholder="Brief summary shown in blog listing and meta description fallback…"
              style={{ ...TEXTAREA, borderColor: fieldErrors.excerpt ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }}
            />
          </Field>

          <Field
            label="Content (HTML)"
            hint="Write in plain HTML. Full visual editor coming soon."
          >
            <textarea
              value={form.content_html} rows={16}
              onChange={e => set('content_html', e.target.value)}
              placeholder="<h2>Introduction</h2>&#10;<p>Your article content here…</p>"
              spellCheck={false}
              style={{ ...TEXTAREA, fontFamily: 'monospace', fontSize: 13 }}
            />
          </Field>
        </div>

        {/* ══ Cover Image ═══════════════════════════════════════════════════════ */}
        <div style={CARD}>
          <p style={CARD_TITLE}>Cover Image</p>

          <Field label="Cover Image URL">
            <input
              type="url" value={form.cover_image_url}
              onChange={e => set('cover_image_url', e.target.value)}
              placeholder="https://autoportal360.com/blog/cover.jpg"
              style={INPUT}
            />
          </Field>

          {form.cover_image_url && (
            <div style={{
              marginTop: 4, borderRadius: 10, overflow: 'hidden',
              border: '1px solid rgba(0,212,255,0.1)',
              height: 180, background: '#111',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.cover_image_url}
                alt="Cover preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}
        </div>

        {/* ══ Meta ══════════════════════════════════════════════════════════════ */}
        <div style={CARD}>
          <p style={CARD_TITLE}>Publication</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Author">
              <input
                type="text" value={form.author}
                onChange={e => set('author', e.target.value)}
                placeholder="AutoPortal360" style={INPUT}
              />
            </Field>
            <Field label="Tags" hint="Comma-separated: EV, SUV, Budget Cars">
              <input
                type="text" value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="e.g. EV, SUV, Budget Cars" style={INPUT}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Status">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: 6 }}>
                <button type="button" onClick={() => handleStatusChange(form.status === 'published' ? 'draft' : 'published')} style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none',
                  cursor: 'pointer', position: 'relative', flexShrink: 0,
                  background: form.status === 'published' ? '#00CC66' : 'rgba(255,255,255,0.12)',
                  transition: 'background 0.2s',
                }}>
                  <span style={{
                    position: 'absolute', top: 3,
                    left: form.status === 'published' ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: '#FFFFFF',
                    transition: 'left 0.15s',
                  }} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 600, color: form.status === 'published' ? '#00CC66' : '#8E99A8' }}>
                  {form.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
            </Field>
            <Field label="Published At">
              <input
                type="datetime-local" value={form.published_at}
                onChange={e => set('published_at', e.target.value)}
                style={{ ...INPUT, colorScheme: 'dark' }}
              />
            </Field>
          </div>
        </div>

        {/* ══ SEO ═══════════════════════════════════════════════════════════════ */}
        <div style={{ ...CARD, marginBottom: '24px' }}>
          <p style={CARD_TITLE}>SEO</p>

          <Field
            label="Meta Title"
            error={fieldErrors.meta_title}
            counter={<CharCount value={form.meta_title} max={60} />}
          >
            <input
              type="text" value={form.meta_title} maxLength={70}
              onChange={e => set('meta_title', e.target.value)}
              placeholder="Best Cars Under 10 Lakh in India 2026 | AutoPortal360"
              style={{ ...INPUT, borderColor: fieldErrors.meta_title ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }}
            />
          </Field>

          <Field
            label="Meta Description"
            error={fieldErrors.meta_description}
            counter={<CharCount value={form.meta_description} max={160} />}
          >
            <textarea
              value={form.meta_description} rows={3} maxLength={180}
              onChange={e => set('meta_description', e.target.value)}
              placeholder="Discover the best cars priced under ₹10 lakh in India…"
              style={{ ...TEXTAREA, borderColor: fieldErrors.meta_description ? 'rgba(255,80,80,0.5)' : 'rgba(0,212,255,0.15)' }}
            />
          </Field>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={saving} style={{
            background: saving ? 'rgba(0,212,255,0.35)' : '#00D4FF',
            color: '#06142D',
            fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
            fontSize: 14, padding: '12px 32px',
            borderRadius: '10px', border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Saving…' : isEdit ? 'Save Post' : 'Create Post'}
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
