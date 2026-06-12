import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

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

const TIER_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  metro: { bg: 'rgba(255,180,0,0.08)',  text: '#FFB400', border: 'rgba(255,180,0,0.2)'  },
  tier1: { bg: 'rgba(0,212,255,0.08)',  text: '#00D4FF', border: 'rgba(0,212,255,0.2)'  },
  tier2: { bg: 'rgba(0,255,128,0.06)',  text: '#00CC66', border: 'rgba(0,255,128,0.2)'  },
  tier3: { bg: 'rgba(255,255,255,0.04)',text: '#8E99A8', border: 'rgba(255,255,255,0.1)'},
}

type Props = { searchParams: Promise<{ state?: string; q?: string }> }

export default async function CitiesPage({ searchParams }: Props) {
  const { state: stateFilter = '', q = '' } = await searchParams

  const [{ data: states = [] }] = await Promise.all([
    db.from('states').select('id, name').order('name'),
  ])

  let query = db
    .from('cities')
    .select('*, states(name, rto_percentage)')
    .order('name')
  if (stateFilter) query = query.eq('state_id', stateFilter)
  if (q) query = query.ilike('name', `%${q}%`)
  const { data: cities = [] } = await query

  const selectedState = (states ?? []).find((s: { id: string; name: string }) => s.id === stateFilter)

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
            Cities
            {selectedState && (
              <span style={{ color: '#00D4FF', fontSize: '18px', fontWeight: 700, marginLeft: 10 }}>
                — {selectedState.name}
              </span>
            )}
          </h1>
          <p style={{ fontSize: '13px', color: '#8E99A8', margin: 0 }}>
            {cities?.length ?? 0} cit{(cities?.length ?? 0) !== 1 ? 'ies' : 'y'}
            {q ? ` matching "${q}"` : ''} · Featured cities appear in price calculator
          </p>
        </div>
        <Link href="/admin/cities/new" style={{
          background: '#00D4FF', color: '#06142D',
          fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
          fontSize: '13px', padding: '11px 22px',
          borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          + Add City
        </Link>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* State filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Link href="/admin/cities" style={{
            padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
            textDecoration: 'none', whiteSpace: 'nowrap',
            background: !stateFilter ? '#00D4FF' : 'rgba(0,212,255,0.06)',
            color: !stateFilter ? '#06142D' : '#C0C0C0',
            border: `1px solid ${!stateFilter ? 'transparent' : 'rgba(0,212,255,0.12)'}`,
          }}>
            All States
          </Link>
          {(states ?? []).map((s: { id: string; name: string }) => (
            <Link key={s.id} href={`/admin/cities?state=${s.id}`} style={{
              padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
              textDecoration: 'none', whiteSpace: 'nowrap',
              background: stateFilter === s.id ? '#00D4FF' : 'rgba(0,212,255,0.06)',
              color: stateFilter === s.id ? '#06142D' : '#C0C0C0',
              border: `1px solid ${stateFilter === s.id ? 'transparent' : 'rgba(0,212,255,0.12)'}`,
            }}>
              {s.name}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="GET" action="/admin/cities" style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {stateFilter && <input type="hidden" name="state" value={stateFilter} />}
          <input
            type="text" name="q" defaultValue={q}
            placeholder="Search city…"
            style={{
              background: 'rgba(0,212,255,0.04)',
              border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: '10px', padding: '8px 14px',
              color: '#FFFFFF', fontSize: '13px', outline: 'none', width: '200px',
            }}
          />
          <button type="submit" style={{
            background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '10px', padding: '8px 16px',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          }}>Search</button>
        </form>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: '#0A1F44', border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: '16px', overflow: 'hidden',
      }}>
        {cities && cities.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                <th style={TH}>City</th>
                <th style={TH}>State</th>
                <th style={{ ...TH, textAlign: 'center' }}>RTO %</th>
                <th style={TH}>Tier</th>
                <th style={{ ...TH, textAlign: 'center' }}>Featured</th>
                <th style={TH}>Active</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city, i) => {
                const stateData = city.states as { name: string; rto_percentage: number } | null
                const tier = city.population_tier ?? 'tier2'
                const tc = TIER_COLOR[tier] ?? TIER_COLOR.tier2
                return (
                  <tr
                    key={city.id}
                    style={{ borderBottom: i < cities.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}
                  >
                    <td style={{ ...TD, color: '#FFFFFF', fontWeight: 600 }}>{city.name}</td>
                    <td style={{ ...TD, fontSize: 12 }}>{stateData?.name ?? '—'}</td>
                    <td style={{ ...TD, textAlign: 'center' }}>
                      {stateData?.rto_percentage != null ? (
                        <span style={{
                          background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
                          border: '1px solid rgba(0,212,255,0.2)',
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 12, fontWeight: 700,
                        }}>
                          {stateData.rto_percentage}%
                        </span>
                      ) : '—'}
                    </td>
                    <td style={TD}>
                      <span style={{
                        background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      }}>
                        {tier}
                      </span>
                    </td>
                    <td style={{ ...TD, textAlign: 'center' }}>
                      {city.is_featured ? (
                        <span style={{ color: '#FFB400', fontSize: 16 }}>★</span>
                      ) : (
                        <span style={{ color: '#333', fontSize: 16 }}>☆</span>
                      )}
                    </td>
                    <td style={TD}>
                      <span style={{
                        background: city.is_active !== false ? 'rgba(0,255,128,0.08)' : 'rgba(255,80,80,0.08)',
                        color: city.is_active !== false ? '#00CC66' : '#FF8080',
                        border: `1px solid ${city.is_active !== false ? 'rgba(0,255,128,0.2)' : 'rgba(255,80,80,0.2)'}`,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {city.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={TD}>
                      <Link href={`/admin/cities/${city.id}`} style={{
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
            No cities found.{' '}
            <Link href="/admin/cities/new" style={{ color: '#00D4FF', textDecoration: 'none' }}>
              Add the first city →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
