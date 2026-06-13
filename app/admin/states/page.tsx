import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { getAdminUser, hasPermission } from '@/lib/admin-auth'
import AccessDenied from '@/app/admin/AccessDenied'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TH: React.CSSProperties = {
  padding: '12px 16px', textAlign: 'left',
  color: '#8E99A8', fontWeight: 700,
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
}
const TD: React.CSSProperties = {
  padding: '12px 16px', color: '#C0C0C0', verticalAlign: 'middle',
}

export default async function StatesPage() {
  const admin = await getAdminUser()
  if (!admin || !hasPermission(admin.role, 'states')) return <AccessDenied section="States" />

  const [{ data: states = [] }, { data: citiesRaw = [] }] = await Promise.all([
    db.from('states').select('*').order('name'),
    db.from('cities').select('state_id'),
  ])

  const cityCount = new Map<string, number>()
  ;(citiesRaw ?? []).forEach(c =>
    cityCount.set(c.state_id, (cityCount.get(c.state_id) ?? 0) + 1)
  )

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: '28px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: '26px',
            fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px',
          }}>
            States
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            {states?.length ?? 0} state{states?.length !== 1 ? 's' : ''} · RTO rates used in price calculator
          </p>
        </div>
        <Link href="/admin/states/new" style={{
          background: '#00D4FF', color: '#06142D',
          fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
          fontSize: '13px', padding: '11px 22px',
          borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          + Add State
        </Link>
      </div>

      <div style={{
        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: '16px', overflow: 'hidden',
      }}>
        {states && states.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                <th style={TH}>State Name</th>
                <th style={TH}>Slug</th>
                <th style={{ ...TH, textAlign: 'center' }}>RTO %</th>
                <th style={{ ...TH, textAlign: 'right' }}>Handling (₹)</th>
                <th style={{ ...TH, textAlign: 'center' }}>Cities</th>
                <th style={TH}>Active</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {states.map((s, i) => {
                const count = cityCount.get(s.id) ?? 0
                return (
                  <tr
                    key={s.id}
                    style={{ borderBottom: i < states.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}
                  >
                    <td style={{ ...TD, color: '#FFFFFF', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ ...TD, fontFamily: 'monospace', fontSize: 12 }}>{s.slug}</td>
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <span style={{
                        background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
                        border: '1px solid rgba(0,212,255,0.2)',
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {s.rto_percentage}%
                      </span>
                    </td>
                    <td style={{ ...TD, textAlign: 'right', fontFamily: 'monospace', fontSize: 12 }}>
                      ₹{Number(s.handling_charge).toLocaleString('en-IN')}
                    </td>
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <Link href={`/admin/cities?state=${s.id}`} style={{
                        background: count > 0 ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.04)',
                        color: count > 0 ? '#00D4FF' : '#555',
                        padding: '2px 10px', borderRadius: 12,
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      }}>
                        {count}
                      </Link>
                    </td>
                    <td style={TD}>
                      <span style={{
                        background: s.is_active !== false ? 'rgba(0,255,128,0.08)' : 'rgba(255,80,80,0.08)',
                        color: s.is_active !== false ? '#00CC66' : '#FF8080',
                        border: `1px solid ${s.is_active !== false ? 'rgba(0,255,128,0.2)' : 'rgba(255,80,80,0.2)'}`,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {s.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={TD}>
                      <Link href={`/admin/states/${s.id}`} style={{
                        background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
                        border: '1px solid rgba(0,212,255,0.2)',
                        padding: '6px 14px', borderRadius: 8,
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      }}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '56px', textAlign: 'center', color: '#8E99A8', fontSize: 13 }}>
            No states yet.{' '}
            <Link href="/admin/states/new" style={{ color: '#00D4FF', textDecoration: 'none' }}>
              Add the first state →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
