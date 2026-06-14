import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminDashboard() {
  // Parallel stat fetches — leads table may not exist yet, handled below
  const [brands, models, variants, leads, dealers, leadsRows] = await Promise.all([
    db.from('brands').select('*', { count: 'exact', head: true }),
    db.from('models').select('*', { count: 'exact', head: true }),
    db.from('variants').select('*', { count: 'exact', head: true }),
    db.from('leads').select('*', { count: 'exact', head: true }),
    db.from('dealers').select('*', { count: 'exact', head: true }),
    db.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total Brands',   value: brands.count   ?? 0, href: '/admin/brands',  color: '#00D4FF' },
    { label: 'Total Models',   value: models.count   ?? 0, href: '/admin/models',  color: '#00D4FF' },
    { label: 'Total Variants', value: variants.count ?? 0, href: '/admin/models',  color: '#00D4FF' },
    { label: 'Total Dealers',  value: dealers.count  ?? 0, href: '/admin/dealers', color: '#A855F7' },
    { label: 'Total Leads',    value: leads.count    ?? 0, href: '/admin/leads',   color: '#FFB400' },
  ]

  const recentLeads = leadsRows.data ?? []
  const leadsExist  = !leadsRows.error

  const LABEL: Record<string, string> = {
    name: 'Name', email: 'Email', phone: 'Phone', model: 'Model', created_at: 'Date',
  }
  const COLS = ['name', 'email', 'phone', 'model', 'created_at']

  return (
    <div>
      {/* Page title */}
      <h1 style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: '28px',
        fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px',
      }}>
        Dashboard
      </h1>
      <p style={{ fontSize: '13px', color: '#8E99A8', margin: '0 0 36px' }}>
        AutoPortal360 admin overview
      </p>

      {/* ── STAT CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
        gap: '16px', marginBottom: '40px',
      }}>
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#0A1F44',
              border: '1px solid rgba(0,212,255,0.1)',
              borderRadius: '16px', padding: '24px',
            }}>
              <div style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '40px', fontWeight: 900,
                color: stat.color, marginBottom: '8px', lineHeight: 1,
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: '#8E99A8', fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '15px',
          fontWeight: 800, color: '#FFFFFF', margin: '0 0 14px',
        }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/admin/brands/new" style={{
            background: '#00D4FF', color: '#06142D',
            fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
            fontSize: '13px', padding: '11px 22px',
            borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            + Add Brand
          </Link>
          <Link href="/admin/models/new" style={{
            background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
            fontFamily: 'Montserrat, sans-serif', fontWeight: 800,
            fontSize: '13px', padding: '11px 22px', borderRadius: '10px',
            border: '1px solid rgba(0,212,255,0.2)', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            + Add Model
          </Link>
          <Link href="/admin/leads" style={{
            background: 'rgba(255,180,0,0.08)', color: '#FFB400',
            fontFamily: 'Montserrat, sans-serif', fontWeight: 800,
            fontSize: '13px', padding: '11px 22px', borderRadius: '10px',
            border: '1px solid rgba(255,180,0,0.2)', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            View Leads
          </Link>
        </div>
      </div>

      {/* ── RECENT LEADS ── */}
      <div>
        <h2 style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: '15px',
          fontWeight: 800, color: '#FFFFFF', margin: '0 0 14px',
        }}>
          Recent Leads
        </h2>

        {!leadsExist ? (
          <div style={{
            background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: '16px', padding: '32px', textAlign: 'center',
            color: '#8E99A8', fontSize: '13px',
          }}>
            No leads table yet — it will appear here once you add a leads form.
          </div>
        ) : recentLeads.length === 0 ? (
          <div style={{
            background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: '16px', padding: '32px', textAlign: 'center',
            color: '#8E99A8', fontSize: '13px',
          }}>
            No leads yet. They&apos;ll appear here once users submit enquiry forms.
          </div>
        ) : (
          <div style={{
            background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: '16px', overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                  {COLS.map(col => (
                    <th key={col} style={{
                      padding: '14px 20px', textAlign: 'left',
                      color: '#8E99A8', fontWeight: 700,
                      fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      {LABEL[col]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead: Record<string, unknown>, i: number) => (
                  <tr
                    key={String(lead.id ?? i)}
                    style={{ borderBottom: i < recentLeads.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}
                  >
                    <td style={{ padding: '14px 20px', color: '#FFFFFF' }}>
                      {String(lead.name ?? '—')}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#C0C0C0' }}>
                      {String(lead.email ?? '—')}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#C0C0C0' }}>
                      {String(lead.phone ?? '—')}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#C0C0C0' }}>
                      {String(lead.model ?? '—')}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#8E99A8' }}>
                      {lead.created_at
                        ? new Date(String(lead.created_at)).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
