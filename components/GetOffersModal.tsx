'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type City    = { id: string; name: string }
type Variant = { id: string; name: string; ex_showroom_price: number }

const INPUT: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,212,255,0.04)',
  border: '1px solid rgba(0,212,255,0.2)',
  borderRadius: '10px',
  padding: '11px 14px',
  color: '#FFFFFF',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
}

const LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: '#8E99A8',
  marginBottom: '6px',
  letterSpacing: '0.3px',
}

export default function GetOffersModal({
  isOpen,
  onClose,
  modelId,
  modelName,
  brandName,
  modelSlug,
  variants,
}: {
  isOpen: boolean
  onClose: () => void
  modelId: string
  modelName: string
  brandName: string
  modelSlug: string
  variants: Variant[]
}) {
  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [email,     setEmail]     = useState('')
  const [variantId, setVariantId] = useState(variants[0]?.id ?? '')
  const [cityName,  setCityName]  = useState('')
  const [message,   setMessage]   = useState('')
  const [cities,    setCities]    = useState<City[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')

  // Fetch cities once when modal opens
  useEffect(() => {
    if (!isOpen || cities.length > 0) return
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    sb.from('cities').select('id, name').order('name').then(({ data }) => {
      if (data) setCities(data)
    })
  }, [isOpen, cities.length])

  // Auto-close 3 s after success
  const handleClose = useCallback(() => {
    setName(''); setPhone(''); setEmail(''); setMessage('')
    setVariantId(variants[0]?.id ?? ''); setCityName('')
    setSuccess(false); setError('')
    onClose()
  }, [onClose, variants])

  useEffect(() => {
    if (!success) return
    const t = setTimeout(handleClose, 3000)
    return () => clearTimeout(t)
  }, [success, handleClose])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const selectedVariant = variants.find(v => v.id === variantId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email:        email || undefined,
          city:         cityName || undefined,
          model_id:     modelId,
          model_slug:   modelSlug,
          brand_name:   brandName,
          model_name:   modelName,
          variant_name: selectedVariant?.name ?? '',
          message:      message || undefined,
          source_page:  window.location.pathname,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /* Overlay */
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0A1F44',
          border: '1px solid rgba(0,212,255,0.25)',
          borderRadius: '20px',
          padding: '28px 28px 24px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: '18px', right: '18px',
            background: 'rgba(255,255,255,0.06)', border: 'none',
            color: '#8E99A8', width: '32px', height: '32px',
            borderRadius: '50%', cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {success ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: '20px',
              fontWeight: 900, color: '#00D4FF', marginBottom: '10px',
            }}>
              Request Received!
            </h2>
            <p style={{ color: '#C0C0C0', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
              We&apos;ll connect you with the best dealer offers for{' '}
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{brandName} {modelName}</span>
              {' '}shortly.
            </p>
            <p style={{ color: '#8E99A8', fontSize: '12px', marginTop: '16px' }}>
              Closing automatically…
            </p>
          </div>
        ) : (
          /* ── Form ── */
          <>
            {/* Header */}
            <div style={{ marginBottom: '22px', paddingRight: '36px' }}>
              <h2 style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: '18px',
                fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px',
                lineHeight: 1.3,
              }}>
                Get Best Offers on{' '}
                <span style={{ color: '#00D4FF' }}>{brandName} {modelName}</span>
              </h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {['Free', 'No spam', 'Dealer contacts you'].map(tag => (
                  <span key={tag} style={{
                    fontSize: '11px', fontWeight: 700, color: '#00D4FF',
                    background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.18)',
                    padding: '3px 10px', borderRadius: '20px',
                    fontFamily: 'Montserrat, sans-serif',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Name */}
              <div>
                <label style={LABEL}>Full Name <span style={{ color: '#FF6B6B' }}>*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  style={INPUT}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={LABEL}>Mobile Number <span style={{ color: '#FF6B6B' }}>*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  required
                  maxLength={10}
                  style={INPUT}
                />
              </div>

              {/* Email */}
              <div>
                <label style={LABEL}>Email <span style={{ color: '#8E99A8', fontWeight: 400 }}>(optional)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={INPUT}
                />
              </div>

              {/* Two-column: Variant + City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Variant */}
                {variants.length > 0 && (
                  <div>
                    <label style={LABEL}>Variant</label>
                    <select
                      value={variantId}
                      onChange={e => setVariantId(e.target.value)}
                      style={{ ...INPUT, appearance: 'none', cursor: 'pointer' }}
                    >
                      {variants.map(v => (
                        <option key={v.id} value={v.id} style={{ background: '#0A1F44', color: '#FFF' }}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* City */}
                <div>
                  <label style={LABEL}>City</label>
                  <select
                    value={cityName}
                    onChange={e => setCityName(e.target.value)}
                    style={{ ...INPUT, appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="" style={{ background: '#0A1F44', color: '#8E99A8' }}>
                      Select city
                    </option>
                    {cities.map(c => (
                      <option key={c.id} value={c.name} style={{ background: '#0A1F44', color: '#FFF' }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={LABEL}>Message <span style={{ color: '#8E99A8', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Any specific questions or requirements…"
                  rows={3}
                  style={{ ...INPUT, resize: 'vertical', minHeight: '72px' }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)',
                  borderRadius: '10px', padding: '10px 14px',
                  color: '#FF8080', fontSize: '13px',
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', background: submitting ? 'rgba(0,212,255,0.5)' : '#00D4FF',
                  color: '#06142D', fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900, fontSize: '14px',
                  padding: '13px', borderRadius: '12px',
                  border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.15s',
                  marginTop: '2px',
                }}
              >
                {submitting ? 'Submitting…' : 'Get Best Price →'}
              </button>

              {/* Safety note */}
              <p style={{
                textAlign: 'center', fontSize: '11px', color: '#8E99A8',
                margin: 0, lineHeight: 1.5,
              }}>
                Your details are safe with us. No spam, no cold calls.
                Dealer may contact you within 24 hours.
              </p>

            </form>
          </>
        )}
      </div>
    </div>
  )
}
