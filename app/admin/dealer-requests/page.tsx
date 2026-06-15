'use client'

import { useState, useEffect, useCallback } from 'react'
import { toSlug } from '@/types/dealer'

interface DealerRequest {
  id: string
  dealer_name: string
  brand_name: string
  brand_slug: string | null
  contact_person: string
  phone: string
  email: string
  city: string
  state: string
  address: string
  locality: string | null
  pincode: string | null
  vehicle_types: string[]
  website: string | null
  google_maps_url: string | null
  working_hours: string | null
  message: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'] as const
type StatusTab = typeof STATUS_TABS[number]

const STATUS_COLORS: Record<string, string> = {
  pending:  '#FFB400',
  approved: '#2ECC71',
  rejected: '#FF4D4F',
}

export default function DealerRequestsPage() {
  const [tab, setTab]             = useState<StatusTab>('pending')
  const [requests, setRequests]   = useState<DealerRequest[]>([])
  const [counts, setCounts]       = useState<Record<string, number>>({ all: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected]   = useState<DealerRequest | null>(null)
  const [editStatus, setEditStatus] = useState<string>('pending')
  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving]       = useState(false)
  const [approving, setApproving] = useState(false)
  const [toast, setToast]         = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const statusParam = tab === 'all' ? '' : `&status=${tab}`
      const res = await fetch(`/api/dealer-requests?page=${page}&per_page=15${statusParam}`)
      const json = await res.json()
      setRequests(json.requests ?? [])
      setTotalPages(json.total_pages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [tab, page])

  const fetchCounts = useCallback(async () => {
    const statuses: StatusTab[] = ['pending', 'approved', 'rejected']
    const [allRes, ...statusRes] = await Promise.all([
      fetch('/api/dealer-requests?per_page=1').then(r => r.json()),
      ...statuses.map(s => fetch(`/api/dealer-requests?status=${s}&per_page=1`).then(r => r.json())),
    ])
    setCounts({
      all:      allRes.total      ?? 0,
      pending:  statusRes[0].total ?? 0,
      approved: statusRes[1].total ?? 0,
      rejected: statusRes[2].total ?? 0,
    })
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])
  useEffect(() => { fetchCounts() },  [fetchCounts])

  const openModal = (req: DealerRequest) => {
    setSelected(req)
    setEditStatus(req.status)
    setAdminNotes(req.admin_notes ?? '')
  }

  const closeModal = () => setSelected(null)

  const saveStatus = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dealer-requests/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, admin_notes: adminNotes }),
      })
      if (!res.ok) throw new Error('Save failed')
      showToast('Status updated')
      closeModal()
      fetchRequests()
      fetchCounts()
    } catch {
      showToast('Error saving status')
    } finally {
      setSaving(false)
    }
  }

  const approveAndCreate = async () => {
    if (!selected) return
    setApproving(true)
    try {
      const brandSlug = selected.brand_slug || toSlug(selected.brand_name)
      const citySlug  = toSlug(selected.city)

      const dealerRes = await fetch('/api/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:            selected.dealer_name,
          brand_slug:      brandSlug,
          brand_name:      selected.brand_name,
          city:            selected.city,
          city_slug:       citySlug,
          state:           selected.state,
          address:         selected.address,
          locality:        selected.locality,
          pincode:         selected.pincode,
          phone:           selected.phone,
          email:           selected.email,
          website:         selected.website,
          google_maps_url: selected.google_maps_url,
          vehicle_types:   selected.vehicle_types,
          working_hours:   selected.working_hours,
          is_authorized:   true,
          is_active:       true,
        }),
      })

      if (!dealerRes.ok) {
        const j = await dealerRes.json()
        throw new Error(j.error ?? 'Failed to create dealer')
      }

      await fetch(`/api/dealer-requests/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', admin_notes: adminNotes || 'Dealer created via admin approval.' }),
      })

      showToast('Dealer created and request approved!')
      closeModal()
      fetchRequests()
      fetchCounts()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error creating dealer')
    } finally {
      setApproving(false)
    }
  }

  const rejectRequest = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await fetch(`/api/dealer-requests/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', admin_notes: adminNotes }),
      })
      showToast('Request rejected')
      closeModal()
      fetchRequests()
      fetchCounts()
    } finally {
      setSaving(false)
    }
  }

  const deleteRequest = async () => {
    if (!selected) return
    if (!confirm(`Delete request from "${selected.dealer_name}"? This cannot be undone.`)) return
    try {
      await fetch(`/api/dealer-requests/${selected.id}`, { method: 'DELETE' })
      showToast('Request deleted')
      closeModal()
      fetchRequests()
      fetchCounts()
    } catch {
      showToast('Error deleting request')
    }
  }

  const panelStyle: React.CSSProperties = {
    background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
    borderRadius: '16px', overflow: 'hidden',
  }

  const thStyle: React.CSSProperties = {
    padding: '14px 16px', textAlign: 'left', color: '#8E99A8',
    fontWeight: 700, fontSize: '11px', textTransform: 'uppercase',
    letterSpacing: '0.5px', whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '14px 16px', fontSize: '13px',
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
          background: '#0A1F44', border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: '10px', padding: '12px 20px', color: '#fff',
          fontSize: '13px', fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}

      <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
        Dealer Requests
      </h1>
      <p style={{ fontSize: '13px', color: '#8E99A8', margin: '0 0 28px' }}>
        Showroom owners requesting to be listed on AutoPortal360
      </p>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => { setTab(s); setPage(1) }}
            style={{
              padding: '7px 18px', borderRadius: '9999px', fontSize: '13px',
              fontWeight: tab === s ? 700 : 500, cursor: 'pointer',
              border: `1px solid ${tab === s ? '#00D4FF' : '#1e3a6e'}`,
              background: tab === s ? '#00D4FF' : 'transparent',
              color: tab === s ? '#06142D' : '#C0C0C0',
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span style={{
              marginLeft: '6px', fontSize: '11px', fontWeight: 700,
              background: tab === s ? 'rgba(0,0,0,0.15)' : 'rgba(0,212,255,0.12)',
              color: tab === s ? '#06142D' : '#00D4FF',
              padding: '1px 7px', borderRadius: '9999px',
            }}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={panelStyle}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8E99A8' }}>Loading…</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8E99A8' }}>
            No {tab === 'all' ? '' : tab} requests yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                  <th style={thStyle}>Dealer Name</th>
                  <th style={thStyle}>Brand</th>
                  <th style={thStyle}>City / State</th>
                  <th style={thStyle}>Contact</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Submitted</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr
                    key={req.id}
                    style={{
                      borderBottom: i < requests.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none',
                      borderLeft: req.status === 'pending' ? '3px solid #FFB400' : '3px solid transparent',
                    }}
                  >
                    <td style={{ ...tdStyle, color: '#fff', fontWeight: 600 }}>{req.dealer_name}</td>
                    <td style={{ ...tdStyle, color: '#C0C0C0' }}>{req.brand_name}</td>
                    <td style={{ ...tdStyle, color: '#C0C0C0' }}>{req.city}, {req.state}</td>
                    <td style={{ ...tdStyle, color: '#C0C0C0' }}>{req.contact_person}</td>
                    <td style={{ ...tdStyle, color: '#C0C0C0' }}>{req.phone}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                        borderRadius: '9999px', textTransform: 'uppercase',
                        background: `${STATUS_COLORS[req.status]}18`,
                        color: STATUS_COLORS[req.status],
                        border: `1px solid ${STATUS_COLORS[req.status]}40`,
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#8E99A8', whiteSpace: 'nowrap' }}>
                      {new Date(req.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => openModal(req)}
                        style={{
                          background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
                          border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px',
                          padding: '5px 14px', fontSize: '12px', fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '1.5rem' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            style={{
              padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: '1px solid #1e3a6e', background: 'transparent', color: '#C0C0C0',
              cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1,
            }}
          >
            ← Previous
          </button>
          <span style={{ padding: '8px 16px', color: '#8E99A8', fontSize: '13px' }}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: '1px solid #1e3a6e', background: 'transparent', color: '#C0C0C0',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1,
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── MODAL ── */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.75)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{
            background: '#0A1F44', border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: '16px', width: '100%', maxWidth: '680px',
            maxHeight: '90vh', overflow: 'auto', padding: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.125rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                {selected.dealer_name}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#8E99A8', cursor: 'pointer', fontSize: '1.25rem', padding: '0 0 0 1rem' }}>✕</button>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                ['Brand', selected.brand_name],
                ['Contact', selected.contact_person],
                ['Phone', selected.phone],
                ['Email', selected.email],
                ['City', selected.city],
                ['State', selected.state],
                ['Pincode', selected.pincode ?? '—'],
                ['Locality', selected.locality ?? '—'],
                ['Vehicle Types', selected.vehicle_types.join(', ')],
                ['Working Hours', selected.working_hours ?? '—'],
                ['Website', selected.website ?? '—'],
                ['Google Maps', selected.google_maps_url ? 'Provided' : '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: '13px', color: '#fff' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Address */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '3px' }}>Address</div>
              <div style={{ fontSize: '13px', color: '#fff' }}>{selected.address}</div>
            </div>

            {/* Message */}
            {selected.message && (
              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#06142D', borderRadius: '8px', border: '1px solid #1e3a6e' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>Message</div>
                <div style={{ fontSize: '13px', color: '#C0C0C0' }}>{selected.message}</div>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #1e3a6e', margin: '1.25rem 0' }} />

            {/* Status & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="ap-select-field"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>
                  Submitted
                </label>
                <div style={{ fontSize: '13px', color: '#C0C0C0', paddingTop: '10px' }}>
                  {new Date(selected.created_at).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8E99A8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                className="ap-textarea"
                placeholder="Internal notes about this request…"
                style={{ minHeight: '4.5rem' }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={saveStatus}
                disabled={saving}
                style={{
                  background: '#00D4FF', color: '#06142D', border: 'none',
                  borderRadius: '10px', padding: '10px 20px', fontWeight: 700,
                  fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save Status'}
              </button>

              <button
                onClick={approveAndCreate}
                disabled={approving}
                style={{
                  background: 'rgba(46,204,113,0.15)', color: '#2ECC71',
                  border: '1px solid rgba(46,204,113,0.4)', borderRadius: '10px',
                  padding: '10px 20px', fontWeight: 700, fontSize: '13px',
                  cursor: approving ? 'not-allowed' : 'pointer',
                  opacity: approving ? 0.6 : 1,
                }}
              >
                {approving ? 'Creating…' : '✓ Approve & Create Dealer'}
              </button>

              <button
                onClick={rejectRequest}
                disabled={saving}
                style={{
                  background: 'rgba(255,77,79,0.12)', color: '#FF4D4F',
                  border: '1px solid rgba(255,77,79,0.3)', borderRadius: '10px',
                  padding: '10px 18px', fontWeight: 700, fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Reject
              </button>

              <button
                onClick={deleteRequest}
                style={{
                  marginLeft: 'auto', background: 'transparent', color: '#8E99A8',
                  border: '1px solid #1e3a6e', borderRadius: '10px',
                  padding: '10px 18px', fontWeight: 600, fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Delete Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
