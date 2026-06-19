'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect, useRef, useCallback } from 'react'
import { dbUpsert } from '@/lib/admin-db'

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

const FIELDS = [
  {
    section: 'Site Identity',
    items: [
      { key: 'site_name',            label: 'Site Name',              type: 'text',  placeholder: 'AutoPortal360',                          hint: '' },
      { key: 'meta_title_template',  label: 'Meta Title Template',    type: 'text',  placeholder: '%s | AutoPortal360',                     hint: 'Use %s for the page-specific title.' },
      { key: 'default_meta_description', label: 'Default Meta Description', type: 'textarea', placeholder: 'India\'s trusted automotive portal…', hint: 'Used when a page has no custom meta description.' },
      { key: 'default_og_image_url', label: 'Default OG Image URL',   type: 'url',   placeholder: 'https://autoportal360.com/og-default.jpg', hint: 'Fallback Open Graph image for social sharing.' },
    ],
  },
  {
    section: 'Analytics & Tracking',
    items: [
      { key: 'ga4_id',              label: 'Google Analytics 4 ID',             type: 'text',  placeholder: 'G-XXXXXXXXXX', hint: 'Format: G-XXXXXXXXXX. Find in GA4 → Admin → Data Streams → Measurement ID.' },
      { key: 'gtm_id',              label: 'Google Tag Manager ID',              type: 'text',  placeholder: 'GTM-XXXXXXX',  hint: 'Format: GTM-XXXXXXX. Find in GTM → Admin → Container ID.' },
      { key: 'gsc_verification',    label: 'Search Console Verification Code',   type: 'text',  placeholder: 'abc123xyz_def456', hint: "Paste only the content value from the <meta name='google-site-verification'> tag." },
      { key: 'facebook_pixel_id',   label: 'Facebook Pixel ID',                 type: 'text',  placeholder: '123456789012345', hint: 'Format: 15-digit number. Find in Meta Business Manager → Events Manager.' },
    ],
  },
  {
    section: 'Custom Scripts',
    items: [
      { key: 'custom_head_scripts', label: 'Custom Head Scripts',  type: 'textarea', placeholder: '<!-- Scripts injected inside <head> -->', hint: 'Injected just before </head>. Use valid HTML/script tags.' },
      { key: 'custom_body_scripts', label: 'Custom Body Scripts',  type: 'textarea', placeholder: '<!-- Scripts injected after <body>  -->', hint: 'Injected just after <body>. Use for tag managers, chat widgets, etc.' },
    ],
  },
] as const

type Key = (typeof FIELDS)[number]['items'][number]['key']

export default function SeoClient() {
  const sbRef = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current

  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  useEffect(() => {
    sb.from('seo_settings').select('key, value')
      .then(({ data }) => {
        const map: Record<string, string> = {}
        ;(data ?? []).forEach(row => { map[row.key as string] = (row.value as string) ?? '' })
        setSettings(map)
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function set(key: string, val: string) {
    setSettings(s => ({ ...s, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({
        key, value: value ?? '', updated_at: new Date().toISOString(),
      }))
      await dbUpsert('seo_settings', rows, 'key')
      showToast('SEO settings saved!', true)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#8E99A8', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '720px' }}>

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

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '26px',
          fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px',
        }}>
          SEO Settings
        </h1>
        <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
          Global settings applied across the site
        </p>
      </div>

      {FIELDS.map(section => (
        <div key={section.section} style={CARD}>
          <p style={CARD_TITLE}>{section.section}</p>
          {section.items.map(field => (
            <div key={field.key} style={{ marginBottom: '20px' }}>
              <label style={LABEL}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={settings[field.key as Key] ?? ''}
                  rows={field.key.includes('scripts') ? 8 : 3}
                  onChange={e => set(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  spellCheck={false}
                  style={{
                    ...TEXTAREA,
                    ...(field.key.includes('scripts')
                      ? { fontFamily: 'monospace', fontSize: 13 }
                      : {}),
                  }}
                />
              ) : (
                <input
                  type={field.type}
                  value={settings[field.key as Key] ?? ''}
                  onChange={e => set(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={INPUT}
                />
              )}
              {field.hint && (
                <p style={{ fontSize: 11, color: '#8E99A8', margin: '5px 0 0' }}>
                  {field.hint}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}

      <div style={CARD}>
        <p style={CARD_TITLE}>Sitemap</p>
        <p style={{ fontSize: 13, color: '#C0C0C0', margin: '0 0 16px', lineHeight: 1.7 }}>
          The sitemap is auto-generated and revalidates every hour.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)',
              color: '#00D4FF', fontSize: 13, fontWeight: 700,
              padding: '9px 18px', borderRadius: 8, textDecoration: 'none',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            View sitemap.xml →
          </a>
          <p style={{ fontSize: 11, color: '#8E99A8', margin: 0 }}>
            To force-refresh: redeploy on Vercel or wait for the 1-hour cache to expire.
          </p>
        </div>
      </div>

      <div style={CARD}>
        <p style={CARD_TITLE}>Page Indexing Control</p>
        <div style={{ marginBottom: 20 }}>
          <label style={LABEL}>Noindex Paths (one per line)</label>
          <textarea
            value={(settings['noindex_paths'] ?? '').replace(/,/g, '\n')}
            rows={6}
            onChange={e => set('noindex_paths', e.target.value.split('\n').map(s => s.trim()).filter(Boolean).join(','))}
            placeholder={'/test-page\n/draft-model\n/internal-tools'}
            spellCheck={false}
            style={{ ...TEXTAREA, fontFamily: 'monospace', fontSize: 13 }}
          />
          <p style={{ fontSize: 11, color: '#8E99A8', margin: '5px 0 0' }}>
            Pages listed here will have a noindex tag. Enter one URL path per line.
          </p>
        </div>
      </div>

      <button type="button" onClick={handleSave} disabled={saving} style={{
        background: saving ? 'rgba(0,212,255,0.35)' : '#00D4FF',
        color: '#06142D',
        fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
        fontSize: 14, padding: '12px 32px',
        borderRadius: '10px', border: 'none',
        cursor: saving ? 'not-allowed' : 'pointer',
      }}>
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
