'use client'

import { createBrowserClient } from '@supabase/ssr'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { dbUpdate } from '@/lib/admin-db'

const TH: React.CSSProperties = {
  padding: '12px 14px', textAlign: 'left',
  color: '#8E99A8', fontWeight: 700,
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
}
const TD: React.CSSProperties = {
  padding: '11px 14px', color: '#C0C0C0', verticalAlign: 'middle', fontSize: 13,
}

const STATUS_CONFIG = {
  new:       { bg: 'rgba(255,180,0,0.08)',  text: '#FFB400', border: 'rgba(255,180,0,0.2)'  },
  contacted: { bg: 'rgba(0,212,255,0.08)',  text: '#00D4FF', border: 'rgba(0,212,255,0.2)'  },
  converted: { bg: 'rgba(0,204,102,0.08)', text: '#00CC66', border: 'rgba(0,204,102,0.2)'  },
} as const

type Status = keyof typeof STATUS_CONFIG
const STATUS_TABS: (Status | 'all')[] = ['all', 'new', 'contacted', 'converted']

interface Lead {
  id: string
  name: string
  phone: string
  email: string
  city: string
  model_slug: string
  brand_name?: string | null
  model_name?: string | null
  variant_name?: string | null
  source_page?: string | null
  source_url?: string | null
  message?: string | null
  status: Status
  created_at?: string
}

export default function LeadsClient() {
  const sbRef = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const sb = sbRef.current

  const [leads,        setLeads]        = useState<Lead[]>([])
  const [loading,      setLoading]      = useState(true)
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [search,       setSearch]       = useState('')
  const [expandedId,   setExpandedId]   = useState<string | null>(null)
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    let q = sb.from('leads').select('*').order('created_at', { ascending: false })
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    const { data, error } = await q
    if (error) { showToast(error.message, false); setLoading(false); return }
    setLeads((data ?? []).map(l => ({ ...l, status: (l.status ?? 'new') as Status })))
    setLoading(false)
  }, [sb, statusFilter, showToast])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const filtered = search
    ? leads.filter(l => {
        const s = search.toLowerCase()
        return l.name.toLowerCase().includes(s)
          || l.phone.includes(s)
          || l.email.toLowerCase().includes(s)
      })
    : leads

  async function updateStatus(id: string, status: Status) {
    try {
      await dbUpdate('leads', id, { status })
      setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l))
      showToast(`Marked as ${status}`, true)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Update failed', false)
    }
  }

  function exportCsv() {
    const headers = ['Name', 'Phone', 'Email', 'City', 'Brand', 'Model', 'Variant', 'Status', 'Date', 'Source Page']
    const rows = filtered.map(l => [
      l.name, l.phone, l.email, l.city,
      l.brand_name ?? '',
      l.model_name ?? l.model_slug ?? '',
      l.variant_name ?? '',
      l.status,
      l.created_at ? new Date(l.created_at).toLocaleDateString('en-IN') : '',
      l.source_page ?? l.source_url ?? '',
    ])
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `leads-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>

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

      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: '28px', gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '26px',
            fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px',
          }}>
            Leads
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
            {search ? ` matching "${search}"` : ''}
          </p>
        </div>
        <button onClick={exportCsv} style={{
          background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
          border: '1px solid rgba(0,212,255,0.2)',
          fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
          fontSize: '13px', padding: '11px 22px',
          borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          ↓ Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {STATUS_TABS.map(tab => {
            const active = statusFilter === tab
            return (
              <button key={tab} onClick={() => setStatusFilter(tab)} style={{
                padding: '7px 14px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
                cursor: 'pointer',
                background: active ? '#00D4FF' : 'rgba(0,212,255,0.06)',
                color: active ? '#06142D' : '#C0C0C0',
                border: `1px solid ${active ? 'transparent' : 'rgba(0,212,255,0.12)'}`,
              }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          })}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            style={{
              background: 'rgba(0,212,255,0.04)',
              border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: '10px', padding: '8px 14px',
              color: '#FFFFFF', fontSize: '13px', outline: 'none', width: '240px',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              background: 'rgba(255,255,255,0.04)', color: '#8E99A8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '8px 14px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      <div style={{
        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: '16px', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '56px', textAlign: 'center', color: '#8E99A8', fontSize: 13 }}>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '56px', textAlign: 'center', color: '#8E99A8', fontSize: 13 }}>
            No leads found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                <th style={TH}>Name</th>
                <th style={TH}>Phone</th>
                <th style={TH}>Email</th>
                <th style={TH}>City</th>
                <th style={TH}>Brand / Model</th>
                <th style={TH}>Variant</th>
                <th style={TH}>Date</th>
                <th style={TH}>Status</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const sc        = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.new
                const isExpanded = expandedId === lead.id
                return (
                  <React.Fragment key={lead.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                      style={{
                        borderBottom: '1px solid rgba(0,212,255,0.06)',
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(0,212,255,0.03)' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                    >
                      <td style={{ ...TD, color: '#FFFFFF', fontWeight: 600 }}>
                        <span style={{ marginRight: 6, opacity: 0.5, fontSize: 10 }}>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        {lead.name}
                      </td>
                      <td style={{ ...TD, fontFamily: 'monospace' }}>{lead.phone}</td>
                      <td style={{ ...TD, fontSize: 12 }}>{lead.email}</td>
                      <td style={TD}>{lead.city}</td>
                      <td style={{ ...TD, fontSize: 12 }}>
                        {lead.brand_name && lead.model_name
                          ? <><span style={{ color: '#FFFFFF', fontWeight: 600 }}>{lead.brand_name}</span>{' '}{lead.model_name}</>
                          : <span style={{ fontFamily: 'monospace' }}>{lead.model_slug ?? '—'}</span>
                        }
                      </td>
                      <td style={{ ...TD, fontSize: 12, color: '#8E99A8' }}>{lead.variant_name || '—'}</td>
                      <td style={{ ...TD, fontSize: 12, whiteSpace: 'nowrap' }}>
                        {lead.created_at
                          ? new Date(lead.created_at).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                      <td style={TD}>
                        <span style={{
                          background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        }}>
                          {lead.status}
                        </span>
                      </td>
                      <td style={TD} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {lead.status !== 'contacted' && (
                            <button onClick={() => updateStatus(lead.id, 'contacted')} style={{
                              background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
                              border: '1px solid rgba(0,212,255,0.2)',
                              borderRadius: '6px', padding: '4px 10px',
                              fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}>
                              Contacted
                            </button>
                          )}
                          {lead.status !== 'converted' && (
                            <button onClick={() => updateStatus(lead.id, 'converted')} style={{
                              background: 'rgba(0,204,102,0.08)', color: '#00CC66',
                              border: '1px solid rgba(0,204,102,0.2)',
                              borderRadius: '6px', padding: '4px 10px',
                              fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}>
                              Converted
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr style={{
                        background: 'rgba(0,212,255,0.015)',
                        borderBottom: '1px solid rgba(0,212,255,0.1)',
                      }}>
                        <td colSpan={9} style={{ padding: '16px 24px' }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '16px',
                          }}>
                            {([
                              ['Full Name',    lead.name],
                              ['Phone',        lead.phone],
                              ['Email',        lead.email],
                              ['City',         lead.city],
                              ['Brand',        lead.brand_name ?? '—'],
                              ['Model',        lead.model_name ?? lead.model_slug ?? '—'],
                              ['Variant',      lead.variant_name ?? '—'],
                              ['Message',      lead.message ?? '—'],
                              ['Source Page',  lead.source_page ?? lead.source_url ?? '—'],
                              ['Lead ID',      lead.id],
                              ...(lead.created_at ? [['Submitted', new Date(lead.created_at).toLocaleString('en-IN')] as [string,string]] : []),
                            ] as [string,string][]).map(([label, val]) => (
                              <div key={label}>
                                <div style={{
                                  fontSize: 10, color: '#8E99A8',
                                  textTransform: 'uppercase', letterSpacing: '0.5px',
                                  fontWeight: 700, marginBottom: 4,
                                }}>
                                  {label}
                                </div>
                                <div style={{
                                  fontSize: 12, color: '#C0C0C0',
                                  wordBreak: 'break-all',
                                  fontFamily: label === 'Lead ID' || label === 'Source Page'
                                    ? 'monospace' : 'inherit',
                                }}>
                                  {val || '—'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
