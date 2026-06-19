'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { dbUpsert } from '@/lib/admin-db'

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

function Field({
  label, hint, children,
}: {
  label: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={LABEL}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#8E99A8', margin: '5px 0 0' }}>{hint}</p>}
    </div>
  )
}

// ─── zone labels ───────────────────────────────────────────────────────────────

const ZONE_LABELS: Record<string, string> = {
  'hero-billboard': 'Hero Billboard',
  'mid-feed-1':     'Mid Feed 1',
  'mid-feed-2':     'Mid Feed 2',
  'in-feed-native': 'In-Feed Native',
  'pre-footer':     'Pre-Footer Strip',
}

// ─── form state ────────────────────────────────────────────────────────────────

interface FormState {
  is_active:          boolean
  ad_type:            string
  advertiser:         string
  headline:           string
  subline:            string
  cta_text:           string
  destination_url:    string
  banner_image_url:   string
  impression_pixel:   string
  click_tracking_url: string
  custom_html:        string
  start_date:         string
  end_date:           string
}

const DEFAULT: FormState = {
  is_active:          true,
  ad_type:            'affiliate',
  advertiser:         '',
  headline:           '',
  subline:            '',
  cta_text:           '',
  destination_url:    '',
  banner_image_url:   '',
  impression_pixel:   '',
  click_tracking_url: '',
  custom_html:        '',
  start_date:         '',
  end_date:           '',
}

// ─── main component ────────────────────────────────────────────────────────────

export default function AdZonePage() {
  const { zone } = useParams() as { zone: string }
  const router   = useRouter()
  const sbRef    = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current

  const [form,    setForm]    = useState<FormState>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  useEffect(() => {
    sb.from('ad_campaigns').select('*').eq('zone', zone).maybeSingle()
      .then(({ data }) => {
        if (data) {
          const r = data as Record<string, unknown>
          setForm({
            is_active:          Boolean(r.is_active ?? true),
            ad_type:            (r.ad_type            as string) ?? 'affiliate',
            advertiser:         (r.advertiser         as string) ?? '',
            headline:           (r.headline           as string) ?? '',
            subline:            (r.subline            as string) ?? '',
            cta_text:           (r.cta_text           as string) ?? '',
            destination_url:    (r.destination_url    as string) ?? '',
            banner_image_url:   (r.banner_image_url   as string) ?? '',
            impression_pixel:   (r.impression_pixel   as string) ?? '',
            click_tracking_url: (r.click_tracking_url as string) ?? '',
            custom_html:        (r.custom_html        as string) ?? '',
            start_date:         (r.start_date         as string) ?? '',
            end_date:           (r.end_date           as string) ?? '',
          })
        }
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone])

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        zone,
        is_active:          form.is_active,
        ad_type:            form.ad_type,
        advertiser:         form.advertiser.trim()          || null,
        headline:           form.headline.trim()            || null,
        subline:            form.subline.trim()             || null,
        cta_text:           form.cta_text.trim()            || null,
        destination_url:    form.destination_url.trim()     || null,
        banner_image_url:   form.banner_image_url.trim()    || null,
        impression_pixel:   form.impression_pixel.trim()    || null,
        click_tracking_url: form.click_tracking_url.trim()  || null,
        custom_html:        form.custom_html.trim()         || null,
        start_date:         form.start_date                 || null,
        end_date:           form.end_date                   || null,
        updated_at:         new Date().toISOString(),
      }
      await dbUpsert('ad_campaigns', payload, 'zone')
      showToast('Ad zone saved!', true)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
    setSaving(false)
  }

  const zoneLabel = ZONE_LABELS[zone] ?? zone

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#8E99A8', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '700px' }}>

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button type="button" onClick={() => router.back()} style={{
          background: 'rgba(255,255,255,0.04)', color: '#8E99A8',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', padding: '8px 14px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: 24,
            fontWeight: 900, color: '#FFFFFF', margin: '0 0 2px',
          }}>
            {zoneLabel}
          </h1>
          <p style={{ fontSize: 12, color: '#8E99A8', margin: 0, fontFamily: 'monospace' }}>
            zone: {zone}
          </p>
        </div>
        {/* Active toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: 12, color: form.is_active ? '#00D4FF' : '#8E99A8', fontWeight: 600 }}>
            {form.is_active ? 'Active' : 'Inactive'}
          </span>
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
        </div>
      </div>

      {/* ══ Campaign Settings ══════════════════════════════════════════════════ */}
      <div style={CARD}>
        <p style={CARD_TITLE}>Campaign Settings</p>

        <Field label="Ad Type">
          <select value={form.ad_type} onChange={e => set('ad_type', e.target.value)}
            style={{ ...INPUT, cursor: 'pointer' }}>
            <option value="affiliate">Affiliate</option>
            <option value="oem-banner">OEM Banner</option>
            <option value="adsense">AdSense</option>
            <option value="custom">Custom</option>
          </select>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Start Date">
            <input type="date" value={form.start_date}
              onChange={e => set('start_date', e.target.value)}
              style={{ ...INPUT, colorScheme: 'dark' }} />
          </Field>
          <Field label="End Date">
            <input type="date" value={form.end_date}
              onChange={e => set('end_date', e.target.value)}
              style={{ ...INPUT, colorScheme: 'dark' }} />
          </Field>
        </div>
      </div>

      {/* ══ Ad Content ════════════════════════════════════════════════════════ */}
      {form.ad_type !== 'adsense' && (
        <div style={CARD}>
          <p style={CARD_TITLE}>Ad Content</p>

          <Field label="Advertiser Name">
            <input type="text" value={form.advertiser}
              onChange={e => set('advertiser', e.target.value)}
              placeholder="e.g. Acko Insurance" style={INPUT} />
          </Field>

          <Field label="Headline">
            <input type="text" value={form.headline}
              onChange={e => set('headline', e.target.value)}
              placeholder="e.g. 🛡️ Car Insurance from ₹2,094/year" style={INPUT} />
          </Field>

          <Field label="Subline">
            <input type="text" value={form.subline}
              onChange={e => set('subline', e.target.value)}
              placeholder="Supporting text below headline" style={INPUT} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="CTA Text">
              <input type="text" value={form.cta_text}
                onChange={e => set('cta_text', e.target.value)}
                placeholder="e.g. Get Free Quote →" style={INPUT} />
            </Field>
            <Field label="Destination URL">
              <input type="url" value={form.destination_url}
                onChange={e => set('destination_url', e.target.value)}
                placeholder="https://" style={INPUT} />
            </Field>
          </div>
        </div>
      )}

      {/* ══ OEM Tracking ══════════════════════════════════════════════════════ */}
      {(form.ad_type === 'oem-banner' || form.ad_type === 'custom') && (
        <div style={CARD}>
          <p style={CARD_TITLE}>OEM / Banner</p>

          <Field label="Banner Image URL"
            hint="Direct URL to the banner image asset.">
            <input type="url" value={form.banner_image_url}
              onChange={e => set('banner_image_url', e.target.value)}
              placeholder="https://cdn.example.com/banner.jpg" style={INPUT} />
          </Field>

          <Field label="Impression Pixel URL"
            hint="1×1 tracking pixel fired on ad view.">
            <input type="url" value={form.impression_pixel}
              onChange={e => set('impression_pixel', e.target.value)}
              placeholder="https://track.example.com/imp?..." style={INPUT} />
          </Field>

          <Field label="Click Tracking URL"
            hint="Redirect URL wrapping the destination for click tracking.">
            <input type="url" value={form.click_tracking_url}
              onChange={e => set('click_tracking_url', e.target.value)}
              placeholder="https://track.example.com/click?url=..." style={INPUT} />
          </Field>
        </div>
      )}

      {/* ══ Custom / AdSense HTML ══════════════════════════════════════════════ */}
      {(form.ad_type === 'adsense' || form.ad_type === 'custom') && (
        <div style={CARD}>
          <p style={CARD_TITLE}>
            {form.ad_type === 'adsense' ? 'AdSense Code' : 'Custom HTML'}
          </p>
          <Field
            label="HTML / Script"
            hint={form.ad_type === 'adsense'
              ? 'Paste your Google AdSense ad unit code here.'
              : 'Custom HTML rendered inside the ad slot.'}
          >
            <textarea value={form.custom_html} rows={10}
              onChange={e => set('custom_html', e.target.value)}
              spellCheck={false}
              placeholder={form.ad_type === 'adsense'
                ? '<ins class="adsbygoogle" ...'
                : '<div class="custom-ad">...'}
              style={{ ...TEXTAREA, fontFamily: 'monospace', fontSize: 13 }}
            />
          </Field>
        </div>
      )}

      {/* ── Save ── */}
      <button type="button" onClick={handleSave} disabled={saving} style={{
        background: saving ? 'rgba(0,212,255,0.35)' : '#00D4FF',
        color: '#06142D',
        fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
        fontSize: 14, padding: '12px 32px',
        borderRadius: '10px', border: 'none',
        cursor: saving ? 'not-allowed' : 'pointer',
      }}>
        {saving ? 'Saving…' : 'Save Zone'}
      </button>
    </div>
  )
}
