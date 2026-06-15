'use client'

import { useState } from 'react'
import { KNOWN_BRANDS, INDIAN_STATES } from '@/types/dealer'

const VEHICLE_TYPES = ['cars', 'bikes', 'scooters'] as const

const PHONE_RE = /^[6-9]\d{9}$/

export default function ListShowroomForm() {
  const [form, setForm] = useState({
    dealer_name: '',
    brand_name: '',
    brand_other: '',
    contact_person: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    address: '',
    locality: '',
    pincode: '',
    vehicle_types: ['cars'] as string[],
    website: '',
    google_maps_url: '',
    working_hours: 'Mon-Sat: 9 AM – 7 PM',
    message: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState('')

  const set = (key: string, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const toggleVehicle = (type: string) => {
    setForm(prev => {
      const types = prev.vehicle_types.includes(type)
        ? prev.vehicle_types.filter(t => t !== type)
        : [...prev.vehicle_types, type]
      return { ...prev, vehicle_types: types }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const finalBrand = form.brand_name === '__other__' ? form.brand_other.trim() : form.brand_name
    if (!finalBrand) { setError('Please enter a brand name.'); return }
    if (!PHONE_RE.test(form.phone)) { setError('Enter a valid 10-digit Indian mobile number.'); return }
    if (form.vehicle_types.length === 0) { setError('Select at least one vehicle type.'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/dealer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealer_name:    form.dealer_name,
          brand_name:     finalBrand,
          contact_person: form.contact_person,
          phone:          form.phone,
          email:          form.email,
          city:           form.city,
          state:          form.state,
          address:        form.address,
          locality:       form.locality || null,
          pincode:        form.pincode || null,
          vehicle_types:  form.vehicle_types,
          website:        form.website || null,
          google_maps_url: form.google_maps_url || null,
          working_hours:  form.working_hours,
          message:        form.message || null,
        }),
      })

      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? 'Submission failed')
      }

      setSuccess(true)
      setForm({
        dealer_name: '', brand_name: '', brand_other: '', contact_person: '',
        phone: '', email: '', city: '', state: '', address: '',
        locality: '', pincode: '', vehicle_types: ['cars'],
        website: '', google_maps_url: '',
        working_hours: 'Mon-Sat: 9 AM – 7 PM', message: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="ap-form-layout">

      {/* ── LEFT: FORM ── */}
      <div>
        <div style={{ background: '#0A1F44', border: '1px solid #1e3a6e', borderRadius: '1rem', padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>
            Showroom Details
          </h2>

          {success && (
            <div className="ap-success-msg" style={{ marginBottom: '1.25rem' }}>
              <strong>Request submitted!</strong> Your listing request has been submitted! We&apos;ll review it within 24-48 hours.
            </div>
          )}
          {error && (
            <div className="ap-error-msg" style={{ marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Dealer name */}
            <div className="ap-form-group">
              <label className="ap-label">Showroom / Dealer Name *</label>
              <input
                className="ap-input"
                required
                value={form.dealer_name}
                onChange={e => set('dealer_name', e.target.value)}
                placeholder="e.g. Krishna Motors"
              />
            </div>

            {/* Brand */}
            <div className="ap-form-group">
              <label className="ap-label">Brand Name *</label>
              <select
                className="ap-select-field"
                required={form.brand_name !== '__other__'}
                value={form.brand_name}
                onChange={e => set('brand_name', e.target.value)}
              >
                <option value="">Select a brand</option>
                {KNOWN_BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value="__other__">Other (specify below)</option>
              </select>
              {form.brand_name === '__other__' && (
                <input
                  className="ap-input"
                  required
                  value={form.brand_other}
                  onChange={e => set('brand_other', e.target.value)}
                  placeholder="Enter brand name"
                  style={{ marginTop: '.5rem' }}
                />
              )}
            </div>

            {/* Contact + Phone */}
            <div className="ap-form-grid-2">
              <div className="ap-form-group">
                <label className="ap-label">Contact Person *</label>
                <input
                  className="ap-input"
                  required
                  value={form.contact_person}
                  onChange={e => set('contact_person', e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Phone Number *</label>
                <input
                  className="ap-input"
                  required
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="10-digit mobile"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Email */}
            <div className="ap-form-group">
              <label className="ap-label">Email Address *</label>
              <input
                className="ap-input"
                required
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="dealer@example.com"
              />
            </div>

            {/* City + State */}
            <div className="ap-form-grid-2">
              <div className="ap-form-group">
                <label className="ap-label">City *</label>
                <input
                  className="ap-input"
                  required
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="e.g. Chandigarh"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">State *</label>
                <select
                  className="ap-select-field"
                  required
                  value={form.state}
                  onChange={e => set('state', e.target.value)}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="ap-form-group">
              <label className="ap-label">Full Address *</label>
              <textarea
                className="ap-textarea"
                required
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Street address, landmark, area"
                style={{ minHeight: '5rem' }}
              />
            </div>

            {/* Locality + Pincode */}
            <div className="ap-form-grid-2">
              <div className="ap-form-group">
                <label className="ap-label">Locality / Area</label>
                <input
                  className="ap-input"
                  value={form.locality}
                  onChange={e => set('locality', e.target.value)}
                  placeholder="Sector 17, Baner, etc."
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Pincode</label>
                <input
                  className="ap-input"
                  value={form.pincode}
                  onChange={e => set('pincode', e.target.value)}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
              </div>
            </div>

            {/* Vehicle types */}
            <div className="ap-form-group">
              <label className="ap-label">Vehicle Types *</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '.25rem' }}>
                {VEHICLE_TYPES.map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#C0C0C0', fontSize: '.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.vehicle_types.includes(type)}
                      onChange={() => toggleVehicle(type)}
                      style={{ accentColor: '#00D4FF', width: '1rem', height: '1rem' }}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Website + Google Maps */}
            <div className="ap-form-grid-2">
              <div className="ap-form-group">
                <label className="ap-label">Website URL</label>
                <input
                  className="ap-input"
                  type="url"
                  value={form.website}
                  onChange={e => set('website', e.target.value)}
                  placeholder="https://yourshowroom.com"
                />
              </div>
              <div className="ap-form-group">
                <label className="ap-label">Google Maps Link</label>
                <input
                  className="ap-input"
                  type="url"
                  value={form.google_maps_url}
                  onChange={e => set('google_maps_url', e.target.value)}
                  placeholder="maps.google.com/..."
                />
              </div>
            </div>

            {/* Working hours */}
            <div className="ap-form-group">
              <label className="ap-label">Working Hours</label>
              <input
                className="ap-input"
                value={form.working_hours}
                onChange={e => set('working_hours', e.target.value)}
                placeholder="Mon-Sat: 9 AM – 7 PM"
              />
            </div>

            {/* Message */}
            <div className="ap-form-group">
              <label className="ap-label">Additional Message</label>
              <textarea
                className="ap-textarea"
                value={form.message}
                onChange={e => set('message', e.target.value)}
                placeholder="Anything else you'd like us to know"
                style={{ minHeight: '5rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="ap-btn-cyan"
              style={{ width: '100%', justifyContent: 'center', padding: '.875rem', fontSize: '1rem', borderRadius: '.75rem', marginTop: '.5rem' }}
            >
              {submitting ? 'Submitting…' : 'Submit Listing Request →'}
            </button>
          </form>
        </div>
      </div>

      {/* ── RIGHT: SIDEBAR ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Why List With Us */}
        <div style={{ background: '#0A1F44', border: '1px solid #1e3a6e', borderRadius: '1rem', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            Why List With Us?
          </h3>
          {[
            { icon: '✓', label: 'Free listing', detail: '— no charges ever' },
            { icon: '🏅', label: 'Verified badge', detail: 'for authorized dealers' },
            { icon: '📞', label: 'Direct phone calls', detail: 'from buyers' },
            { icon: '🔍', label: 'Appear in city + brand', detail: 'search results' },
          ].map(item => (
            <div key={item.label} className="ap-benefit-item">
              <span className="ap-step-number" style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' }}>
                {item.icon}
              </span>
              <div>
                <strong style={{ color: '#fff', fontSize: '.875rem' }}>{item.label}</strong>{' '}
                <span style={{ color: '#8E99A8', fontSize: '.875rem' }}>{item.detail}</span>
              </div>
            </div>
          ))}
        </div>

        {/* What Happens Next */}
        <div style={{ background: '#0A1F44', border: '1px solid #1e3a6e', borderRadius: '1rem', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            What Happens Next?
          </h3>
          {[
            { title: 'We review your submission', sub: 'Within 24-48 hours' },
            { title: 'Our team verifies dealer details', sub: 'Address, phone, brand affiliation' },
            { title: 'Your showroom goes live', sub: 'On AutoPortal360 city & brand pages' },
          ].map((step, i) => (
            <div key={i} className="ap-benefit-item">
              <span className="ap-step-number">{i + 1}</span>
              <div>
                <strong style={{ color: '#fff', fontSize: '.875rem', display: 'block' }}>{step.title}</strong>
                <span style={{ color: '#8E99A8', fontSize: '.8125rem' }}>{step.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ background: '#0A1F44', border: '1px solid #1e3a6e', borderRadius: '1rem', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '.5rem' }}>
            Questions?
          </h3>
          <p style={{ color: '#C0C0C0', fontSize: '.875rem', lineHeight: 1.6, margin: 0 }}>
            Email us at{' '}
            <a href="mailto:dealers@autoportal360.com" style={{ color: '#00D4FF' }}>
              dealers@autoportal360.com
            </a>
          </p>
        </div>
      </div>

    </div>
  )
}
